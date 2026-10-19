# FE-01 — Initial Project Setup

**Status:** In Progress
**Depends on:** nothing
**Reads:** `architecture.md`, `asset-inventory.md`

Bootstrap the repository so every subsequent item has a working, opinionated foundation. No visual work in this item — if you are writing a section component, you are on the wrong task.

---

## Scope

### 1. Project initialisation

```bash
pnpm create next-app@latest sael-web \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

`pnpm create next-app` refuses to scaffold into a non-empty directory, and this repo already contains `CLAUDE.md`, `docs/` and `.git`. Scaffold into a temp directory and move the generated config files in, keeping the repository's own `.gitignore` and discarding the template's `README.md`, `CLAUDE.md`, `AGENTS.md` and Vercel placeholder SVGs.

Then:

- Node version pinned in `.nvmrc` (`25`); `package.json` `engines` accepts `>=24` so the release archive still runs on a current-LTS VM.
- `packageManager` field pinned to the pnpm version.
- `nodeLinker: hoisted` in `pnpm-workspace.yaml` — required for a relocatable standalone build. See `architecture.md` §8.
- `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`, `noUnusedLocals: true`, `noUnusedParameters: true`.
- Do **not** type the root layout with the generated `LayoutProps` global — it does not exist until the first build, which makes `pnpm check` fail on a fresh clone.

### 2. Folder scaffold and placeholder routes

Create the full structure from `architecture.md` §2. Directories that would otherwise be empty get a `.gitkeep`. This matters — a later session that has to invent a location for something will invent the wrong one.

**Every route in `architecture.md` §2 gets a real `page.tsx` now**, rendering only its `<h1>` and a pointer to the feature doc that will fill it in. Routing is part of the foundation; the content is not. A placeholder is not "content" — do not add copy, imagery or sections to one.

`/investors/` itself is deliberately **not** created: §2 lists only its children, and inventing a route the legacy site may not have would break URL parity. Raised as Open Decision 1a.

`career/route.ts` is created as a redirect stub (308 when `CAREER_REDIRECT_URL` is set, 404 when it is not) so the route exists; FE-20 finalises it.

`sitemap.ts`, `public/robots.txt`, `styles/theme.css`, `styles/animations.css` and `api/forms/[form]/route.ts` belong to FE-22, FE-02 and FE-19 respectively — create the directories, not the files.

### 3. `next.config.ts`

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
    ],
  },
  async redirects() {
    return [];  // populated in FE-22
  },
};

export default nextConfig;
```

Do **not** add `experimental` flags, an edge runtime, or a custom image loader. See `/CLAUDE.md` §7.

### 4. Environment configuration

`src/lib/config/env.ts` — Zod-validated, evaluated at module load so a missing variable fails the build:

```ts
const schema = z.object({
  CONTENT_SOURCE: z.enum(['mock', 'api']).default('mock'),
  API_BASE_URL: z.string().url().optional(),
  API_TIMEOUT_MS: z.coerce.number().default(8000),
  AZURE_BLOB_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  CAREER_REDIRECT_URL: z.string().url().optional(),
  MOCK_LATENCY_MS: z.coerce.number().default(0),
});
```

Written against **Zod 4**, where `z.string().url()` is deprecated in favour of `z.url()`. An empty `KEY=` in a `.env` file must be treated as unset, or every optional URL fails validation.

Add a `superRefine` so `API_BASE_URL` becomes required when `CONTENT_SOURCE === 'api'`.

Commit `.env.example` with every key documented. `CONTENT_SOURCE` and `NEXT_PUBLIC_SITE_URL` carry real values — acceptance criterion 1 requires a copy of it to boot unedited, which is impossible if the required variable is blank. `.env.local` is gitignored.

`src/lib/config/site.ts` — site name, legal name, base URL, contact details, and the four social URLs (Facebook, Instagram, LinkedIn, X). Sourced from the live site footer; values are in `docs/features/03-app-shell-header-footer.md`.

### 5. Tooling

| Tool | Config |
|---|---|
| ESLint | `next/core-web-vitals` + `@typescript-eslint` strict. Add `no-restricted-imports` blocking `@/lib/content/mock` and `@/lib/content/api` outside `src/lib/content/`. Add a rule banning `process.env` outside `config/env.ts`. |
| Prettier | 2-space, single quotes, trailing commas, 100 print width. `prettier-plugin-tailwindcss` for class ordering. |
| Husky + lint-staged | Pre-commit: eslint --fix, prettier. Pre-push: `tsc --noEmit` and the guardrail check. |
| commitlint | Conventional Commits |
| EditorConfig | LF, UTF-8, final newline. Pair with `.gitattributes` (`* text=auto eol=lf`) or Windows checkouts turn every diff into line-ending noise. |
| Prettier ignore | `CLAUDE.md` and `docs/` are excluded. Reformatting hand-authored specs produces thousand-line diffs that bury the content change. |

`.vscode/extensions.json` recommending the Tailwind, ESLint and Prettier extensions — the team is working in VS Code.

### 6. Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "verify:guardrails": "node scripts/verify-guardrails.mjs",
  "check": "pnpm lint && pnpm typecheck && pnpm verify:guardrails && pnpm build",
  "package": "node scripts/package-release.mjs"
}
```

`next lint` was **removed** in Next.js 16 — call `eslint` directly.

### 7. Release packaging

No Docker. The client deploys to an Azure VM under Nginx + PM2 from an archive we hand over.

- `scripts/package-release.mjs` assembles `.next/standalone` + `.next/static` + `public/` + `ecosystem.config.cjs` + `DEPLOY.txt` and compresses it to `release/sael-web-<version>.tar.gz`. Next deliberately omits the middle two from standalone output; stitching them together is the whole job.
- The script **fails** if any unresolved link survives into the staging directory — a broken archive must not reach the client.
- `ecosystem.config.cjs` — PM2 app definition, cluster mode, bound to `127.0.0.1` so Nginx is the only public listener.
- `deploy/nginx.conf.sample` — TLS, gzip, `immutable` caching on `/_next/static/`, and the health probe. Next does none of these in standalone mode.

### 8. Health endpoint

`src/app/api/health/route.ts` → `{ status: 'ok', version }`, `dynamic = 'force-dynamic'`.

Read the version from `package.json`, **not** `process.env.npm_package_version`: that variable is only populated when Node is launched through a package script, so it is `undefined` under PM2 running `node server.js` — and reading it would violate the `process.env` lint rule this same item adds.

### 9. Baseline app files

- `src/app/layout.tsx` — html lang="en", `metadataBase`, placeholder header/footer slots, `<main id="main-content">`.
- `src/app/page.tsx` — placeholder.
- `src/app/not-found.tsx` and `src/app/error.tsx` — minimal but real, not the Next defaults.
- `src/styles/globals.css` — Tailwind import, a CSS reset (`box-sizing`, margin/padding zero, `img { display:block; max-width:100% }`), `scroll-behavior: smooth` inside a reduced-motion guard, and `scroll-padding-top` matching the header height.
- `src/lib/utils/cn.ts`.

### 10. Repository docs

- Copy `CLAUDE.md` and the `docs/` folder into the repo root.
- `README.md`: prerequisites, install, `.env.local` setup, run, build, release packaging and VM deployment, and a pointer to `docs/frontend-progress.md` as the entry point for contributors.
- Branch strategy in the README: `main` (production) ← `feat/FE-NN-slug`, merged by PR. There is no `develop` branch.

---

## Out of scope

Design tokens, fonts, UI primitives (FE-02). Header/footer (FE-03). Any page content — the routes exist, but a placeholder carries no copy, imagery or sections. The content repository (FE-05) — but **do** create the empty `src/lib/content/` directory.

---

## Acceptance criteria

- [ ] `pnpm install && pnpm dev` starts cleanly on a fresh clone with only `.env.local` copied from `.env.example`
- [ ] `pnpm check` passes (lint + typecheck + guardrails + build) on a fresh clone, before any build has run
- [ ] `pnpm build && pnpm start` serves on port 3000 with no external services running
- [ ] `pnpm package` produces an archive that, extracted on another machine, serves the same via `node server.js`
- [ ] `GET /api/health/` returns 200 with the package version
- [ ] `GET /about-us` 308-redirects to `/about-us/`, and the slashed URL then returns 200
- [ ] Removing `NEXT_PUBLIC_SITE_URL` from the environment fails the build with a readable Zod error, not a runtime crash
- [ ] `import { MockContentRepository } from '@/lib/content/mock'` in a page file triggers an ESLint error
- [ ] `pnpm verify:guardrails` proves both of the above two automatically, and fails if either guardrail stops working
- [ ] Every route in `architecture.md` §2 resolves; folder structure matches §2
- [ ] `docs/` and `CLAUDE.md` are committed at the repo root

## On completion

Move FE-01 to **Done** in `docs/frontend-progress.md`, promote **FE-02** to In Progress, commit both with the code.
