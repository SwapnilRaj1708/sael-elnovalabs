# SAEL Corporate Website

A rebuild of [www.sael.co](https://www.sael.co) for SAEL Industries Limited — Next.js 16
(App Router), TypeScript and Tailwind CSS v4.

**New here? Start with [`docs/frontend-progress.md`](docs/frontend-progress.md).** It is the
single source of truth for what is being built next. Then read [`CLAUDE.md`](CLAUDE.md) for the
project's non-negotiables and [`docs/architecture.md`](docs/architecture.md) for where code lives.

---

## Prerequisites

|         |                                                                     |
| ------- | ------------------------------------------------------------------- |
| Node.js | 25 (see `.nvmrc`; `nvm use` picks it up)                            |
| pnpm    | 11+ — `corepack enable` uses the version pinned in `packageManager` |

## Getting started

```bash
pnpm install
cp .env.example .env.local     # Windows: copy .env.example .env.local
pnpm dev
```

The app runs at http://localhost:3000. `.env.local` works unedited — it defaults to the mock
content repository, so no backend is required.

## Scripts

| Script                              | Does                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev`                          | Development server                                                                     |
| `pnpm build`                        | Production build (`output: 'standalone'`)                                              |
| `pnpm start`                        | Serve the production build                                                             |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                                                                 |
| `pnpm typecheck`                    | `tsc --noEmit`                                                                         |
| `pnpm format` / `pnpm format:check` | Prettier                                                                               |
| `pnpm verify:guardrails`            | Asserts the env schema and the banned-import lint rules actually fail when they should |
| `pnpm check`                        | lint → typecheck → guardrails → build. **Run this before opening a PR.**               |
| `pnpm package`                      | Builds the deployable archive (requires a prior `pnpm build`)                          |

## Configuration

Every environment variable is declared in [`.env.example`](.env.example) and validated by
[`src/lib/config/env.ts`](src/lib/config/env.ts) with Zod **at module load** — a missing or
malformed value fails the build with a readable error rather than crashing a request.

Nothing else in the codebase may read `process.env`; ESLint enforces this.

## Deployment

The client hosts on an Azure VM: nginx terminating TLS in front of this site and the admin
panel backend, each a systemd service bound to loopback. PM2 is not used. There is no container
step.

**Build last, from the API.** `pnpm build` prerenders pages from whatever `CONTENT_SOURCE` the
build machine has, and the default (`mock`) is fixture content. So a production build comes
after the backend is running, configured and has had its content imported, and is made with
`CONTENT_SOURCE=api` and an `API_BASE_URL` the build machine can reach. The backend's
`docs/tenant-cutover-checklist.md` §0.8 gives the whole order.

```bash
pnpm install --frozen-lockfile
CONTENT_SOURCE=api API_BASE_URL=<reachable backend> NEXT_PUBLIC_SITE_URL=<host it will serve> pnpm build
pnpm package          # -> release/sael-web-<version>.tar.gz
```

The archive is self-contained: the standalone server, its traced dependencies, `.next/static`,
`public/` and `DEPLOY.txt`. On the VM:

```bash
mkdir -p /var/www/sael-web
tar -xzf sael-web-<version>.tar.gz -C /var/www/sael-web --strip-components=1
```

It runs as **one** systemd-managed `node server.js` process, with no flags:

```ini
WorkingDirectory=/var/www/sael-web
EnvironmentFile=/etc/sael-web/sael-web.env
ExecStart=/usr/bin/node /var/www/sael-web/server.js
```

- `/etc/sael-web/sael-web.env` (mode 600) holds the runtime environment from
  [`.env.example`](.env.example). It **must** set `HOSTNAME=127.0.0.1` and `PORT=3000`, because
  without them the server listens on every interface.
- The service account must be able to write `/var/www/sael-web/.next`. The page cache and the
  image cache are written there.
- One process only, for the reason in [`CLAUDE.md`](CLAUDE.md) §7.

nginx terminates TLS, compresses responses, sends `Strict-Transport-Security` and routes each path
to this site or the backend. [`deploy/nginx.conf.sample`](deploy/nginx.conf.sample) is the
reference, route table included. Liveness is `GET /api/health/`.

**`NEXT_PUBLIC_SITE_URL` is compiled into the build**, as is `LEGACY_ASSET_BASE_URL`. Changing one
means a rebuild, not a restart. **Moving the site from `prod2-preview.sael.co` to the production
host is therefore a rebuild.** The value must then be exactly `https://www.sael.co`: on any other
origin, every page is marked `noindex` (`src/lib/config/site.ts`). See the backend's cutover
checklist §1.11.

### Deploying a release to the VM

[`deploy/sael-web-deploy.sh`](deploy/sael-web-deploy.sh) performs the whole upgrade in one
command. It checks the archive's SHA-256 and extracts it into `/var/www/sael-web.new`. It sets
ownership to `saelapp` and links `.next/cache/images` to `/var/lib/sael-web/cache/images`, so
converted images survive the deploy. It then swaps the release in, keeping the old one as
`/var/www/sael-web.prev`, and polls `/api/health/` for up to 60 s. **An unhealthy start is rolled
back automatically**: the new release moves to `/var/www/sael-web.failed-<timestamp>`, the previous
one is restored and restarted, and the command exits non-zero. After a healthy start it runs the
image warm-up (below). A failed warm-up is only a warning. The script removes nothing but
`sael-web.new`, `sael-web.prev` and `sael-web.failed-*`, and never touches `/var/lib/sael-web`,
nginx or the backend.

**One-time install** on the VM. The archive carries the script, so take it from the first archive
that has it:

```bash
tar -xzOf ~/sael-web-<sha>.tar.gz sael-web-0.1.0/deploy/sael-web-deploy.sh > ~/sael-web-deploy
sudo install -m 0755 -o root -g root ~/sael-web-deploy /usr/local/bin/sael-web-deploy
rm ~/sael-web-deploy
```

Repeat it when a release changes `deploy/sael-web-deploy.sh`. The top folder is
`sael-web-<version>/`, after `package.json`'s version.

**Each deploy.** On the Mac, hash the archive and copy it over:

```bash
shasum -a 256 release/sael-web-0.1.0.tar.gz
scp release/sael-web-0.1.0.tar.gz <vm>:~/sael-web-<sha>.tar.gz
```

Then, on the VM, pass the hash so a corrupted copy is refused before anything changes:

```bash
sudo sael-web-deploy ~/sael-web-<sha>.tar.gz <sha256 from the Mac>
```

**Rollback** to the release before the last deploy. It moves the current release to
`sael-web.failed-<timestamp>` and checks health. It works once per deploy, because there is only
one `.prev`:

```bash
sudo sael-web-deploy --rollback
```

**The image warm-up alone.** [`scripts/warmup.mjs`](scripts/warmup.mjs) requests every page in the
sitemap, then every `/_next/image/` URL those pages use, as AVIF and as WebP, two at a time. sharp
converts them then, not on a visitor's request. It runs as root or as `saelapp`, talks only to
`127.0.0.1:3000`, and ends with one line:
`warmup: pages=N images=N variants=N cold=N warm=N failures=N duration=Ns`.

```bash
sudo node /var/www/sael-web/scripts/warmup.mjs             # or: sudo -u saelapp node …
sudo node /var/www/sael-web/scripts/warmup.mjs --dry-run   # list what it would warm
```

`--concurrency` (default 2, at most 4) sets how many images convert at once. Each large image costs
up to about 40% of the VM's CPU while it converts. Run it after
`sael-web-refresh-blob-images` too, which leaves replaced Blob images cold.

## Branching

```
main  ←  feat/FE-NN-slug
```

`main` is production. Work happens on a branch named after its tracker item — `feat/FE-01-initial-project-setup`
— and merges back through a pull request. One tracker item per PR, and the tracker row moves in the
same commit as the code it describes.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/); commitlint,
lint-staged and a pre-push typecheck run automatically via Husky.
