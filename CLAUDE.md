# CLAUDE.md — SAEL Corporate Website (Next.js)

This file is read automatically at the start of every Claude Code session. Read it fully before doing anything else.

---

## 1. What this project is

A ground-up rebuild of **https://www.sael.co** (SAEL Industries Limited — renewable energy: solar IPP, agri waste-to-energy, module and cell manufacturing) as a **Next.js 16 App Router** application.

The visual direction is fixed by an approved Claude Designer prototype of the homepage. We are **not** inventing a new design — we are re-deriving that prototype into a scalable, responsive, component-driven codebase.

**The prototype is a reference, not a source to copy.** It is a single 1,300-line HTML file with inline styles, hardcoded content, and viewport-width (`vw`) sizing tuned for a 1920px display. Porting it verbatim would fail every requirement below.

---

## 2. Non-negotiables

These are hard rules. If a task appears to require breaking one, stop and ask.

1. **Mobile-first.** Every component is authored at the smallest breakpoint first and enhanced upward with `min-width` media queries. The design is *reviewed* at 1920px but must be *correct* from 360px. See `docs/responsive-strategy.md`.
2. **No raw values in components.** No hex colours, no `vw` units, no magic pixel numbers. Everything comes from design tokens defined in `src/styles/theme.css`. See `docs/design-guidelines.md`.
3. **No invented content.** Copy, statistics, names, dates and figures come from the relevant feature doc in `docs/features/`. If a value is missing, insert `{{TODO: content}}` and list it at the end of your response — never fabricate a plausible-looking number for a company that publishes financial results.
4. **Portable build.** The client deploys to an Azure VM, nginx in front of one systemd-managed `node server.js` process, from an archive we hand over. Nothing may assume a platform-specific runtime. See §7.
5. **Every dynamic surface goes through the content repository.** No component ever calls `fetch` against the backend directly. See §6.
6. **URL parity with the legacy site.** Routes, trailing slashes and the canonical host must match the old site exactly. SEO equity depends on it. See `docs/accessibility-and-seo.md`.
7. **One In Progress item at a time.** See §3.
8. **Display copy comes from SAEL's reviewed content for the new site, not from sael.co.** This covers headings, labels, figures, section names and body text on static pages. The authority is what SAEL have reviewed for the new site: this repository, as shown to them on https://sael-dev.vercel.app/. **"The live site says X" is not grounds for changing display copy.**

   **Why:** www.sael.co is SAEL's *previous* website. It is the site this one replaces, and it may be out of date. When the two disagree, the old site is the likelier to be wrong. "Correcting" our copy towards it puts the copy SAEL rejected back over the copy they approved. That happened on 2026-10-02: SAEL's reviewed homepage capacity figures were replaced with sael.co's older ones. It was undone on 2026-10-04.

   **What to do instead:** keep our copy. Record the disagreement for SAEL in the backend's `docs/client/static-content-sign-off.md` or as a question to them, because they may want the old site updated.

   sael.co **is** the source for two things only:
   - **Migrated content records**: investor documents and news items.
   - **Tile and page slugs**: these must match the existing URLs (rule 6).

   See `docs/content-model.md` §1.1.

### What rule 2 enforces

`pnpm verify:guardrails` implements **all four** clauses in rule 2, plus the gutter rule.
Its `VALUE_CHECKS` are:

| Check | Status |
|---|---|
| No raw hex colour outside `theme.css` | enforced |
| No `rgb()` / `rgba()` / `hsl()` literal outside `theme.css` | enforced |
| No bare `vw` outside `theme.css` (and `lib/utils/image-sizes.ts`) | enforced |
| `<Container>` is the only source of horizontal page padding | enforced |
| No magic pixel numbers | enforced **since 2026-08-26** |

**How the magic-number check works.** It matches a Tailwind arbitrary value whose contents
**begin with a digit** — `/\b[a-z][a-zA-Z-]*-\[-?\d[^\]]*\]/`. Anchoring on the leading
digit is what makes a broad allowlist unnecessary: it admits composed values
(`pt-[calc(var(--a)+var(--b))]` — a token being *used*), arbitrary properties
(`[clip-path:…]` — no `utility-` prefix) and variant brackets (`supports-[…]`,
`data-[…]`), all of which start with something other than a digit. Grid tracks are the one
carve-out, via the check's `except` field, because `1fr` is a ratio no token could express.

**Why it exists.** Before it landed, every Tailwind arbitrary value passed the build —
`h-[42px]`, `z-[100]`, `backdrop-blur-[22px]`, `translate-y-[5px]`, `tracking-[0.25em]`.
That gap was the single cause of the dimension drift found in FE-04, and the sharpest part
of it was that most of those literals encoded a number `docs/design-guidelines.md` already
specified; they were written by hand only because no token had been minted for them. The
drift was cleared in the same pass (**C-4**), and the check now stops it recurring.

Both the check and the FE-04 cleanup are recorded as **C-5** and **C-4** in
`docs/design-reconciliation.md`. If a value genuinely cannot be expressed as a token, say
why in the diff rather than reaching for `eslint-disable`-style escapes — there are none
here, and the check is meant to be argued with, not bypassed.

---

## 3. Session ritual — the progress tracker

`docs/frontend-progress.md` is the single source of truth for what to build next. Multiple people run Claude Code sessions against this repo; the tracker is how those sessions stay coordinated.

**At the start of every session:**

1. Read `docs/frontend-progress.md`.
2. Find the item in **In Progress**. That is your task. There is never more than one.
3. Open the feature doc that item points to (e.g. `docs/features/04-homepage.md`) and read it in full.
4. Read only the supporting docs that item's *Reads* column lists. Do not load the whole `docs/` folder into context.

**If In Progress is empty:** promote the top item from **Pending** into **In Progress**, set `Started` to today's date, and begin.

**When the item is complete** (acceptance criteria in the feature doc all met, `pnpm build` clean, `pnpm lint` clean):

1. Move the row from **In Progress** to the top of **Done**, fill in `Completed` with today's date.
2. Promote the top **Pending** row into **In Progress**.
3. Commit the tracker change **in the same commit** as the code. A tracker that disagrees with the code is worse than no tracker.

**Never** work an item that is not In Progress. If you believe the order is wrong, say so and stop — do not reorder unilaterally.

---

## 4. Documentation map

Load these on demand, not all at once.

| File | Read it when |
|---|---|
| `docs/architecture.md` | Creating files, deciding where code lives, adding a route |
| `docs/design-guidelines.md` | Any styling work — tokens, type, colour, motion |
| `docs/responsive-strategy.md` | Any layout work; mandatory for every section component |
| `docs/content-model.md` | Anything involving data, types, or the repository layer |
| `docs/api-contracts.md` | Wiring a form or a backend-fed list |
| `docs/asset-inventory.md` | Adding, renaming or referencing an image, icon or font |
| `docs/accessibility-and-seo.md` | Adding a route, metadata, redirect, or interactive control |
| `docs/features/NN-*.md` | Always — this is the spec for the current tracker item |

---

## 5. Code conventions

**Language and tooling**

- TypeScript, `strict: true`. No `any`. No `@ts-ignore` without a comment explaining why.
- pnpm. Do not commit `package-lock.json` or `yarn.lock`.
- Tailwind CSS v4, CSS-first config via `@theme` in `src/styles/theme.css`.
- Path alias `@/*` → `src/*`. No relative imports that climb more than one level (`../../` is a smell).

**Components**

- **Server Components by default.** Add `'use client'` only at the leaf that actually needs interactivity or browser APIs, never on a whole page or section wrapper. A carousel's arrows are client; the section around them is not.
- One component per file. File name matches the export. `PascalCase.tsx` for components, `kebab-case.ts` for everything else.
- Props interfaces are named `<ComponentName>Props` and exported.
- Section components are **content-agnostic**: they receive typed props and render. They never import fixtures or call the repository. Pages do the fetching and pass data down.
- Before writing a new UI primitive, check `src/components/ui/`. Duplicating `Button`, `Container` or `SectionHeading` across pages is the failure mode this architecture exists to prevent.

**Styling**

- Tailwind utilities in JSX. Use `cn()` (`clsx` + `tailwind-merge`) for conditional classes.
- Component-specific variants go through `cva` (class-variance-authority), not string concatenation.
- Bespoke keyframes live in `src/styles/animations.css`, not inline.
- Never use `style={{}}` except for genuinely dynamic runtime values (a computed transform, a CSS custom property carrying a data-driven value).

**Accessibility floor** (WCAG 2.1 AA is not a formal client requirement, but these are non-optional quality gates)

- Every interactive element is keyboard reachable with a visible focus ring.
- Every image has meaningful `alt`, or `alt=""` if decorative.
- Every animation respects `prefers-reduced-motion: reduce`.
- Heading levels are sequential. One `<h1>` per page.

**Git**

- Branch: `feat/<tracker-id>-<slug>`, e.g. `feat/FE-04-homepage`, cut from `main`.
- Commit: Conventional Commits — `feat(homepage): add hero carousel`.
- One tracker item per PR, merged into `main`. There is no `develop` branch.

---

## 6. Data layer — read this before touching anything dynamic

The backend is **one Spring Boot application — a modular monolith — + MySQL**: the SAEL admin backend, which also serves this site's content API. **Its public endpoints are live** under `/app/v1`, and `docs/api-contracts.md` describes them as built. Pages are built against mocks and cut over to the API without touching a single component.

```
src/lib/content/
├── types.ts          Domain models (NewsItem, InvestorDocument, TeamMember, …)
├── repository.ts     The ContentRepository interface — the contract
├── mock/
│   ├── index.ts      MockContentRepository
│   └── data/*.json   Fixtures
├── api/
│   ├── index.ts      ApiContentRepository (Spring Boot)
│   └── client.ts     Typed fetch wrapper, Zod-validated
└── index.ts          getContentRepository() — factory
```

**Rules:**

- Components and pages import **only** `getContentRepository()` from `@/lib/content`. Never `@/lib/content/mock` or `@/lib/content/api`.
- The active implementation is selected by the `CONTENT_SOURCE` env var (`mock` | `api`). Default `mock`.
- Adding a new dynamic surface means: add the type → add the method to the interface → implement in **both** mock and api → then build the UI. Never implement only the mock.
- All API responses are validated with Zod at the boundary. A malformed response must degrade to an empty state, not crash the page.
- **The contact form posts from the browser, directly to the backend** (`POST /app/v1/contact-enquiry`, `docs/api-contracts.md` §8). This reverses the earlier rule, which sent forms through a Next.js route handler. **Why:** the backend rate-limits submissions to 5 per hour per client IP, by design, and it can only see the IP of whoever opened the connection. Proxied through the Next server, every visitor would share the server's one IP, and the site's sixth enquiry in any hour would be refused for everybody. No credential is involved, so there is nothing to keep off the client. The backend answers CORS for this endpoint and its options endpoint, for the exact origins it is told about.
- **That endpoint is the single exception**, to this section and to §2 rule 5. Every other backend call — content, preview, the preview-session exchange — stays server-side and goes through the content repository.

---

## 7. Deployment constraints

The client hosts on an **Azure VM: nginx terminating TLS in front of the Next.js standalone server, run by systemd as a single `node server.js` process.** PM2 is not used. `ecosystem.config.cjs` remains only because the archive includes it, and it throws so that `pm2 start` fails with the reason. The admin panel backend runs on the same VM behind the same nginx. There is no container step: we build the archive and hand it over.

The following are **forbidden**:

- Edge runtime (`export const runtime = 'edge'`)
- Any Vercel-specific API, header or image loader. **Next.js's own ISR — `export const revalidate`, `revalidatePath`, `revalidateTag` — is not Vercel-specific.** It runs on the standalone server and is required (below).
- Reliance on writable local disk for anything other than Next's own build output and image cache

**ISR is the caching model** — time-based `revalidate`, plus on-demand `revalidatePath` from the backend's signed webhook at `/api/revalidate/` (`docs/api-contracts.md` §7). This reverses the earlier rule, which forbade ISR. **Why:** SAEL publishes content from the admin panel at runtime, including statutory investor disclosures. A site rendered only at build time would show an approved publication at the next deploy, not when it was approved. The backend now calls the site after every publish, unpublish and delete, so the page can be refreshed at that moment.

**The constraint that comes with it: production runs exactly one `node server.js` process, and must stay at one.** Each process holds its own cache of rendered pages. With more than one, `revalidatePath` clears only the process that received the webhook, returns 2xx, and the others keep serving the stale page. The backend counts that 2xx as success, so nothing anywhere reports it. **A second process requires a shared cache handler first** (`cacheHandler` in `next.config.ts`, backed by something every process reads). That applies however the second process would arrive: a second systemd unit, a cluster module, or a process manager. The same warning sits in `ecosystem.config.cjs`.

**Two things the build bakes in**, both of which matter at deployment:

- **Content.** The build prerenders pages from whatever `CONTENT_SOURCE` the build machine has. Built with the default (`mock`), it ships fixture content. A production build therefore comes after the backend is running, configured and imported, and is made with `CONTENT_SOURCE=api`.
- **The host.** `NEXT_PUBLIC_SITE_URL` is compiled in. Moving the site to another host is a rebuild, not a reconfiguration, and on any origin but `PRODUCTION_URL` every page is `noindex`.

The backend's `docs/tenant-cutover-checklist.md` §0.8 and §1.11 carry both for whoever provisions.

And the following are **required**:

- `output: 'standalone'` in `next.config.ts`
- `pnpm build && pnpm package` must produce an archive that runs via `node server.js` on a bare Node box with no install step and no external services beyond the env vars documented in `.env.example`
- All configuration through environment variables. No hardcoded hostnames.
- Anything nginx must do that Next does not — compression, TLS, `Strict-Transport-Security`, and routing each path to this site or the backend — is captured in `deploy/nginx.conf.sample`. Do not silently rely on a proxy behaviour that is not written down there. (Next 16 sets the long-lived `Cache-Control` on `/_next/static/` itself, so nginx does not.)

---

## 8. Known constraints and gotchas

- **DIN is a commercially licensed typeface.** Only the files supplied by the client go in `src/assets/fonts/`. Do not substitute a lookalike, and do not fetch DIN from a CDN.
- **The prototype's `uploads/` folder has unstable filenames** (`pasted-1784663527717-0.png` is the logo). Never reference those names. Use the curated names in `docs/asset-inventory.md`.
- **The homepage vision timeline** is a scroll-pinned SVG path animation that only works above `lg`. Below `lg` it is a completely different component. Both are specified in `docs/features/04-homepage.md`. Do not attempt to make one component do both.
- **Careers is a page as of 2026-09-22.** It was a 308 redirect to the client's Oracle recruiting system until then, and `docs/features/20-career-redirect.md` still describes that. The page has no form: the two "Explore" CTAs link out to `CAREER_REDIRECT_URL`, which is where applications are made. Returning visitors may keep landing on Oracle until their browser's cached 308 expires.
- **Investor PDFs live in Azure Blob Storage**, served via absolute URLs from the backend. Do not commit PDFs to the repo.

---

## 9. When you are unsure

Ask. Specifically:

- Missing copy or a figure → `{{TODO: content}}` and flag it.
- An API shape that `docs/api-contracts.md` does not cover → propose the contract in your response, add it to that doc, and mock it. Do not silently invent a response shape.
- A design decision the prototype does not answer (almost always: "what does this look like on mobile?") → check `docs/responsive-strategy.md` first; if it is silent, propose an approach and flag it rather than guessing.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
