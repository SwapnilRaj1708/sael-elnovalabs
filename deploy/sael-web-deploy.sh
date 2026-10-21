#!/usr/bin/env bash
#
# Deploys a release archive of the SAEL website on the VM, or rolls the last one back.
#
#   sudo sael-web-deploy <tarball> [expected-sha256]
#   sudo sael-web-deploy --rollback
#
# Installed once as /usr/local/bin/sael-web-deploy (see README.md, "Deployment"). It performs the
# manual deploy steps in order: hash, extract into sael-web.new, ownership, image-cache link,
# swap with the running release (kept as sael-web.prev), and a health check. An unhealthy start
# is rolled back automatically. A healthy one is followed by the image warm-up, whose failure
# is only a warning.
#
# It removes only sael-web.new, sael-web.prev and sael-web.failed-*. It never deletes anything
# under /var/lib/sael-web, and does not touch nginx or the backend.
#
# The SAEL_DEPLOY_* variables below exist for testing this script on a workstation. sudo drops
# them from the environment by default, so on the VM the production values always apply.

set -euo pipefail

readonly SERVICE=sael-web
readonly WWW_DIR="${SAEL_DEPLOY_WWW_DIR:-/var/www}"
readonly IMAGE_CACHE="${SAEL_DEPLOY_IMAGE_CACHE:-/var/lib/sael-web/cache/images}"
readonly SERVICE_CMD="${SAEL_DEPLOY_SERVICE_CMD:-systemctl}"
readonly BASE_URL="${SAEL_DEPLOY_BASE_URL:-http://127.0.0.1:3000}"
readonly NODE_BIN="${SAEL_DEPLOY_NODE:-/usr/bin/node}"
readonly APP_USER="${SAEL_DEPLOY_USER:-saelapp}"
readonly APP_GROUP="${SAEL_DEPLOY_GROUP:-saelapp}"
readonly REQUIRE_ROOT="${SAEL_DEPLOY_REQUIRE_ROOT:-1}"

readonly CURRENT="$WWW_DIR/sael-web"
readonly NEW="$WWW_DIR/sael-web.new"
readonly PREV="$WWW_DIR/sael-web.prev"
readonly HEALTH_URL="$BASE_URL/api/health/"
readonly HEALTH_DEADLINE_SECONDS=60
readonly HEALTH_INTERVAL_SECONDS=2

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

die() {
  log "ERROR: $*" >&2
  exit 1
}

usage() {
  cat >&2 <<'EOF'
usage: sudo sael-web-deploy <tarball> [expected-sha256]
       sudo sael-web-deploy --rollback
EOF
  exit 2
}

announce_overrides() {
  local name
  for name in SAEL_DEPLOY_WWW_DIR SAEL_DEPLOY_IMAGE_CACHE SAEL_DEPLOY_SERVICE_CMD \
    SAEL_DEPLOY_BASE_URL SAEL_DEPLOY_NODE SAEL_DEPLOY_USER SAEL_DEPLOY_GROUP \
    SAEL_DEPLOY_REQUIRE_ROOT; do
    if [[ -n "${!name:-}" ]]; then
      log "NOTE: test override in effect: $name=${!name}"
    fi
  done
}

require_root() {
  if [[ "$REQUIRE_ROOT" == "1" && "$EUID" -ne 0 ]]; then
    die "must run as root: sudo sael-web-deploy ..."
  fi
}

# The only directories this script ever removes.
remove_release_dir() {
  local dir="$1"
  case "$dir" in
    "$NEW" | "$PREV" | "$WWW_DIR"/sael-web.failed-*) rm -rf -- "$dir" ;;
    *) die "refusing to remove $dir" ;;
  esac
}

owner_of() {
  stat -c '%U' "$1" 2>/dev/null || stat -f '%Su' "$1"
}

is_healthy() {
  local body
  body="$(curl -fsS --max-time 5 "$HEALTH_URL" 2>/dev/null)" || return 1
  [[ "$body" =~ \"status\"[[:space:]]*:[[:space:]]*\"ok\" ]]
}

wait_for_health() {
  local deadline=$((SECONDS + HEALTH_DEADLINE_SECONDS))
  while true; do
    if is_healthy; then
      return 0
    fi
    if ((SECONDS + HEALTH_INTERVAL_SECONDS > deadline)); then
      return 1
    fi
    sleep "$HEALTH_INTERVAL_SECONDS"
  done
}

start_service() {
  if ! "$SERVICE_CMD" start "$SERVICE"; then
    log "WARNING: '$SERVICE_CMD start $SERVICE' failed; the health check decides"
  fi
}

# Moves the running release aside as sael-web.failed-<timestamp> and puts sael-web.prev back.
restore_previous() {
  local failed
  failed="$WWW_DIR/sael-web.failed-$(date '+%Y%m%d-%H%M%S')"
  [[ -d "$PREV" ]] || die "no $PREV to roll back to; $CURRENT left in place"
  "$SERVICE_CMD" stop "$SERVICE" || log "WARNING: '$SERVICE_CMD stop $SERVICE' failed"
  if [[ -e "$CURRENT" ]]; then
    mv -- "$CURRENT" "$failed"
    log "moved the failed release to $failed"
  fi
  mv -- "$PREV" "$CURRENT"
  log "restored $PREV as $CURRENT"
  start_service
}

rollback() {
  log "rollback: restoring $PREV"
  restore_previous
  log "health check on $HEALTH_URL (up to ${HEALTH_DEADLINE_SECONDS}s)"
  if wait_for_health; then
    log "rollback: healthy"
    log "summary: rollback health=ok release=$CURRENT"
    exit 0
  fi
  log "summary: rollback health=FAILED release=$CURRENT"
  die "rolled back, but $SERVICE is not healthy; check: journalctl -u $SERVICE"
}

deploy() {
  local tarball="$1" expected="${2:-}"
  local actual link_target cache_owner warm_output warm_status warm_summary

  [[ -f "$tarball" ]] || die "tarball not found: $tarball"
  if [[ -n "$expected" ]]; then
    expected="$(printf '%s' "$expected" | tr '[:upper:]' '[:lower:]')"
    [[ "$expected" =~ ^[0-9a-f]{64}$ ]] || die "expected hash is not a SHA-256: $expected"
  fi

  log "step 1/8: sha256 of $tarball"
  actual="$(sha256sum -- "$tarball" | cut -d' ' -f1)"
  log "sha256: $actual"
  if [[ -n "$expected" ]]; then
    [[ "$actual" == "$expected" ]] || die "hash mismatch: expected $expected, got $actual"
    log "hash matches the expected value"
  else
    log "WARNING: no expected hash given; compare the line above with the build machine's"
  fi

  log "step 2/8: fresh $NEW"
  remove_release_dir "$NEW"
  mkdir -- "$NEW"

  log "step 3/8: extract into $NEW"
  tar -xzf "$tarball" -C "$NEW" --strip-components=1 \
    --exclude='._*' --exclude='ecosystem.config.cjs' --exclude='.env.example'
  [[ -f "$NEW/server.js" ]] || die "no server.js in the extracted archive; nothing was swapped"

  log "step 4/8: ownership $APP_USER:$APP_GROUP, mode 750"
  chown -R "$APP_USER:$APP_GROUP" "$NEW"
  chmod 750 "$NEW"

  log "step 5/8: link .next/cache/images to $IMAGE_CACHE"
  # A linked .next or .next/cache would make the rm below reach outside the release.
  [[ ! -L "$NEW/.next" && ! -L "$NEW/.next/cache" ]] ||
    die "$NEW/.next or .next/cache is a symlink in the archive; nothing was swapped"
  mkdir -p "$NEW/.next/cache"
  rm -rf -- "$NEW/.next/cache/images"
  ln -s "$IMAGE_CACHE" "$NEW/.next/cache/images"
  chown -h "$APP_USER:$APP_GROUP" "$NEW/.next/cache/images"
  chown "$APP_USER:$APP_GROUP" "$NEW/.next/cache"

  link_target="$(readlink "$NEW/.next/cache/images" || true)"
  [[ "$link_target" == "$IMAGE_CACHE" ]] ||
    die "$NEW/.next/cache/images points to '$link_target', not $IMAGE_CACHE; nothing was swapped"
  [[ -d "$IMAGE_CACHE" ]] || die "$IMAGE_CACHE is not a directory; nothing was swapped"
  cache_owner="$(owner_of "$NEW/.next/cache")"
  [[ "$cache_owner" == "$APP_USER" ]] ||
    die "$NEW/.next/cache is owned by $cache_owner, not $APP_USER; nothing was swapped"
  log "image cache link and .next/cache ownership verified"

  log "step 6/8: remove the old $PREV"
  remove_release_dir "$PREV"

  log "step 7/8: stop $SERVICE, swap releases, start $SERVICE"
  "$SERVICE_CMD" stop "$SERVICE"
  if [[ -e "$CURRENT" ]]; then
    if ! mv -- "$CURRENT" "$PREV"; then
      start_service
      die "could not move $CURRENT to $PREV; restarted the unchanged release"
    fi
  else
    log "WARNING: no current release at $CURRENT; there is nothing to roll back to"
  fi
  if ! mv -- "$NEW" "$CURRENT"; then
    [[ -d "$PREV" ]] && mv -- "$PREV" "$CURRENT"
    start_service
    die "could not move $NEW into place; restarted the previous release"
  fi
  start_service

  log "step 8/8: health check on $HEALTH_URL (up to ${HEALTH_DEADLINE_SECONDS}s)"
  if ! wait_for_health; then
    log "UNHEALTHY: rolling back automatically"
    restore_previous
    log "health check after rollback on $HEALTH_URL (up to ${HEALTH_DEADLINE_SECONDS}s)"
    if wait_for_health; then
      log "summary: release=$tarball sha256=$actual health=FAILED rolled-back=ok"
      die "the new release failed its health check and was rolled back"
    fi
    log "summary: release=$tarball sha256=$actual health=FAILED rolled-back=UNHEALTHY"
    die "the new release failed and the rolled-back one is not healthy either; check: journalctl -u $SERVICE"
  fi
  log "healthy"

  log "warm-up: $NODE_BIN $CURRENT/scripts/warmup.mjs"
  exec 3>&1
  if warm_output="$("$NODE_BIN" "$CURRENT/scripts/warmup.mjs" --base "$BASE_URL" 2>&1 | tee /dev/fd/3; exit "${PIPESTATUS[0]}")"; then
    warm_status=0
  else
    warm_status=$?
  fi
  exec 3>&-
  warm_summary="$(printf '%s\n' "$warm_output" | grep '^warmup: pages=' | tail -n 1 || true)"
  if [[ "$warm_status" -ne 0 || -z "$warm_summary" ]]; then
    log "WARNING: the warm-up failed (exit $warm_status); the site is deployed, images will convert on first request"
    warm_summary="${warm_summary:-warmup: failed, no summary line}"
  fi

  log "summary: release=$tarball sha256=$actual health=ok"
  log "summary: $warm_summary"
}

main() {
  [[ $# -ge 1 ]] || usage
  announce_overrides
  require_root
  command -v curl >/dev/null || die "curl is required for the health check"

  if [[ "$1" == "--rollback" ]]; then
    [[ $# -eq 1 ]] || usage
    rollback
  else
    [[ $# -le 2 ]] || usage
    [[ "$1" != -* ]] || usage
    deploy "$@"
  fi
}

main "$@"
