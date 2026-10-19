# FE-21 — Legal Pages

**Routes:** `/privacy-policy/`, `/disclaimer/`, `/terms-and-conditions/`
**Depends on:** FE-20

Three long-form text pages. Simple, but the content is legally reviewed — **port it verbatim.**

## Implementation

One shared `<LegalPage>` composition: `<PageHero>` + `<ProseBlock>` with a `legal` variant.

The `legal` prose variant needs styling the standard variant does not:

- Numbered and nested lists that keep their numbering across nesting levels
- Defined-term emphasis
- A "last updated" date line at the top
- Comfortable measure (`--measure`) and generous line height — these are read, not skimmed
- Optionally a table of contents with in-page anchors for the privacy policy, which is typically the longest

## Content

`{{TODO: content — port verbatim from the live site}}`

Do not rewrite, summarise, or modernise the language. If a clause reads oddly, flag it to the client; do not fix it. If the client has updated policies, use theirs and note the change.

## Notes

- The consent checkbox on the contact forms links to `/privacy-policy/` — verify the link resolves.
- These pages are low-traffic but must be indexable. Standard metadata, no `noindex`.
- Content may be several thousand words; ensure `<ProseBlock>` handles that without a max-height or clamp.

## Acceptance criteria

- [ ] All three routes match legacy paths including trailing slashes
- [ ] Content ported verbatim; any gap marked `{{TODO: content}}` and reported
- [ ] Nested lists render with correct numbering
- [ ] Readable at 360px — no horizontal scroll from long unbroken strings such as URLs or email addresses (`overflow-wrap: anywhere` on prose)
- [ ] Unique metadata per page
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-22**.
