# FE-23 — Backend API Cutover

**Depends on:** FE-22 and the Spring Boot endpoints existing
**Reads:** `content-model.md`, `api-contracts.md`

Replace the mock content repository with live Spring Boot data. **If the boundary was built correctly, no component file changes during this entire item.** If one does, the boundary was wrong — fix the boundary, do not patch the component.

---

## Preconditions

- [ ] Spring Boot endpoints deployed to an environment the Next.js server can reach
- [ ] OpenAPI spec supplied
- [ ] Azure Blob container public-read for the document paths, CORS not required (server-to-server)
- [ ] A staging environment where `CONTENT_SOURCE=api` can run while other environments stay on `mock`

## Procedure

### 1. Reconcile the spec

Diff the delivered OpenAPI spec against `api-contracts.md`. Record **every** divergence in the §8 divergence log — endpoint path, field name, type, nullability, date format, pagination shape.

Divergences are absorbed in `mappers.ts`. **The domain types in `content-model.md` do not change** unless the backend has surfaced genuinely new information the frontend needs. Reshaping domain types to match a backend DTO is how the boundary dissolves.

### 2. Schemas

Write `api/schemas.ts` from the **actual** spec, not from `api-contracts.md`. Be strict — `z.string().datetime()` rather than `z.string()`, enums rather than free strings. A strict schema turns a backend regression into a clear log line instead of a blank page.

### 3. Mappers

`api/mappers.ts`, one pure function per type. Handle: field renames, date normalisation, null vs empty string, deriving stable ids where the backend does not supply them (document the derivation), and composing absolute Blob URLs where the backend returns relative paths.

### 4. Implement, one method at a time

For each `ContentRepository` method:

1. Implement it in `ApiContentRepository`.
2. Run the same query against both implementations.
3. Diff the output field by field, including nulls and ordering.
4. Verify the consuming page renders identically.

### 5. Failure paths

Test each explicitly — these are the states that only appear in production if untested:

- Backend unreachable → empty state, page still renders, no 500
- Backend returns 500 → same
- Backend returns malformed JSON → Zod fails, logged with issue paths, empty state
- Backend times out beyond `API_TIMEOUT_MS` → aborted, empty state
- Backend returns `[]` → empty state, not a broken layout
- A Blob PDF URL 404s → link still renders (we cannot verify remote files); confirm this is acceptable to the client

### 6. Cache behaviour

Confirm `revalidate: 300` is honoured, that stale content refreshes, and — if the hosting model has since been decided in favour of a managed multi-instance service — evaluate whether on-demand revalidation via cache tags is now worth wiring up. The tags are already declared.

### 7. Cut over

Flip `CONTENT_SOURCE=api` per environment: staging → soak → production.

### 8. Keep the mock

`MockContentRepository` remains the local development default. **Do not delete it.** It is how the next developer works offline, and how failure states stay testable.

---

## Acceptance criteria

- [ ] Every `ContentRepository` method implemented against live endpoints
- [ ] **Zero changes to files under `src/components/`** — verified with `git diff --stat`
- [ ] Divergence log complete
- [ ] All six failure paths tested and degrading gracefully
- [ ] Mock retained and still working with `CONTENT_SOURCE=mock`
- [ ] No secrets or `API_BASE_URL` in any client bundle
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-24**.
