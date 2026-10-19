# Accessibility & SEO

SAEL is a company that publishes financial results and is searched for by investors, journalists and job seekers. Losing search ranking during the migration is the highest-consequence non-visual risk in this project.

---

## 1. URL parity — non-negotiable

**The client has confirmed URL parity is important.** Every legacy URL must resolve to the same content at the same address, or 301 to its replacement.

### Rules

1. **Trailing slashes are preserved.** The legacy site serves `https://www.sael.co/about-us/`. Set `trailingSlash: true` in `next.config.ts`. Every internal `<Link href>` includes the trailing slash.
2. **`www` is canonical.** Apex `sael.co` 301s to `https://www.sael.co`. This is a DNS/proxy concern — hand it to whoever owns infrastructure, and set `NEXT_PUBLIC_SITE_URL=https://www.sael.co` so canonicals are correct regardless.
3. **HTTPS only.** HTTP 301s to HTTPS.
4. **One canonical per page**, absolute, self-referencing.

### Route map

Every route below must exist and 200. Verified against the live site on 2026-08-03.

| Legacy URL | New route | Feature |
|---|---|---|
| `/` | `app/page.tsx` | FE-04 |
| `/about-us/` | `app/about-us/page.tsx` | FE-06 |
| `/our-team/` | `app/our-team/page.tsx` | FE-07 |
| `/solar-energy/` | `app/solar-energy/page.tsx` | FE-08 |
| `/waste-to-energy/` | `app/waste-to-energy/page.tsx` | FE-09 |
| `/module-manufacturing/` | `app/module-manufacturing/page.tsx` | FE-10 |
| `/solar-cell-manufacturing/` | `app/solar-cell-manufacturing/page.tsx` | FE-11 |
| `/story-of-our-influence/` | `app/story-of-our-influence/page.tsx` | FE-12 |
| `/our-key-esg-metrics/` | `app/our-key-esg-metrics/page.tsx` | FE-13 |
| `/our-core-beliefs/` | `app/our-core-beliefs/page.tsx` | FE-14 |
| `/sustainable-development-goals` | `app/sustainable-development-goals/page.tsx` | FE-15 |
| `/investors/offer-documents/` | `app/investors/offer-documents/page.tsx` | FE-16 |
| `/investors/corporate-governance/` | `app/investors/corporate-governance/page.tsx` | FE-16 |
| `/investors/notifications/` | `app/investors/notifications/page.tsx` | FE-16 |
| `/investors/contact-us/` | `app/investors/contact-us/page.tsx` | FE-19 |
| `/investors/financials-and-reports/` | `.../financials-and-reports/page.tsx` | FE-17 |
| `…/annual-return/` | `.../annual-return/page.tsx` | FE-17 |
| `…/consolidated-financials-of-the-company/` | *(same slug)* | FE-17 |
| `…/standalone-financials-of-the-company/` | *(same slug)* | FE-17 |
| `…/standalone-financials-of-material-subsidiary-companies/` | *(same slug)* | FE-17 |
| `…/investor-downloads/` | *(same slug)* | FE-17 |
| `/newsroom/` | `app/newsroom/page.tsx` | FE-18 |
| `/newsroom/press-release/`, `/in-the-news/`, `/our-views/`, `/multimedia/` | `app/newsroom/<section>/page.tsx` — every item on one page, as on the legacy site; no paging | FE-18 |
| `/newsroom/press-release/<slug>/`, `/newsroom/our-views/<slug>/` | `app/newsroom/<section>/[slug]/page.tsx` — `generateStaticParams` for a head start, `dynamicParams = true` so an article published after the build is served at once, slugs verbatim (including `…-india39s-green-future`) | FE-18 |
| `/contact-us/` | `app/contact-us/page.tsx` | FE-19 |
| `/career/` | `app/career/page.tsx` — a page since 2026-09-22; it was a 308 to Oracle before that, and browsers cache a 308 | FE-20 |
| `/privacy-policy/` | `app/privacy-policy/page.tsx` | FE-21 |
| `/disclaimer/` | `app/disclaimer/page.tsx` | FE-21 |
| `/terms-and-conditions/` | `app/terms-and-conditions/page.tsx` | FE-21 |

> **Note the inconsistency:** `/sustainable-development-goals` appears **without** a trailing slash in the live site's SDG deep links (`/sustainable-development-goals#sdg-7`). With `trailingSlash: true` Next will 308 it to the slashed form, which preserves the fragment. Verify the anchors still land correctly after redirect — this is an FE-15 acceptance criterion.

### Pre-launch requirement

**Crawl the live site before cutover** and produce a complete inventory of indexed URLs — including any pages not linked from the navigation (old campaign pages, orphaned PDFs, paginated newsroom URLs like `/newsroom/page/2/`). Cross-check against Google Search Console's Pages report. Any URL in that inventory and not in the table above needs an explicit 301 target. This is an FE-22 deliverable and must not be deferred past launch.

### Redirect implementation

Static redirects go in `next.config.ts` `redirects()` with `permanent: true` (308). Keep them in a separate `src/lib/seo/redirects.ts` array and import — a config file with 80 inline objects is unmaintainable.

---

## 2. Metadata

Use the App Router Metadata API. Never hand-write `<head>` tags.

`src/lib/seo/metadata.ts` exports `buildMetadata()`:

```ts
buildMetadata({
  title: 'About Us',
  description: '…',
  path: '/about-us/',
  image: '/images/og-about.png',   // optional, falls back to site default
});
```

It handles: title template (`%s | SAEL`), absolute canonical from `NEXT_PUBLIC_SITE_URL`, OpenGraph, Twitter card, and `robots`.

**Every page exports `metadata` or `generateMetadata`.** A page without a unique title and description does not pass review.

Requirements:

- Titles ≤ 60 characters, unique per page, human-readable. Match or improve on the legacy titles — do not regress a ranking title.
- Descriptions 140–160 characters, unique, written for a human. The legacy site has **empty meta descriptions sitewide**; this is an easy improvement, but the copy must come from the client or the feature doc, not be invented.
- `og:image` 1200×630 absolute URL.
- Set `metadataBase` in the root layout.

Carry over from the legacy site's root layout: `google-site-verification` content `MzPpbkl_8_16EX_FeHk9_UCSCnIGJTxj8N8J89pnOQU`, `og:locale: en_US`, `og:site_name: SAEL.CO`.

---

## 3. Structured data

`src/lib/seo/json-ld.ts`. Emit as `<script type="application/ld+json">` in the relevant layout/page.

| Type | Where | Notes |
|---|---|---|
| `Organization` | Root layout | Legal name **SAEL Industries Limited**, logo, `sameAs` for the four social profiles, `address` (H. No. 44, Model Town, Firozpur, Guruharsahai, Punjab, 152022, IN), `telephone` (011-44910011) |
| `WebSite` | Root layout | Name and URL. No `SearchAction` — there is no site search. |
| `BreadcrumbList` | Every page below the root | Especially the nested investor pages |
| `NewsArticle` | Press Release and Our Views article pages | SAEL hosts these bodies (since 2026-10-01), so they are marked up — headline, URL, image, `datePublished` where the article shows one, SAEL as author and publisher. **Never** for In The News: those link out to articles other publications host, and marking up someone else's article is wrong. `lib/seo/json-ld.ts`. |

Validate with Google's Rich Results Test before launch.

---

## 4. Sitemap and robots

- `src/app/sitemap.ts` generates from the same route array that drives the nav config, so a new page cannot be forgotten. Include `lastModified`.
- `public/robots.txt`: allow all, point to `https://www.sael.co/sitemap.xml`.
- **Any staging/preview environment must serve `noindex`.** Gate on `NEXT_PUBLIC_SITE_URL` — if it is not the production host, emit `robots: { index: false, follow: false }` from the root layout. A staging site indexed under the client's brand is a launch-day incident.
- **The gate is announced, never silent.** `PRODUCTION_URL` and the comparison live in `src/lib/config/production-origin.ts`. The root layout reads it through `isPublicSite`, and `next.config.ts` prints the result in every `next build`'s output: one `Search indexing ON` line for `PRODUCTION_URL`, and a boxed `SEARCH INDEXING OFF` banner for any other origin. For an origin that is the production site under another name (the apex for `www`, `http:`, another port), the banner also says not to ship that build as the public site. It warns and does not fail, because preview builds are meant to be `noindex`.

### 4.1 If SAEL choose the apex (`https://sael.co`) as canonical

`www` is the recommendation (it matches the legacy site, §1 rule 2), and it is not yet confirmed. If the answer is the apex, this is the whole change. Nothing else in `src/` names the host. The other occurrences of `https://www.sael.co` are provenance comments citing the legacy site, and they stay as they are.

1. **`src/lib/config/production-origin.ts`:** `PRODUCTION_URL = 'https://sael.co'`. That one line moves the `noindex` gate, the build banner, and the product-download links in `src/app/_content/module-manufacturing.ts`, which are composed on it. Those links point at the legacy site's `/documents/product-downloads/` files and need a new home at DNS cutover whichever host wins.
2. **Build with `NEXT_PUBLIC_SITE_URL=https://sael.co`.** `metadataBase`, canonicals and JSON-LD all derive from it. Confirm that the build prints `Search indexing ON`.
3. **`deploy/nginx.conf.sample`:** the apex block serves, and `www` 301s to it. This is the reverse of rule 2 above, which must be rewritten too.
4. **Backend (its `docs/tenant-cutover-checklist.md`):** `publish.revalidation.url` must be `https://sael.co/api/revalidate/` (§1.10). The backend does not follow redirects, so a URL on the redirecting host fails every publish. `SAEL_INTAKE_CORS_ALLOWED_ORIGINS` must list the canonical origin. §1.7 already records the apex for `sael.admin.base-url`, and §1.11 is the open conflict this resolves.
5. **Search Console:** the verification token in `src/app/layout.tsx` verifies a property. If that property is the URL-prefix property for `https://www.sael.co/`, the apex needs its own property, or a Domain property covering both.
6. **Prose:** rule 2 above, §4's robots/sitemap line, `/CLAUDE.md` §1, `README.md`, and `.env.example`'s `NEXT_PUBLIC_SITE_URL` example.

---

## 5. Accessibility

WCAG 2.1 AA is not a contractual requirement, but the items below are quality gates. A public corporate site for a company with international investors should not fail them.

### Structure

- One `<h1>` per page. Heading levels sequential — no jumping h2 → h4 for visual size. Size comes from tokens, not from tag choice.
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`. `<main>` once per page.
- Skip link to `#main-content` as the first focusable element.
- Every `<nav>` with more than one instance gets an `aria-label` ("Main", "Footer", "Breadcrumb").

### Interactive elements

- Native elements first. `<button>` for actions, `<a>` for navigation. Never a `<div onClick>`.
- Visible `:focus-visible` ring on everything focusable — 2px, `--color-brand-blue`, 2px offset. Never `outline: none` without a replacement.
- Minimum 44×44px touch targets.
- The mobile nav drawer: focus trapped while open, `Esc` closes, focus returns to the trigger, `aria-expanded` on the trigger, `aria-modal` and `role="dialog"` on the panel, body scroll locked.
- The hero carousel: `aria-roledescription="carousel"`, slide dots as real `<button>`s with `aria-label="Go to slide N"` and `aria-current`, autoplay pauses on focus and on hover, and a visible pause control if autoplay runs longer than 5 seconds without interaction.
- The SDG marquee: the duplicated card set is `aria-hidden="true"` with `tabindex="-1"` on its links, so screen readers and keyboard users encounter each SDG once.

### Content

- Meaningful `alt` on informative images; `alt=""` on decorative ones. The pixel strip, tile shapes and background washes are decorative.
- Link text is meaningful out of context. "Read More" alone fails — use a visually-hidden suffix: `Read more<span class="sr-only"> about SAEL's Jewar facility</span>`.
- PDF links state format and size in the accessible name.
- External links get `rel="noopener noreferrer"` and an accessible indication that they open in a new tab.
- Colour is never the only carrier of meaning. The SDG cards carry their number and name as text, not just their brand colour.

### Motion

Every animation gated behind `prefers-reduced-motion: no-preference`. See `design-guidelines.md` §5 for the per-animation reduced-motion behaviour. **The still state is the default**, with motion added — not motion by default with a disable switch.

### Contrast

Body copy on light backgrounds passes AA comfortably (`#333` on `#fff` ≈ 12.6:1). Check specifically:

- White text on the stats-band gradient — at the red end (`#E43026`) contrast is ~4.0:1 for the 16px uppercase label. **Below AA.** Either darken the gradient start, increase the label to 18px+ (large-text threshold), or bold it. Raise in FE-04 design review.
- White on SDG `#FCC30B` — fails AA, but is mandated by UN brand guidelines. Keep, and ensure the information is available as text (see above).
- `rgba(255,255,255,0.72)` footer copyright text on the footer background — verify against the actual image crop, not the flat `#3D4A48`.

### Verification per PR

- [ ] Keyboard-only traversal, start to finish, no traps
- [ ] `axe` DevTools scan, zero criticals
- [ ] 200% zoom at 1280px, no content loss (WCAG 1.4.10 reflow)
- [ ] Screen reader pass on new interactive components (VoiceOver or NVDA)
- [ ] `prefers-reduced-motion` enabled

---

## 6. Performance as an SEO factor

Core Web Vitals targets are in `responsive-strategy.md` §6. Additionally:

- Server-render everything. No client-side data fetching for content that should be indexed.
- Fonts preloaded, `display: swap`, subset.
- No render-blocking third-party scripts (none are in scope — no GTM, no analytics, no consent banner).
- Hero image `priority`; everything else lazy.

---

## 7. Launch checklist

- [ ] Full legacy URL crawl completed and reconciled against the route map
- [ ] Redirect map implemented and every entry tested (expect 308, correct target, no chains)
- [ ] `sitemap.xml` generated and submitted to Search Console
- [ ] `robots.txt` allows production, staging returns `noindex`
- [ ] Canonicals absolute and self-referencing on every page
- [ ] Unique title and description on every page
- [ ] `google-site-verification` meta tag carried over
- [ ] Structured data validated
- [ ] `www` vs apex resolved at DNS, HTTP → HTTPS enforced
- [ ] Search Console change-of-address / re-crawl requested
- [ ] Lighthouse mobile ≥ 90 performance, 100 accessibility, 100 SEO on the homepage and one deep page
