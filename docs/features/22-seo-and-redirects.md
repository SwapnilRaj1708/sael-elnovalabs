# FE-22 — SEO, Redirects, Sitemap, Robots

**Depends on:** FE-21 · **Reads:** `accessibility-and-seo.md`

Every route now exists. This item makes sure search engines follow us across the migration. **This is the highest-consequence non-visual item in the project** — a botched redirect map costs organic traffic that takes months to recover.

---

## 1. Legacy URL crawl — do this first

Before writing a single redirect:

1. Crawl `https://www.sael.co` fully (Screaming Frog, or `wget --spider -r`). Export every 200-status HTML URL.
2. Export Google Search Console's Pages report — indexed URLs, including ones not linked from the navigation.
3. Export the legacy `sitemap.xml` if one exists.
4. Union the three lists. This is the authoritative inventory.
5. Diff against the route table in `accessibility-and-seo.md` §1.

Every URL in the inventory and not in the route table needs an explicit 301 target. Expect surprises: old campaign pages, paginated newsroom URLs (`/newsroom/page/2/`), orphaned PDFs linked from press releases, `?utm_` variants, uppercase paths.

Commit the inventory as `docs/legacy-url-inventory.csv` so the decision for each URL is reviewable.

## 2. Redirect implementation

`src/lib/seo/redirects.ts` exports the array; `next.config.ts` imports it. Do not inline eighty objects in the config file.

- `permanent: true` (308) for legacy → new mappings.
- **No redirect chains.** A → B → C must be flattened to A → C. Verify with a crawl of the new site.
- Trailing-slash normalisation is handled by `trailingSlash: true` — do not write manual redirects for it.
- Case normalisation if the inventory shows indexed uppercase paths.

## 3. Sitemap

`src/app/sitemap.ts`, generated from `nav-config.ts` plus the investor route list — so a new page cannot be forgotten. Include `lastModified`. Exclude `/career/` (a redirect) and `/_dev/*`.

## 4. Robots

`public/robots.txt`: allow all, reference `https://www.sael.co/sitemap.xml`.

**Staging must return `noindex`.** Gate on `NEXT_PUBLIC_SITE_URL` — if it is not the production host, emit `robots: { index: false, follow: false }` from the root layout. A staging environment indexed under the client's brand is a launch-day incident and it is easy to prevent.

## 5. Metadata audit

Walk every route:

- Unique title ≤ 60 chars, unique description 140–160 chars
- Absolute self-referencing canonical
- `og:image` present and resolving
- `google-site-verification` carried over: `MzPpbkl_8_16EX_FeHk9_UCSCnIGJTxj8N8J89pnOQU`

## 6. Structured data

`Organization` and `WebSite` in the root layout; `BreadcrumbList` on every page below the root. Validate with the Rich Results Test.

## 7. Infrastructure handover

Not our code, but ours to specify — write it up and hand it over:

- Apex `sael.co` → `https://www.sael.co` (301)
- HTTP → HTTPS (301)
- HSTS
- `Cache-Control: public, max-age=31536000, immutable` on `/_next/static/*`
- Brotli/gzip at the proxy

## Acceptance criteria

- [ ] `docs/legacy-url-inventory.csv` committed, every row with a decision
- [ ] Every legacy URL 200s or 308s to the correct target
- [ ] No redirect chains
- [ ] `sitemap.xml` generated, complete, and correct
- [ ] Staging returns `noindex`; production does not
- [ ] Every route has unique metadata and an absolute canonical
- [ ] Structured data validates
- [ ] Lighthouse SEO 100 on the homepage and one deep investor page
- [ ] Infrastructure requirements documented and handed over
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-23**.
