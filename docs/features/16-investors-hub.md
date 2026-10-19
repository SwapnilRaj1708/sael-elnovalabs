# FE-16 — Investors Hub, Corporate Governance, Offer Documents, Notifications

**Routes:** `/investors/offer-documents/`, `/investors/corporate-governance/`, `/investors/notifications/`
**Depends on:** FE-15 · **Reads:** `content-model.md`, `api-contracts.md`

The investor section is the most compliance-sensitive part of the site. Documents must be findable, downloadable, and clearly labelled. Build the **shared document-listing template** here — FE-17 is five more pages of exactly the same pattern.

---

## Shared components

### `<DocumentListing>` — `sections/document-listing/`

The workhorse. **Props:** `documents: InvestorDocument[]`, `groupBy?: 'group' | null`, `emptyMessage?`

- When `groupBy: 'group'` and groups exist, render an `<Accordion>` per group (financial year), most recent expanded by default.
- When groups are absent or `null`, render a flat list.
- Each row uses `<DocumentLink>` from FE-02: title, file type, size, download/external icon.
- Accessible name pattern: *"Annual Return FY 2024-25, PDF, 2.4 MB, opens in a new tab"*.
- `<a href={file.url} target="_blank" rel="noopener noreferrer">` — direct to Azure Blob, no proxying.
- `sizeBytes === null` → omit the size, do not render "null MB".
- `[]` or repository failure → `<EmptyState>` with the supplied message.
- Rows are ≥ 44px tall on touch, with generous horizontal hit area — investors on mobile are the primary reason this page exists.

### `<InvestorLayout>` — `src/app/investors/layout.tsx`

Shared shell for all investor routes: `<PageHero>`, breadcrumb, and a **side navigation** (desktop) / **select or accordion** (mobile) listing the five investor sections with the current one marked `aria-current="page"`. Twelve investor pages without persistent sub-navigation is a dead end for users.

---

## Pages

| Route | Title | Data |
|---|---|---|
| `/investors/offer-documents/` | Offer Documents | `getInvestorDocuments({ category: 'offer-documents' })`, grouped |
| `/investors/corporate-governance/` | Corporate Governance | `getInvestorDocuments({ category: 'corporate-governance' })`, grouped |
| `/investors/notifications/` | Notifications | `getNotifications({ page, pageSize: 20 })` — **paginated**, uses `<Pagination>` from FE-02, page from `searchParams` |

Notifications pagination must be URL-driven (`?page=2`) so pages are linkable and the back button works. Do not use client state.

## Acceptance criteria

- [ ] `<DocumentListing>` handles grouped, ungrouped, empty and failed states
- [ ] `<InvestorLayout>` sub-nav present on every investor route, current page marked
- [ ] PDF links open in a new tab with a complete accessible name including format and size
- [ ] Notifications pagination is URL-driven; `?page=3` deep-links correctly; back button works
- [ ] All rows ≥ 44px on touch
- [ ] Repository failure renders an empty state, never a 500
- [ ] URL parity: all three routes match the legacy paths including trailing slashes
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-17**.
