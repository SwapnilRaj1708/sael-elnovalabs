# SAEL Website — Documentation

This folder is the specification for the SAEL corporate website rebuild. It is written to be consumed by both humans and Claude Code sessions.

## Start here

1. **`/CLAUDE.md`** (repo root) — project rules, conventions, session ritual. Read first, every session.
2. **`frontend-progress.md`** — the tracker. Tells you what to build next.
3. **`features/NN-*.md`** — the spec for the item you are building.

## Reference docs

| File | Contents |
|---|---|
| `architecture.md` | Tech stack, folder structure, layering rules, rendering strategy, deployment constraints |
| `design-guidelines.md` | Colour, gradient, typography, spacing, radius, shadow and motion tokens extracted from the approved prototype |
| `responsive-strategy.md` | Breakpoints, fluid-scale method, and the mobile behaviour of every homepage section |
| `content-model.md` | Domain types, the `ContentRepository` contract, mock fixture layout, mock→API cutover procedure |
| `api-contracts.md` | Proposed REST contracts to hand to the Spring Boot team |
| `asset-inventory.md` | Prototype asset → final asset mapping, naming rules, format and optimisation policy |
| `accessibility-and-seo.md` | URL parity and redirect map, metadata strategy, structured data, a11y quality gates |

## Sub-folders

- **`features/`** — one file per buildable unit, numbered in delivery order. Each contains scope, route, sections, data requirements, responsive notes, and acceptance criteria.

## How this folder grows

The site has ~20 routes and more will be added. When a new page or capability is scoped:

1. Create `features/NN-<slug>.md` using the structure of an existing feature doc.
2. Add a corresponding row to the **Pending** section of `frontend-progress.md`.
3. If it introduces new data, add the types to `content-model.md` and the contract to `api-contracts.md` in the same change.

Numbering is delivery order, not priority — renumbering is disruptive, so append rather than insert. If something genuinely must be built earlier, move its row up in `frontend-progress.md` and leave the filename alone.

## Open decisions

Tracked at the bottom of `architecture.md` under **Open Decisions**. Anything the client has not yet confirmed lives there with a recommended default, so work is never blocked waiting on an answer.
