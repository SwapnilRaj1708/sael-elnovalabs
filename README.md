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

## Branching

```
main  ←  feat/FE-NN-slug
```

`main` is production. Work happens on a branch named after its tracker item — `feat/FE-01-initial-project-setup`
— and merges back through a pull request. One tracker item per PR, and the tracker row moves in the
same commit as the code it describes.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/); commitlint,
lint-staged and a pre-push typecheck run automatically via Husky.
