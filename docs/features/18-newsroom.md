# FE-18 — Newsroom

**Route:** `/newsroom/`
**Depends on:** FE-17 · **Reads:** `content-model.md`, `api-contracts.md`

## Sections

1. `<PageHero>` — "Newsroom"
2. `<NewsGrid>` — **reuse from FE-04**, with `items` from `getNewsPage()`
3. `<Pagination>` — from FE-02

## Implementation

```tsx
export default async function NewsroomPage({ searchParams }) {
  const page = parsePage(searchParams.page);           // clamp to >= 1
  const result = await repo.getNewsPage({ page, pageSize: 9 });
  …
}
```

- Pagination is **URL-driven** (`/newsroom/?page=2`), server-rendered. No client state, no infinite scroll — investors and journalists link to specific pages, and infinite scroll is hostile to both.
- Page size 9 (3×3 desktop). Confirmed as Open Decision #5 in `architecture.md`.
- A `page` above `totalPages` returns `notFound()`, not an empty grid.
- `page=abc` or `page=-1` clamps to 1 rather than erroring.

## Legacy pagination URLs

The legacy site may use `/newsroom/page/2/`. **Check this during the FE-22 crawl** and, if so, add redirects `/newsroom/page/:n/` → `/newsroom/?page=:n`. Flag it here rather than discovering it after launch.

## Article detail

Currently out of scope — SAEL links to external publishers, so `NewsItem.externalUrl` is the destination. If the client later wants hosted articles, that adds a `slug`, a `GET /api/v1/news/{slug}` endpoint, and a `/newsroom/[slug]/` route. See `api-contracts.md` §2.

## Acceptance criteria

- [ ] `<NewsGrid>` is reused unmodified from FE-04
- [ ] Pagination is URL-driven; deep links work; back button works
- [ ] Out-of-range page returns 404; malformed page clamps to 1
- [ ] Items with no image use the fallback; long headlines clamp to 3 lines
- [ ] External links open in a new tab with an accessible new-tab indication
- [ ] Repository failure renders an empty state
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-19**.
