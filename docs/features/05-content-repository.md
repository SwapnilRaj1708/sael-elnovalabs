# FE-05 — Content Repository & Mock Data Layer

**Depends on:** FE-04
**Reads:** `content-model.md`, `api-contracts.md`

Build the data boundary that lets every remaining page be developed against realistic data today and cut over to Spring Boot later without touching a component.

> Ordered after the homepage deliberately: FE-04 exercises two repository methods, so the shape of the interface is proven before the whole thing is built out. If the homepage revealed that a method signature is wrong, fix it here.

---

## Scope

### 1. Types — `src/lib/content/types.ts`

Every interface in `content-model.md` §2: `BlobAsset`, `ImageAsset`, `NewsItem`, `InvestorDocument`, `InvestorDocumentCategory`, `TeamMember`, `CapacityStat`, `EsgMetric`, `Paginated<T>`.

Conventions are non-optional: ISO date strings not `Date`; `T | null` not `T?`; pre-formatted display values; stable ids.

### 2. Contract — `src/lib/content/repository.ts`

The `ContentRepository` interface exactly as specified in `content-model.md` §3, plus the error types:

```ts
export class ContentUnavailableError extends Error {
  constructor(readonly endpoint: string, readonly status?: number, cause?: unknown) { … }
}
export class NotImplementedError extends Error {}
```

### 3. Mock implementation — `src/lib/content/mock/`

`MockContentRepository` reading from `data/*.json`. Requirements from `content-model.md` §4 are acceptance criteria, not suggestions:

- 25+ news items seeded from the live site's real headlines, sources and dates
- 40+ investor documents spanning every category and at least three financial years
- Edge cases present: a news item with no image, a 140-character headline, a document with no date, a team member with no photo
- Pagination genuinely implemented — slice, and return honest `totalItems`/`totalPages`
- `MOCK_LATENCY_MS` honoured so loading and error states can be exercised
- Blob URLs composed via `blobUrl()` and plausible; note in the file header that they will 404 until the real account exists

### 4. API implementation — `src/lib/content/api/`

Built now as a **complete skeleton**, wired in FE-23.

- `client.ts` — `apiFetch<T>()` with `AbortController` timeout, Next cache options passthrough (`{ next: { revalidate, tags } }`), non-2xx → `ContentUnavailableError`, Zod parse before return, no retries.
- `schemas.ts` — Zod schemas for every response in `api-contracts.md`.
- `mappers.ts` — backend DTO → domain type.
- `index.ts` — `ApiContentRepository` implementing every method. Methods may throw `NotImplementedError`, but **every method must exist**.

### 5. Factory — `src/lib/content/index.ts`

`getContentRepository()` per `content-model.md` §3, memoised, switching on `env.CONTENT_SOURCE`. Exports only the factory, the types, and the error classes.

Verify the FE-01 ESLint rule actually fires on a direct `@/lib/content/mock` import from outside the folder.

### 6. Form plumbing

- `src/lib/forms/schemas.ts` — one Zod schema per form, imported by both the client component and the route handler. **One definition, two consumers** — never duplicate the validation.
- `src/app/api/forms/[form]/route.ts` — validate, forward (or log-and-succeed while in mock mode), normalise the response to `{ ok: true } | { ok: false, message, fieldErrors? }`.

### 7. Documentation

Add `src/lib/content/README.md`: how to add a new dynamic surface (type → interface → mock → api → UI), and a pointer to the cutover procedure.

---

## Acceptance criteria

- [ ] Every method exists in both implementations; `tsc` proves it
- [ ] Homepage stats and news now resolve through the mock with no component change from FE-04
- [ ] `CONTENT_SOURCE=api` with an unreachable `API_BASE_URL` produces empty states, not a 500
- [ ] `MOCK_LATENCY_MS=1500` makes loading states observable
- [ ] Mock news pagination returns correct counts across page boundaries
- [ ] Importing from `@/lib/content/mock` in a page file fails lint
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-06**.
