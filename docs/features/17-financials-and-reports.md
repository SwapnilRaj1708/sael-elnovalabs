# FE-17 — Financials & Reports

**Routes:** `/investors/financials-and-reports/` plus five children
**Depends on:** FE-16 · **Reads:** `content-model.md`, `api-contracts.md`

Six routes, one pattern. If FE-16 built `<DocumentListing>` correctly this is mostly routing and content.

---

## Routes

| Route | Title | Category |
|---|---|---|
| `/investors/financials-and-reports/` | Financials & Reports | *(hub — links only)* |
| `…/annual-return/` | Annual Return | `annual-return` |
| `…/consolidated-financials-of-the-company/` | Consolidated Financials of the Company | `consolidated-financials` |
| `…/standalone-financials-of-the-company/` | Standalone Financials of the Company | `standalone-financials` |
| `…/standalone-financials-of-material-subsidiary-companies/` | Standalone Financials of Material Subsidiary Companies | `subsidiary-financials` |
| `…/investor-downloads/` | Investor Downloads | `investor-downloads` |

**Slugs are copied character for character from the legacy site.** They are long and awkward; do not shorten them. URL parity is a client requirement and these are indexed.

## Hub page

Card grid linking to the five children, each with an icon and title, matching the legacy layout. 3 col → 2 → 1. Reuse `<HighlightGrid>` from FE-08 if it fits; otherwise `<Card>`.

## Child pages

Each is:

```tsx
const docs = await repo.getInvestorDocuments({ category: '…' });
return (
  <>
    <ProseBlock … />   {/* optional intro, {{TODO: content}} */}
    <DocumentListing documents={docs} groupBy="group" emptyMessage="…" />
  </>
);
```

All five inherit `<InvestorLayout>` from FE-16, so hero, breadcrumb and sub-nav come free. Extend the sub-nav to show the five children when the user is inside Financials & Reports.

## Notes

- Breadcrumbs go four levels deep: Home › Investors › Financials & Reports › Annual Return. Verify the mobile breadcrumb does not overflow — truncate the middle, never the current page.
- Empty-state copy should be reassuring and specific: "No documents have been published in this category yet." Not "No results."
- Consider a "last updated" line per category if `publishedAt` is available. Investors check for new filings; a stale-looking page prompts support emails.

## Acceptance criteria

- [ ] All six routes exist and match the legacy paths exactly, trailing slashes included
- [ ] Each child renders `<DocumentListing>` with no forked variant
- [ ] Grouping by financial year works; most recent year expanded by default
- [ ] Four-level breadcrumb renders correctly at 360px
- [ ] Every page has unique metadata
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-18**.
