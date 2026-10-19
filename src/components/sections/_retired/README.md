# `_retired/`

Section components that are **no longer rendered anywhere** and are kept only so
the work is recoverable. Nothing in this folder ships: it is never imported, so
it is never bundled.

**Not `_archive/`.** In this repo "the archive" is the deployable tarball
`scripts/package-release.mjs` produces — see `docs/architecture.md` §7. A folder
of dead code called `archive` would collide with that on every search.

## Rules

1. **Importing from here fails `pnpm lint`.** `no-restricted-imports` blocks
   `@/components/sections/_retired/**` for the whole of `src/`, and
   `pnpm verify:guardrails` asserts the rule still bites. That is what makes
   "retired" a fact about the build rather than a note someone left.
2. **It is still type-checked and linted.** The folder is inside `src/`, so
   `pnpm typecheck` and `pnpm lint` cover it and it cannot quietly rot into
   something that no longer compiles. That is the whole reason it is not parked
   in `docs/` or outside the source tree.
3. **Every retired component carries a header** saying when it was retired, why,
   and what took its place. No exceptions — a file in here without one is
   indistinguishable from a file someone forgot to delete.
4. **Tokens it used are not retired with it.** They usually have other
   consumers, and a token removed on the assumption that its only reader was in
   here is the failure this note exists to prevent. Check before touching one.

## Restoring something

Move the folder back to `src/components/sections/`, then import it normally —
the lint rule keys on the path, so nothing else has to change. Read the header
first: it says what the component was replaced by and why, which is usually the
reason not to.

## Contents

| Component      | Retired    | Replaced by                                                                   |
| -------------- | ---------- | ----------------------------------------------------------------------------- |
| `pixel-strip/` | 2026-08-27 | `sections/footer-pixel-strip/`, its vertical mirror, at the top of the footer |
