# Architecture

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16+, App Router** | Server Components keep the marketing pages near-zero JS; file-based routing maps cleanly onto the fixed IA |
| Language | **TypeScript, `strict: true`** | The backend contracts are not finalised — types are how we survive the change |
| Runtime | **Node 25** | Pinned in `.nvmrc`; `engines` accepts `>=24` so the archive also runs on a current-LTS VM |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`) | Tokens live in CSS, are readable by designers, and are enforceable via lint |
| Fonts | `next/font/local` (DIN, client-supplied) | Self-hosted, zero layout shift, no third-party CDN |
| Variants | `class-variance-authority` + `clsx` + `tailwind-merge` | Typed component variants without string soup |
| Animation | CSS first; `motion` (Framer Motion) only where CSS cannot express it | Bundle discipline — most of the prototype's motion is pure CSS |
| Validation | **Zod** | Runtime validation at the API boundary; also drives form schemas |
| Forms | `react-hook-form` + `@hookform/resolvers/zod` | Accessible, uncontrolled, small |
| Icons | Local SVG components + `lucide-react` for utility icons | Brand icons are client-supplied SVGs, not an icon-font |
| Package manager | **pnpm** | Deterministic, fast, disk-efficient in CI |

**Not in scope** (confirmed with client): internationalisation, analytics/GTM, cookie consent, gated investor login, Storybook, automated test suites. Do not add them speculatively. The architecture below does not preclude any of them.

---

## 2. Folder structure

```
sael-web/
├── CLAUDE.md
├── next.config.ts
├── ecosystem.config.cjs             # throws: PM2 is not used (systemd runs server.js); ships in the archive
├── .env.example
├── deploy/
│   └── nginx.conf.sample
├── scripts/
│   ├── package-release.mjs          # builds the deployable archive
│   └── verify-guardrails.mjs        # proves the env schema and lint rules bite
├── docs/                            # this folder
├── public/
│   ├── favicon.ico
│   └── images/                      # only truly static, non-optimised assets
└── src/
    ├── app/
    │   ├── layout.tsx               # root layout: fonts, <Header/>, <Footer/>
    │   ├── page.tsx                 # homepage
    │   ├── not-found.tsx
    │   ├── error.tsx
    │   ├── sitemap.ts
    │   ├── robots.ts                # /robots.txt, from the same isPublicSite as noindex
    │   ├── about-us/page.tsx
    │   ├── our-team/page.tsx
    │   ├── solar-energy/page.tsx
    │   ├── waste-to-energy/page.tsx
    │   ├── module-manufacturing/page.tsx
    │   ├── solar-cell-manufacturing/page.tsx
    │   ├── story-of-our-influence/page.tsx
    │   ├── our-key-esg-metrics/page.tsx
    │   ├── our-core-beliefs/page.tsx
    │   ├── sustainable-development-goals/page.tsx
    │   ├── newsroom/page.tsx
    │   ├── career/page.tsx           # a page since 2026-09-22; was a redirect handler
    │   ├── contact-us/page.tsx
    │   ├── privacy-policy/page.tsx
    │   ├── disclaimer/page.tsx
    │   ├── terms-and-conditions/page.tsx
    │   ├── investors/
    │   │   ├── offer-documents/page.tsx
    │   │   ├── corporate-governance/page.tsx
    │   │   ├── notifications/page.tsx
    │   │   ├── contact-us/page.tsx
    │   │   └── financials-and-reports/
    │   │       ├── page.tsx
    │   │       ├── annual-return/page.tsx
    │   │       ├── consolidated-financials-of-the-company/page.tsx
    │   │       ├── standalone-financials-of-the-company/page.tsx
    │   │       ├── standalone-financials-of-material-subsidiary-companies/page.tsx
    │   │       └── investor-downloads/page.tsx
    │   └── api/                     # revalidate/, preview/, health/ — no form route (api-contracts.md §8)
    ├── components/
    │   ├── ui/                      # generic, reusable, zero business knowledge
    │   │   ├── button.tsx
    │   │   ├── container.tsx
    │   │   ├── section.tsx
    │   │   ├── section-heading.tsx
    │   │   ├── eyebrow.tsx
    │   │   ├── card.tsx
    │   │   ├── accordion.tsx
    │   │   ├── document-list.tsx
    │   │   ├── pagination.tsx
    │   │   ├── skeleton.tsx
    │   │   └── empty-state.tsx
    │   ├── layout/
    │   │   ├── header/
    │   │   │   ├── index.tsx
    │   │   │   ├── desktop-nav.tsx
    │   │   │   ├── mobile-nav.tsx       'use client'
    │   │   │   └── nav-config.ts
    │   │   └── footer/index.tsx
    │   ├── sections/                # page sections; content-agnostic, typed props
    │   │   └── _retired/           # no longer rendered; kept, lint-blocked from import
    │   │   ├── hero-carousel/
    │   │   ├── stats-band/
    │   │   ├── intro-split/
    │   │   ├── business-tiles/
    │   │   ├── presence-map/
    │   │   ├── feature-banner/
    │   │   ├── strength-split/
    │   │   ├── vision-timeline/
    │   │   ├── sdg-marquee/
    │   │   ├── goals-triad/
    │   │   ├── news-grid/
    │   │   └── page-hero/
    │   └── forms/
    │       ├── contact-form.tsx         'use client'
    │       └── investor-contact-form.tsx 'use client'
    ├── lib/
    │   ├── content/                 # the data layer — see content-model.md
    │   ├── utils/
    │   │   ├── cn.ts
    │   │   ├── format-date.ts
    │   │   └── blob-url.ts
    │   ├── config/
    │   │   ├── env.ts               # Zod-validated process.env
    │   │   └── site.ts              # site name, base URL, social links
    │   └── seo/
    │       ├── metadata.ts          # buildMetadata() helper
    │       └── json-ld.ts
    ├── hooks/
    │   ├── use-media-query.ts
    │   ├── use-reduced-motion.ts
    │   └── use-scroll-progress.ts
    ├── types/
    │   └── index.ts
    ├── assets/
    │   ├── fonts/                   # DIN — client supplied, licensed
    │   ├── images/                  # imported by next/image, hashed at build
    │   └── icons/                   # SVGs imported as React components
    └── styles/
        ├── globals.css
        ├── theme.css                # @theme tokens — the design system
        └── animations.css
```

---

## 3. Layering rules

Dependencies flow **one way only**. A violation of this is the main way a codebase like this rots.

```
app/ (routes)
  ↓ fetches data, composes
components/sections/
  ↓ composes
components/ui/
  ↓
lib/utils, styles
```

- `app/*/page.tsx` — owns data fetching, metadata, and section composition. Contains almost no markup of its own beyond `<main>` and section ordering.
- `components/sections/*` — receives typed props, renders. **Never** imports from `lib/content`. **Never** knows whether its data came from a mock or an API.
- `components/ui/*` — knows nothing about SAEL. A `<Button>` does not know what "Know More" is.
- `lib/*` — no React imports except where explicitly a hook.

**The test:** if you can copy `components/sections/news-grid/` into an unrelated project and it compiles given its props type, it is correct.

---

## 4. Section composition pattern

Every page is a list of sections. Sections take a props object and nothing else:

```tsx
// src/app/page.tsx  (Server Component)
import { getContentRepository } from '@/lib/content';
import { HeroCarousel } from '@/components/sections/hero-carousel';
import { NewsGrid } from '@/components/sections/news-grid';

export default async function HomePage() {
  const news = await getContentRepository().getInTheNewsRail(12);

  return (
    <main>
      <HeroCarousel slides={HOMEPAGE_HERO_SLIDES} intervalMs={6000} />
      <BusinessTiles tiles={businessTiles} />  {/* static: _content/homepage.ts */}
      {/* … */}
      <NewsGrid eyebrow="In the News" items={news} viewAllHref="/newsroom/" />
    </main>
  );
}
```

Static, design-owned content (hero slide copy, mission/vision/ethos text) lives in a colocated `content.ts` beside the page or in `src/lib/content/static/`. Backend-owned content comes from the repository. **Do not** route static marketing copy through the repository — it adds a network hop for text that changes once a year. Nor anything the backend does not serve: the capacity figures, board, committees and team are static for that reason (`content-model.md` §1).

### Why not a JSON-driven section registry?

It was considered and rejected for v1. With ~20 fixed pages and no CMS, a registry adds indirection without buying anything: the client cannot reorder sections without a developer either way. Sections are already independently reusable via props, which is the part that actually matters. If a CMS is introduced later, a registry can be layered on top without changing the section components — that is precisely why they are content-agnostic.

---

## 5. Rendering strategy

Deployment target is unknown and may be multi-instance. That rules out ISR (which needs a shared cache handler we cannot configure yet). The strategy below works identically on a single VM and on Azure Container Apps with N replicas.

| Page class | Strategy | Implementation |
|---|---|---|
| Fully static (About, 4 Business, 3 Sustainability, SDG, 3 Legal) | **SSG** at build | Default. No `fetch`, no dynamic APIs. |
| Homepage | **SSG shell + cached server fetch** | The only dynamic part is the 3 latest news items. `fetch(..., { next: { revalidate: 300 } })` |
| Newsroom, Investor documents, Notifications, Our Team, ESG metrics | **Dynamic SSR with a 5-minute data cache** | `fetch(..., { next: { revalidate: 300, tags: ['news'] } })` |
| Contact form | **Browser → backend**, same origin | `POST /app/v1/contact-enquiry` from `src/components/forms/contact-form.tsx`; no Next route (`api-contracts.md` §8) |
| Career | **SSG** | Static page since 2026-09-22 (it was a `permanentRedirect()` handler). No form: the two "Explore" CTAs link out to `CAREER_REDIRECT_URL`, where applications are made |

Notes:

- Per-instance caching is acceptable here. Worst case a replica serves a press release five minutes late. That is a correct trade for deployment portability.
- Cache tags are declared now (`tags: ['news']`) so that on-demand revalidation can be switched on later without touching call sites, once the hosting model is known.
- **While `CONTENT_SOURCE=mock`**, the repository resolves from local fixtures with no network call, so every page above still prerenders as static. This is intentional — the mock phase should build fast and deploy anywhere.

---

## 6. Configuration and environment

`src/lib/config/env.ts` validates `process.env` with Zod at module load. A missing required variable fails the **build**, not the first request.

```
# .env.example
CONTENT_SOURCE=mock                  # mock | api
API_BASE_URL=                        # Spring Boot gateway, required when CONTENT_SOURCE=api
API_TIMEOUT_MS=8000
AZURE_BLOB_BASE_URL=                 # the storage account, e.g. https://<account>.blob.core.windows.net — containers are added in code
NEXT_PUBLIC_SITE_URL=https://www.sael.co
CAREER_REDIRECT_URL=                 # Oracle recruiting system — client to confirm
```

Rules:

- Only variables that must reach the browser get the `NEXT_PUBLIC_` prefix. `API_BASE_URL` must **not**.
- Nothing reads `process.env` directly outside `env.ts`.
- Azure Blob URLs are composed with `blobUrl(path)` from `lib/utils/blob-url.ts`, never string-concatenated at the call site.

`next.config.ts` essentials:

```ts
const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,              // URL parity with the legacy site — see accessibility-and-seo.md
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
      { protocol: 'https', hostname: 'www.sael.co' },   // during migration only
    ],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  async redirects() { /* see features/22-seo-and-redirects.md */ },
};
```

`allowedDevOrigins` also sits in the real file. It is **`next dev` only** — it whitelists the
LAN address a phone on the same network hits to review a build, and Next ignores it in
`next build`. It is deliberately not in the snippet above: nothing in the deployed artefact
reads it, so it is not a hardcoded hostname in the sense /CLAUDE.md §7 forbids. Change it to
your own machine's address rather than assuming the committed one is yours.

---

## 7. Backend integration boundary

The Spring Boot services do not exist yet. Everything below is designed so the cutover (FE-23) is a config change plus one adapter, not a refactor.

```
Browser ──▶ Next.js server ──▶ Spring Boot gateway ──▶ MySQL
                   │
                   └──▶ Azure Blob (PDF/image URLs only, no proxying)
```

- **Reads** happen in Server Components via `getContentRepository()`. The browser never sees `API_BASE_URL`.
- **The one write**, the contact form, goes from the browser straight to the backend at the relative `/app/v1/contact-enquiry`, which nginx routes to Spring Boot on the same host. Not through Next: the backend rate-limits per client IP, and through a Next proxy every visitor would share the server's. `/CLAUDE.md` §6, `api-contracts.md` §8.
- **PDFs and large media** are linked directly to their Azure Blob URL. Next.js does not proxy or re-host them.
- **Failure is a first-class state.** A backend timeout renders an `<EmptyState>` with a human message, never a 500. The rest of the page must still render.

See `content-model.md` for the repository contract and `api-contracts.md` for the endpoint shapes to hand to the backend team.

---

## 8. Deployment

**Azure VM, nginx + systemd.** No container step. We build an archive and hand it over; the client's team extracts and runs it. The admin panel backend runs on the same VM behind the same nginx, which routes each path to one or the other (`deploy/nginx.conf.sample`).

```bash
pnpm install --frozen-lockfile
pnpm build          # output: 'standalone'. For production: CONTENT_SOURCE=api, see below
pnpm package        # -> release/sael-web-<version>.tar.gz
```

The archive contains the standalone server, its dependencies, `.next/static`, `public/` and a `DEPLOY.txt` (plus `ecosystem.config.cjs`, which only throws). **No install step on the VM.** It is extracted with `--strip-components=1` into `/var/www/sael-web` and runs as **one systemd-managed process**, `node /var/www/sael-web/server.js`, with no flags. `server.js` sets `NODE_ENV=production` and changes to its own directory itself. Its environment file is `/etc/sael-web/sael-web.env`, which must set `HOSTNAME=127.0.0.1` and `PORT=3000`: without them `server.js` listens on `0.0.0.0`. **One process only**, because each holds its own page cache and a second would keep serving stale pages after a publish (`/CLAUDE.md` §7).

### What the build bakes in

- **Content.** The build prerenders pages from whatever `CONTENT_SOURCE` the build machine has. Built with the default (`mock`), it ships fixture content. So the provisioning order is: database ready, backend started, configuration entered through the panel, content import run, **then** the site built with `CONTENT_SOURCE=api`, then started. The build machine needs an `API_BASE_URL` it can reach. `http://127.0.0.1:8082` is the backend only from the VM itself.
- **The host.** `NEXT_PUBLIC_SITE_URL` is compiled in. Moving the VM from `prod2-preview.sael.co` to the production host is a **rebuild**, not a reconfiguration. And the value must then be exactly `PRODUCTION_URL` (`https://www.sael.co`), or every page stays `noindex`.

The backend's `docs/tenant-cutover-checklist.md` §0.8 and §1.11 carry both for whoever provisions.

### Why `nodeLinker: hoisted`

`output: 'standalone'` copies `node_modules` verbatim. Under pnpm's default symlinked layout, those links point back into the build machine's store — on Windows as absolute paths — so the archive only runs on the machine that built it. Dereferencing the links instead breaks pnpm's nested resolution (`next` loses its own `@swc/helpers`).

`nodeLinker: hoisted` in `pnpm-workspace.yaml` gives a flat `node_modules`, which makes `.next/standalone` genuinely relocatable. It does not make the archive platform-neutral: `sharp`'s native binaries are installed for the build machine's OS and CPU only. An archive built on a Mac runs on the Linux VM, but `sharp` cannot load there and Next then serves every image unoptimised, logging nothing (verified 2026-10-02). Build releases on the VM's OS and CPU. The cost is pnpm's protection against phantom dependencies — a package can now import something it does not declare. If that bites, the alternative is to build releases only on Linux and drop the setting.

The standalone output contains one symlink by design: Turbopack writes `.next/node_modules/<package>-<hash> -> ../../node_modules/<package>` for each server-external package a bundle requires (today `postcss`, through `sanitize-html`), and the server chunks require it by that name. `scripts/package-release.mjs` copies with `verbatimSymlinks`, because `fs.cp`'s default rewrites a relative link into an absolute path back into the build machine. It then refuses to archive any link that is absolute, dangles, or resolves outside the archive, so a regression fails the package step rather than the first page render after a publish.

### Required of the VM

- Node 24 LTS or newer
- `sharp` for image optimisation — bundled into the archive, no install needed, **for the OS and CPU the archive was built on** (above)
- `/var/www/sael-web/.next` writable by the service account: the page cache and the image cache are written there
- Gzip/Brotli at the proxy layer (Next does not compress in standalone mode)
- `Strict-Transport-Security` sent by nginx, for this site and the backend alike, without `includeSubDomains` or `preload`. Neither application sends it

The last two, plus TLS and the route table, are in `deploy/nginx.conf.sample`. Next 16 sets the long-lived `Cache-Control` on `/_next/static/*` itself, so nginx adds none.

Health check: `GET /api/health/` returning `{ status: 'ok', version }` — added in FE-01.

`NEXT_PUBLIC_*` values are compiled into the client bundle at build time. Changing one requires a rebuild, not a restart, so the value in the runtime environment file changes nothing.

---

## 9. Open decisions

Recorded so work is never blocked. Each has a working default already implemented.

| # | Decision | Default in force | Owner | Impact if changed |
|---|---|---|---|---|
| 1 | ~~Hosting model (VM vs managed)~~ **Resolved** | Azure VM, nginx + systemd (PM2 retired 2 Oct 2026), deployed from an archive. No container. | Client | — |
| 1a | Whether `/investors/` itself is a page | Not built — §2 lists only its children, and inventing a route would break URL parity | Client | Low — one page, no data contract |
| 2 | DIN webfont licence | Assumed held; fonts self-hosted from client-supplied files | Client legal | High — would force a substitute typeface |
| 3 | Oracle careers URL | `CAREER_REDIRECT_URL` env var; since 2026-09-22 it is the href of the two "Explore" CTAs on the Careers page, which are omitted while it is unset | Client | Trivial |
| 4 | Whether `www` or apex is canonical | `www.sael.co` (matches current site) | Client | Medium — redirect map depends on it |
| 5 | Newsroom pagination size and whether detail pages exist | 9 per page; news links out to external publishers as today, no detail route | Client | Medium — a detail route adds a dynamic segment and slug contract |
| 6 | India presence map — rebuild as interactive SVG or keep as image | Responsive image + accessible state list fallback | Client / design | Medium |
| 7 | Contact form spam protection | None (backend's responsibility per client) | Backend team | Low |
| 8 | Image CDN in front of Azure Blob | Direct Blob URLs | Client | Low — swap `blobUrl()` base |
