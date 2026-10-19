# API Contracts

**Status: the backend as built.** This describes the SAEL admin backend's public API as it
actually behaves, derived on 2026-10-01 from its controllers, its DTOs and the OpenAPI document
it generates (backend commit `d4ce67f`), and checked against a running instance. **§4.3 was
rewritten on 2026-10-02** from backend commit `788dd62` (row 3.52, document headings), and
checked against a running instance through the panel's own maker → checker → publisher API. It replaces an
earlier *proposal* written before the backend existed. That proposal described `/api/v1/news`,
bare arrays, 1-based pages and field names the backend never had. **Nothing in the earlier
proposal survives unless it is restated here.**

Where this document and the backend disagree, the backend is right and this document is wrong.
Fix the document. Do not code around the difference.

---

## 0. Read these first

Each of the following makes a page **silently render less** rather than fail. None of them
produces an error you will notice in development.

> ### ⚠️ 1. `type` on `news-live` and `section` on `documents-live` are REQUIRED
>
> Omitting either one returns **`400`**, not an empty list. There is no "all categories" call.
> The homepage currently swallows that error and drops its news section with no visible sign.
> A section that disappears is the only symptom. **Every `news-live` call passes `type`. Every
> `documents-live` call passes `section`.** Log every non-2xx with its `code` and
> `correlationId` (§2.4) so a missing section is never silent.

> ### ⚠️ 2. `count` is the number of items ON THIS PAGE, not a total
>
> The envelope is `{ items, page, size, count }`. **No total exists anywhere in the API.** No
> `totalItems`, no `totalPages`, no `hasMore`. One request with the default `size` of 12
> returns at most 12 items. A 42-item section rendered from one request shows 12 items, and
> the page looks complete. **Every listing that must show everything needs a paging loop**
> (§2.3).

> ### ⚠️ 3. `file` and `slug` are null in normal, valid responses
>
> - **`file` is `null`** on a document that is an external link (`itemKind: EXTERNAL_LINK`;
>   use `externalUrl`). It is also `null` on a hosted document whose file was never promoted to
>   public storage — reachable through ordinary panel use: a document published while the
>   backend setting `media.promote-on-publish` is off. **Render that entry, as a visible
>   "unavailable" row, never as an absence** and never as a broken link. Dropping rows with no
>   URL makes a published statutory disclosure disappear from its page with no error.
> - **`slug` is `null` on every `IN_THE_NEWS` and `MULTIMEDIA` item.** Those two types have no
>   detail page. Their detail URL is `404` even where the database holds a slug. Do not build a
>   link from `slug` without checking it.

---

## 1. Endpoints at a glance

Base: `API_BASE_URL` (server-side only), then the paths below. **The prefix is `/app/v1`, not
`/api/v1`.**

| Method | Path | Caller | Purpose |
|---|---|---|---|
| GET | `/app/v1/news-live?type=…` | Next server | Published news of one type |
| GET | `/app/v1/news-live/{slug}?type=…` | Next server | One published Press Release or Our Views article |
| GET | `/app/v1/documents-live?section=…` | Next server | Published investor-document tiles of one section |
| GET | `/app/v1/documents-live/{slug}?section=…` | Next server | One tile's page: the tile plus its documents |
| GET | `/app/v1/news-live-preview[/{slug}]` | Next server | Preview twin of news (needs a preview session) |
| GET | `/app/v1/documents-live-preview[/{slug}]` | Next server | Preview twin of documents (needs a preview session) |
| POST | `/app/v1/preview/session` | Next server | Exchange a `pt` for a preview session token |
| GET | `/app/v1/contact-form/options` | Browser or server | The contact form's subjects, limits and anti-spam settings |
| POST | `/app/v1/contact-enquiry` | **Browser** | Submit the contact form |

**Nothing else exists.** In particular there is no team, board members, board committees,
capacity stats, ESG metrics, investor videos, notifications (as its own endpoint), enquiries,
search or health endpoint for the site. See §9.

The backend also **calls the site**, at `/api/revalidate/` (§7).

### The OpenAPI document

The backend generates an OpenAPI 3.0 description of every `/app/v1` endpoint from its own code.

| | |
|---|---|
| JSON | `GET {api}/v3/api-docs` |
| YAML | `GET {api}/v3/api-docs.yaml` |
| Swagger UI | `{api}/swagger-ui.html` |
| Served in | `local`, `dev`, `uat`. **Not in production.** The backend refuses to start there with it on |

The spec gives types and parameters. It does **not** say which fields may be `null`. This
document does.

---

## 2. Conventions that apply everywhere

### 2.1 Transport and format

- HTTPS, JSON, UTF-8. No authentication on live endpoints.
- **Dates** (`publishDate`, `documentDate`) are ISO dates: `2026-08-20`.
- **Date-times** carry the IST offset: `2026-09-05T03:03:01.176+05:30`.
- **Enums are UPPER_SNAKE_CASE** (`PRESS_RELEASE`, `FY_GROUPED_LIST`). Selector values (`type`,
  `section`) are matched case-insensitively. Response values are always upper case.
- **Identifiers** are UUID strings in `publicId`. There is no numeric `id` and no `id` field.
- **Absent values are `null`**, except where §3–§4 say a key is *omitted*. The detail-only news
  fields and the preview-only keys are omitted, not null.
- `X-Correlation-Id` is on every response. It equals `correlationId` in an error body.

### 2.2 The list envelope

Every list endpoint returns this. No endpoint returns a bare array.

```json
{ "items": [ … ], "page": 0, "size": 12, "count": 12 }
```

| Field | Meaning |
|---|---|
| `items` | This page's items, in the backend's order. **Never re-sort them.** |
| `page` | The page served. **0-based.** |
| `size` | The page size actually served, after clamping. This can differ from what you asked for. |
| `count` | `items.length`. **Not a total.** |

| Parameter | Default | Behaviour |
|---|---|---|
| `page` | `0` | 0-based. Negative or absent is `0`. Past the end returns `items: []`, not an error. |
| `size` | `12` (`content.list.default-page-size`) | **Clamped, never refused.** Values above `100` (`content.list.max-page-size`) are served as `100`. Values below 1 or absent use the default. |
| `limit` | none | Caps this page at `min(limit, size)` items. It does not change the offset. On `IN_THE_NEWS` it is capped again by `content.home.in-the-news.limit` (§3.3). For the homepage rail only. |
| `sort` | — | **Accepted and ignored.** The order is fixed by the backend. |

Unknown query parameters are ignored.

### 2.3 Paging loop: required for every complete listing

```ts
// Fetch every item of one listing. Ask for the maximum and stop on a short page.
async function fetchAll<T>(path: string, params: Record<string, string>): Promise<T[]> {
  const all: T[] = [];
  for (let page = 0; ; page++) {
    const env = await get<Envelope<T>>(path, { ...params, page: String(page), size: '100' });
    all.push(...env.items);
    if (env.count < env.size) return all;   // compare with the SERVED size, not the requested one
  }
}
```

- Compare `count` with the **returned** `size`. The requested `size` may have been clamped.
- When a listing holds an exact multiple of `size`, the loop makes one extra request that
  returns `items: []`. That is expected.
- Order is stable across pages: every query ends in a unique tie-break. An item published
  between two page requests can still shift the boundary by one. Revalidation (§7) re-renders
  the page after a publish, so this corrects itself.
- Do **not** loop on a `limit` request.

### 2.4 Errors

Every error from every endpoint has this shape:

```json
{
  "timestamp": "2026-10-01T19:09:35.611+05:30",
  "correlationId": "65136d3e-e1eb-4716-aa73-119e988d1bc6",
  "code": "NEWS_TYPE_REQUIRED",
  "message": "A news type is required. Valid values are PRESS_RELEASE, IN_THE_NEWS, OUR_VIEWS, MULTIMEDIA.",
  "fieldErrors": [ { "field": "type", "code": "NotBlank", "message": "…" } ]
}
```

- **Branch on `code`**, never on `message` or on the HTTP status alone.
- `fieldErrors` is an **array** of `{ field, code, message }`, and is **omitted** when empty.
- `message` is safe to show a user. It is written for that purpose on the contact form. On
  content endpoints, log it and show your own copy.
- Log `code` and `correlationId` on every non-2xx. With the `correlationId`, the backend team
  can find the request.

| Status | `code` | When |
|---|---|---|
| 400 | `NEWS_TYPE_REQUIRED` | `news-live` without `type` |
| 400 | `NEWS_TYPE_INVALID` | `type` is not one of the four values |
| 400 | `NEWS_TYPE_SCOPE_MISMATCH` | Preview: `type` contradicts the preview session |
| 400 | `VALIDATION_FAILED` | `documents-live` with `section` absent, invalid, or contradicting the preview session (`fieldErrors[0].field = "section"`, `code` = `NotBlank` / `Invalid` / `Mismatch`); a malformed preview-session body |
| 400 | `MALFORMED_REQUEST` | A body that is not JSON |
| 401 | `AUTH_TOKEN_INVALID` | Preview fetch with no session, or an expired or revoked one |
| 401 | `PREVIEW_TOKEN_INVALID` / `_EXPIRED` / `_CONSUMED` / `_REVOKED` | Preview exchange refused (§6.2) |
| 403 | `PREVIEW_SCOPE_MISMATCH` | Preview session for a screen this resource does not serve |
| 404 | `RESOURCE_NOT_FOUND` | Unknown resource or slug, an unpublished slug, a detail request for `IN_THE_NEWS`/`MULTIMEDIA`, or any preview path while preview is switched off |
| 429 | `INTAKE_RATE_LIMITED` | Contact form (§8) |
| 400 / 503 | `INTAKE_*` | Contact form (§8) |
| 500 | `INTERNAL_ERROR` | Anything unexpected. Retryable |

### 2.5 Caching headers

| Response | `Cache-Control` | Other |
|---|---|---|
| Live 2xx | `api.public.cache-control`, a backend Tier 2 setting. **Currently `no-store`** | none |
| Preview 2xx | `no-store` | `X-Robots-Tag: noindex, nofollow`, `Vary: Authorization` |
| Any error | `no-cache, no-store, max-age=0, must-revalidate` | — |
| Contact form, preview exchange | `no-store` | — |

The live endpoints send `no-store` today, so a `fetch` that honours response headers will not
cache them. **The site's caching is ISR plus on-demand revalidation (§7)**, decided in the
site's own code. Do not take it from these headers. Never cache a preview response or an error.

### 2.6 Media URLs

- Image and file URLs are **absolute**. They point at Azure Blob Storage in deployed
  environments and at Azurite locally (`http://127.0.0.1:10000/devstoreaccount1/sael-media-public/…`).
  The host differs per environment, and changes again when SAEL's storage account replaces the
  current one. Allow it in `images.remotePatterns` per environment.
- The backend serves **originals only**, never renditions. Size images with `next/image`.
- An image's `width`/`height` are intrinsic pixels, or `null` for an imported asset that was
  never measured. Do not assume they are present.
- A published file is never overwritten. A corrected document gets a new URL, and the old URL
  keeps working.
- Legacy `www.sael.co/documents/**` and `/img/**` addresses are handled by a redirect map that
  the backend team issues per environment. See `frontend-recommendations.md` §3C in the backend
  repository.

### 2.7 Rich text

`bodyHtml`, `descriptionHtml` and `gate.disclaimerHtml` arrive **already sanitised** against this
allowlist: `p, br, strong, em, u, mark, ul, ol, li, h2, h3, h4, blockquote, a, img, table, thead,
tbody, tr, th, td, sup, sub`. `<mark>` is an editor highlight and must be styled. The backend
contract asks that these fields **not be sanitised again**. Several sanitisers' default
configurations strip `<mark>`. If the site keeps a second sanitiser, its allowlist must be a
superset of the list above.

---

## 3. News — `news-live`

### 3.1 `GET /app/v1/news-live`

| Parameter | Required | Values |
|---|---|---|
| `type` | **yes** | `PRESS_RELEASE`, `IN_THE_NEWS`, `OUR_VIEWS`, `MULTIMEDIA`. `filter` and `section` are accepted as aliases |
| `page`, `size`, `limit`, `sort` | no | §2.2 |

**Order:** set **only** by the admin panel's Reorder screen (backend 1.14, rows 3.59–3.61). Items
nobody has placed yet — newly published ones — come first, newest first, then the placed items in
the editor's order. Render in the order given. **Nothing on the site re-sorts a news list**, by
date or by any flag: the listings, the Newsroom index and the homepage rail all show the API's
order.

**Response:** the envelope (§2.2) with `items` of `NewsBody`:

| Field | Type | Null? | Notes |
|---|---|---|---|
| `publicId` | string (UUID) | never | |
| `type` | enum | never | The four values above |
| `title` | string | never | |
| `slug` | string | **always null for `IN_THE_NEWS` and `MULTIMEDIA`** | Set for `PRESS_RELEASE` and `OUR_VIEWS`. Immutable once published |
| `publishDate` | date | may be null for `OUR_VIEWS` and `MULTIMEDIA` | Required at submit for the other two |
| `summary` | string | yes | |
| `heroImage` | `{ url, altText, width, height }` | yes | Required at submit, but `null` on live if never promoted. `altText` may be null on imported items. `width`/`height` may be null |
| `externalUrl` | string | yes | `IN_THE_NEWS`: the article elsewhere |
| `sourcePublication` | string | yes | `IN_THE_NEWS`: the publication's name |
| `mediaKind` | `YOUTUBE` \| `VIMEO` \| `HOSTED` | yes | `MULTIMEDIA` only. **Vimeo is possible** |
| `mediaUrl` | string | yes | The YouTube/Vimeo URL |
| `mediaVideoId` | string | yes | The id extracted from `mediaUrl`, for thumbnails and embeds |
| `mediaFileUrl` | string | yes | `HOSTED` video: the file's public URL |
| `featured` | boolean | never | **Always `false` since backend 1.14.** Means nothing; the site does not read it |

Listing items **omit** the detail-only fields below. The keys are absent, not null.

### 3.2 `GET /app/v1/news-live/{slug}`

| Parameter | Required | |
|---|---|---|
| `slug` (path) | yes | |
| `type` | **yes** | Same refusals as the listing |

**Only `PRESS_RELEASE` and `OUR_VIEWS` have detail pages.** Any slug under `IN_THE_NEWS` or
`MULTIMEDIA` returns `404`. An unknown slug, or one that is not published, also returns `404`.
The two cases cannot be told apart, by design.

**Response:** a bare `NewsBody` (no envelope), with every field in §3.1 plus these. Each is
**omitted when null**:

| Field | Type | Notes |
|---|---|---|
| `bodyHtml` | string | Sanitised HTML (§2.7) |
| `authorName` | string | Optional |
| `seoTitle`, `seoDescription` | string | Optional. Fall back to `title` / `summary` |
| `ogImage` | `{ url, altText, width, height }` | Optional |

**`HEAD` on the same URL answers `200` or `404` with no body.** Checked against the running
backend on 2026-10-01. `src/proxy.ts` calls it, uncached, on every request for an article page,
and sends a `404` to the root not-found page before the route renders (by marking the request for
a rewrite in `next.config.ts`, §6.3). A `notFound()` thrown
from the page itself reaches a visitor in Next 16.3 as a 404 with an empty HTML body that only
JavaScript fills. The check fails open: on any other answer, or none within 2 s, the page is
served as it would be without it.

### 3.3 The homepage "In The News" rail

`GET /app/v1/news-live?type=IN_THE_NEWS&limit=12&size=12`

- `type=IN_THE_NEWS` is **mandatory**. Without it the call is a `400`, and the rail disappears.
- **The backend decides what the rail shows**, and returns one of two lists:
  - **Highlights** — the items SAEL marked for the homepage in the panel, in their chosen order,
    up to 12. When any are marked, these are the whole answer and the setting below does not
    apply.
  - **The latest K** — when none are marked, the first `min(limit, K)` items of the listing, in
    listing order (§3.1). K is the backend setting `content.home.in-the-news.limit`, `9` by
    default.
- **`12` is a ceiling, not a target.** It is the most the backend will ever return
  (`HOME_RAIL_CEILING` in `src/app/page.tsx`); the site asks for it so that a full set of
  highlights always fits, and `size` matches so one page holds the whole answer. Expect anything
  from 1 to 12.
- **Show exactly what arrives, in that order.** No re-sort, no padding, no trimming. The carousel
  is built for any count from 1 to 12: when every card fits, its arrows stay disabled and it does
  not advance.
- The mock repository answers as the backend does with nothing highlighted: the first nine
  In The News items of its Newsroom fixture.
- Publishing, unpublishing or reordering an `IN_THE_NEWS` item, and changing the highlights, each
  revalidate `/` (§7).

---

## 4. Investor documents — `documents-live`

### 4.1 The model: sections → tiles → documents

The backend has **four sections**. Each is a fixed page on the site:

| `section` | Page | `section.basePath` |
|---|---|---|
| `OFFER_DOCUMENTS` | Offer Documents | `/investors/offer-documents/` |
| `CORPORATE_GOVERNANCE` | Corporate Governance | `/investors/corporate-governance/` |
| `FINANCIALS_REPORTS` | Financials & Reports | `/investors/financials-and-reports/` |
| `NOTIFICATIONS` | Notifications | `/investors/notifications/` |

Inside a section are **tiles** (the API calls each one a `category`), addressed by `slug`. A
tile's page is `section.basePath + slug + "/"`, for example
`/investors/offer-documents/drhp/`. A sub-page such as DRHP, Annual Return or Codes & Policies
is a **tile**, not a separate category or section parameter. Tiles hold documents.

### 4.2 `GET /app/v1/documents-live`: the tiles of one section

| Parameter | Required | Values |
|---|---|---|
| `section` | **yes** | The four values above. `filter` and `type` are aliases |
| `page`, `size`, `limit`, `sort` | no | §2.2. A section's tiles are paged like anything else, so use the paging loop |

**Order:** editorial (the panel's display order, then title). **Render in the order given.**
The site's section indexes are built from this listing, so a tile a maker publishes appears with
no release. **A tile's `slug` must equal the site's route segment for it** — see §4.5.

**Response:** the envelope with `items` of `DocumentCategoryBody`:

| Field | Type | Null? | Notes |
|---|---|---|---|
| `publicId` | string | never | |
| `section` | `{ code, label, basePath }` | never | `label` can be renamed by a Super Admin. Read it, do not hard-code it |
| `title` | string | never | Show verbatim |
| `slug` | string | never on a live tile | |
| `displayMode` | enum | never | `SINGLE_DOCUMENT`, `DOCUMENT_LIST`, `MEDIA_LIST`, `FY_GROUPED_LIST`; `EXTERNAL_LINK` is reserved and not offered in the panel |
| `descriptionHtml` | string | yes | §2.7 |
| `thumbnail` | `{ url, altText, width, height }` | yes | |
| `gate` | `{ enabled, disclaimerHtml }` | `gate` never; `disclaimerHtml` null whenever `enabled` is false | §4.4 |
| `displayOrder` | integer | yes | Informational. The order of `items` already applies it |
| `itemCount` | integer | never on live (a `COUNT`; `@JsonInclude(NON_NULL)` in the DTO, but never null here) | Published documents on the tile's page. **`0` is valid** |
| `seoTitle`, `seoDescription` | string | **omitted** when null | |

### 4.3 `GET /app/v1/documents-live/{slug}`: one tile's page

| Parameter | Required | |
|---|---|---|
| `slug` (path) | yes | The tile's slug |
| `section` | **yes** | The tile's section |

**Not paginated.** One response holds every published document on the tile. `HEAD` on the same
URL answers `200` for a live tile and `404` otherwise, with no body (checked 2026-10-02);
`src/proxy.ts` uses it as it does for articles (§3.2).

```json
{
  "category": { …DocumentCategoryBody… },
  "groups": [
    { "label": "Extra-Ordinary General Meeting", "anchor": "extra-ordinarygeneralmeeting",
      "items": [],
      "subgroups": [
        { "label": "FY 2026", "anchor": "extra-ordinarygeneralmeeting-fy2026", "items": [ { …DocumentItemBody… } ] },
        { "label": "FY 2025", "anchor": "extra-ordinarygeneralmeeting-fy2025", "items": [ … ] }
      ] },
    { "label": "Postal Ballot", "anchor": "postalballot", "items": [], "subgroups": [] },
    { "label": null, "anchor": null, "items": [ … ], "subgroups": [] }
  ]
}
```

`Group`: `{ label, anchor, items, subgroups }`. `Subgroup`: `{ label, anchor, items }`.

| Field | Type | Null? | Notes |
|---|---|---|---|
| `label` | string | **yes** | SAEL's wording, verbatim: `Statutory Policies`, `FY2026`, `FY 2024-25`. Show as given. `null` for documents under no heading, and for the one group of a tile that does not group. Never null on a subgroup |
| `anchor` | string | **null exactly when `label` is** | The heading's in-page id, lower-case letters and digits in hyphen-separated runs (`fy2024-25`). Never null on a subgroup, and unique on the page |
| `items` | `DocumentItemBody[]` | never | The documents directly under the heading, in page order. **`[]` is valid**, on a heading too |
| `subgroups` | `Subgroup[]` | never | One level only. `[]` when there are none, and always `[]` on a tile with no headings |

**Where the groups come from.** A tile's headings are its *outline*, maintained in the panel:

- **A tile with an outline** returns one group per heading, in the outline's order, each with its
  subheadings. **A heading with nothing published under it is still returned**, with empty lists:
  General Meeting's "Postal Ballot" is a heading with nothing under it on the legacy page, and on a
  statutory page an empty heading carries meaning. Render it as a heading alone.
- **Documents under no heading**, or under one the served outline does not hold, follow in a
  **last group whose `label` and `anchor` are `null`. They are never dropped**, and the site must
  not drop them either: render them without a heading.
- **A tile with no outline** is grouped as before row 3.52: `FY_GROUPED_LIST` has one group per
  stored financial year, newest first, with the anchor made from that label (`fy2025`) and a
  trailing unlabelled group for documents with no year; every other mode has one unlabelled
  group. `subgroups` is always `[]` here.
- **`groups` is `[]`** only for a tile with no outline and nothing published. Render an empty page,
  not a 404. A tile must never vanish from a compliance page.

**Render groups, subgroups and documents in the order given. Never sort any of them**, on the
label or on anything else. The order is editorial: CSR runs oldest year first.

**Use `anchor` as given, as the heading's `id` and as the `#` fragment of any link to it. Never
derive an anchor from a label.** The backend stores each anchor and fixes it the first time the
tile is published with that heading, so a published deep link keeps landing however the label is
later reworded. A site that computed its own from the label would break exactly that, and would
disagree with the backend wherever its rule differs (the backend keeps hyphens: "FY 2024-25" is
`fy2024-25`). The site validates the form and nothing else.

**Publish order.** A document under a heading cannot be published until the tile's version that
carries the heading is live: the publish is refused with `409 WORKFLOW_INVALID_TRANSITION`
("Publish the tile's change first…"). This is the backend working, not a defect.

`DocumentItemBody`:

| Field | Type | Null? | Notes |
|---|---|---|---|
| `publicId` | string | never | |
| `title` | string | never | Show verbatim |
| `description` | string | yes | Plain text. Not shown by the site today |
| `documentDate` | date | yes | The site maps it to `publishedAt` |
| `financialYear` | string | yes | The stored label, e.g. `FY 2026`. Metadata only: headings come from the groups |
| `itemKind` | `FILE` \| `EXTERNAL_LINK` \| `VIDEO` \| `AUDIO` | never | |
| `language` | string | yes | Display metadata only. Not shown by the site today |
| `file` | `{ url, contentType, sizeBytes, sizeDisplay, sha256 }` | **yes, see §0** | `null` for a link, or for a file never promoted. `sizeDisplay` (e.g. `2.4 MB`) is null when the backend's show-file-size setting is off. `sizeBytes` is null for an external asset. `contentType` is verified against the file's bytes at upload |
| `externalUrl` | string | yes | Set for `EXTERNAL_LINK`, and for a `VIDEO`/`AUDIO` hosted elsewhere |

There is no `fileName`, `mimeType` (use `file.contentType`), `publishedAt`, poster or caption
track. **The site's file-type label ("PDF") is taken from `file.contentType`**, not from a file
name, which the API does not send.

How the site renders each document: `file` → a link to `file.url`; else `externalUrl` → a link to
it; else → an "unavailable" row with the title and a line saying the file is not available. Never
an absence.

### 4.4 The disclaimer gate is an interstitial, not access control

`category.gate.enabled` means "show `gate.disclaimerHtml` and an I Confirm / I Do Not Confirm
choice before the documents". The disclaimer text is maintained in the admin panel and versioned
there. Render it from the response. **The document URLs arrive in the same response as the
disclaimer**, and no acceptance is recorded anywhere. Anything that reads the JSON has the
files. Withholding URLs until confirmation is a frontend presentation choice. It is not a
guarantee, and it must not be described as one.

**What the site does with it.** A gate is the tile's, so it applies to any tile in any section,
not to a list the site keeps. Every document of a gated tile is a row that opens
`gate.disclaimerHtml` first, its URL kept out of the HTML and fetched by a Server Action on
"I Confirm" — and that action resolves URLs only from tiles the backend has gated. A gated
`MEDIA_LIST` tile holding exactly one hosted recording (the DRHP audio-visuals) shows the notice
on arrival and plays the recording in the page, "I Do Not Confirm" returning to the section.
The backend refuses to submit a gated tile with a blank disclaimer; the site's schema refuses one
that arrives anyway, rather than showing gated documents without their notice.

### 4.5 A tile's slug must be the site's route segment

The backend builds a tile's page address, and the paths its webhook revalidates (§7.1), from
`section.basePath + slug + "/"`. If a tile's slug is not the site's route segment for it, three
things happen at once, and none reports itself: the page 404s (or a different page answers), the
webhook revalidates a path that is not a route, and the webhook still returns 2xx, so the backend
records the publish as delivered.

The site's routes are fixed by SAEL's legacy URLs and the redirect map, so **when the two disagree
the tile is what changes** (in the panel or the import), never the route. The site serves:

| Section | Route | Legacy tile slugs (www.sael.co, read 2026-10-02) | Not tiles |
|---|---|---|---|
| `OFFER_DOCUMENTS` | `/investors/offer-documents/[slug]/` | `drhp`, `corrigendum-to-drhp`, `addendum-to-drhp`, `industry-report`, `drhp-audio-visuals-english`, `drhp-audio-visuals-hindi`, `outstanding-dues-to-material-creditors`, `information-with-respect-to-group-companies` | — |
| `CORPORATE_GOVERNANCE` | `/investors/corporate-governance/[slug]/` | `codes-and-policies`, `sustainability-reports`, `csr`, `general-meeting`, `familiarization-programme`, `other-documents` | `board-of-directors`, `board-committees` (static pages; a tile with either slug is never shown) |
| `FINANCIALS_REPORTS` | `/investors/financials-and-reports/[slug]/` | `annual-return`, `consolidated-financials-of-the-company`, `standalone-financials-of-the-company`, `standalone-financials-of-material-subsidiary-companies`, `investor-downloads` | — |
| `NOTIFICATIONS` | `/investors/notifications/` — **the section page is the tile `notifications`** | `notifications` | any other tile has no page |

The check is `app/investors/_lib/tile-routes.ts`. A live tile the site cannot serve (hidden by a
static page, the wrong section `basePath`, or a second Notifications tile) **fails the build**, and
at runtime is logged and left off the index. A legacy URL with no live tile behind it is logged
on every build and render (`[investors] No live tile for …`), naming any live slug that is not a
legacy URL, which is where a misspelt slug shows up.

---

## 5. Preview — `*-live-preview`

### 5.1 Endpoints

`GET /app/v1/news-live-preview[/{slug}]` and `GET /app/v1/documents-live-preview[/{slug}]`.
They take the same parameters as their live twins, with two differences:

- `type` / `section` is **optional**. The session already names the screen. If you send it, it
  must agree with the session, or the response is `400` (`NEWS_TYPE_SCOPE_MISMATCH`, or
  `VALIDATION_FAILED` for documents).
- `includeDeleted=true` additionally returns soft-deleted records, each marked `"deleted": true`.

**Credential:** `Authorization: Bearer <sessionToken>` on **every** preview fetch. The backend
also accepts the token in a `sael_preview` cookie, and the header wins when both are sent. A
server-side fetch uses the header. **The site never sets a cookie of that name** (§6.3).

**Send `type` / `section` anyway.** The four news screens share one endpoint, so without `type`
an In The News session on `news-live-preview` answers `200` with In The News items. Checked on
2026-10-04 against the running backend. A Press Release page that omitted `type` would quietly
render another section's drafts. With `type`, the same request is `400
NEWS_TYPE_SCOPE_MISMATCH`. The same holds for `section` on `documents-live-preview`: a request
naming another section is `400 VALIDATION_FAILED` with `fieldErrors[0]` = `section` / `Mismatch`
(checked 2026-10-05), and the site treats it, like the news `400`, as a session for another screen.

**Response:** identical to live, with one extra key per record:

```json
"preview": { "status": "PENDING_APPROVAL", "versionNo": 3, "isDraft": true,
             "lastUpdatedBy": "Meera Raghavan", "lastUpdatedAt": "2026-09-05T03:03:01.176+05:30" }
```

- Each record shows its most recent state, draft or not. Branch on `preview.isDraft` for the
  ribbon. Do not branch on the eight `status` values.
- On a tile page, `preview` sits beside `category` at the top level, and **each document also
  carries its own `preview`**.
- `deleted` appears only when true.
- File and image URLs may be short-lived signed URLs (SAS) to private storage. Never cache or
  persist them.
- A record in preview is a draft, and **may not satisfy the live schema** — an In The News draft
  saved without its article URL, a Multimedia draft with no video. The site keeps such a record
  and names what it lacks (§6.3); it never drops it, as live does.

> **Differs from live — found 2026-10-05, to raise with the backend team.** For a **published**
> document whose file was never promoted (published while `media.promote-on-publish` was off), live sends
> `file: null` — the site shows "File not available online at present" — but preview sends the
> same document's file as a working SAS URL. Seen on Corrigendum to DRHP's "Second corrigendum
> (file never promoted)". A checker reviewing that tile sees a document that opens; the public
> sees one that does not. The same will be true of a draft whose file is not promoted when it
> publishes. The site renders what each endpoint sends and does not try to correct for it: it
> has no way to tell from the response which files are public.

| Status | `code` | Meaning |
|---|---|---|
| 401 | `AUTH_TOKEN_INVALID` | No session, or it expired (30 min) or was revoked. Show the "expired or already used" copy |
| 403 | `PREVIEW_SCOPE_MISMATCH` | The session is for another resource, e.g. a news session on `documents-live-preview` |
| 400 | `NEWS_TYPE_SCOPE_MISMATCH`, or `VALIDATION_FAILED` with `section` / `Mismatch` | The `type` or `section` sent names another screen than the session's |
| 404 | `RESOURCE_NOT_FOUND` | Preview is switched off, or no such slug |

---

## 6. Preview session — `pt` and `POST /app/v1/preview/session`

### 6.1 The flow

1. A reviewer clicks **Live Preview** in the admin panel. The panel sends their browser to
   `{preview.site.base-url}{path}?pt=<token>`. `{path}` is one of eight section preview pages:

   | Screen | Path the panel opens |
   |---|---|
   | `NEWS_PRESS_RELEASE` | `/newsroom/press-release-preview/` |
   | `NEWS_IN_THE_NEWS` | `/newsroom/in-the-news-preview/` |
   | `NEWS_OUR_VIEWS` | `/newsroom/our-views-preview/` |
   | `NEWS_MULTIMEDIA` | `/newsroom/multimedia-preview/` |
   | `DOC_OFFER_DOCUMENTS` | `/investors/offer-documents-preview/` |
   | `DOC_CORPORATE_GOVERNANCE` | `/investors/corporate-governance-preview/` |
   | `DOC_FINANCIALS_REPORTS` | `/investors/financials-and-reports-preview/` |
   | `DOC_NOTIFICATIONS` | `/investors/notifications-preview/` |

   The panel always opens the **section listing** preview, never an item's detail page. Detail
   previews (`/newsroom/press-release-preview/{slug}/`, a tile's preview page) are reached by
   navigating from the listing.

2. **`pt` arrives as a query parameter. The site cannot validate it.** It is an opaque random
   value whose hash only the backend holds. There is no signature to check, nothing to decode
   and no expiry to read. Its only use is to be exchanged, once, server-side:

   ```http
   POST /app/v1/preview/session
   Content-Type: application/json

   { "token": "<pt>" }
   ```

   ```json
   200 { "sessionToken": "eyJ…", "expiresInSeconds": 1800,
         "screenCode": "NEWS_PRESS_RELEASE", "issuedFor": "reviewer@sael.co" }
   ```

3. Store `sessionToken` server-side or in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie with
   `maxAge = expiresInSeconds`. **Redirect to the same path without `?pt=`**, so the token
   leaves the address bar, history and referrers.
4. Send `Authorization: Bearer <sessionToken>` on every preview fetch (§5).

**Backend defect, reported 2026-10-01; not seen on 2026-10-05:** the panel emitted `pt` **twice**
(`?pt=X&pt=X`, the same value both times). On 2026-10-05 every Live Preview link from the panel,
news and investor screens alike, carried it once. In App Router a doubled `searchParams.pt` is a
`string[]`, and `JSON.stringify({ token: searchParams.pt })` sends an array, which the backend
refuses. Keep reading the first value (`URLSearchParams#get`, or `Array.isArray(v) ? v[0] : v`):
it is correct either way.

### 6.2 Rules

- **Exchange server-side only.** Neither `pt` nor `sessionToken` may reach client JavaScript.
- **`pt` is single-use and lives 15 minutes.** A second exchange returns `401
  PREVIEW_TOKEN_CONSUMED`. A forwarded link does not work for the colleague it was forwarded
  to. This is intentional. The copy should say "This preview link has expired or has already
  been used. Please generate a new Live Preview from the admin panel." Do not show a generic
  error page.
- **The session is scoped to one screen** (`screenCode`), not to one item. It serves that
  section's whole preview listing and any detail within it. It does not serve any other
  section.
- Exchange refusals: `400 VALIDATION_FAILED` (no token, or longer than 512 characters), and
  `401` with `PREVIEW_TOKEN_INVALID`, `PREVIEW_TOKEN_EXPIRED`, `PREVIEW_TOKEN_CONSUMED` or
  `PREVIEW_TOKEN_REVOKED`. All four 401s get the same copy.
- Every preview page needs `export const dynamic = 'force-dynamic'`,
  `<meta name="robots" content="noindex, nofollow">`, exclusion from `sitemap.xml`, and a fixed,
  unmissable **DRAFT PREVIEW** banner. **A cached preview page is a published draft.**

### 6.3 How the site implements it

Built on 2026-10-04 for Press Release, and on 2026-10-05 for the other seven screens. All eight
pages of §6.1 exist.

| Piece | Where | What it does |
|---|---|---|
| Registry | `src/lib/preview/pages.ts` | The eight preview pages — each one's screen, root, and whether it has detail pages — the cookie's name, and the navigation test. A screen absent from it has no page, and its links are never exchanged |
| Proxy | `src/proxy.ts` | A **real page load** of a preview path carrying `pt` is sent, internally, to the handler. Anything else goes straight to the page. The live existence check never runs on a preview path |
| Rewrites | `src/lib/routing/internal-rewrites.ts`, `next.config.ts` `rewrites()` | The proxy never calls `NextResponse.rewrite()`: it sets `x-sael-internal-rewrite` and a `beforeFiles` rewrite routes on it, to the handler or to `/__not-found__/`. A proxy rewrite needs an absolute URL, and behind nginx Next 16.3 proxied every one out of the server (2026-10-05). The proxy strips the header from what clients send. The handler reads the preview page from its URL's own path, which Next leaves as the one the reviewer opened, so a `to` in the query cannot redirect them |
| Handler | `src/app/api/preview/route.ts` | Exchanges the **first** `pt`, stores the session, and answers `303` to the same path without `pt`. A relative `Location`, because behind nginx the process does not know its public host |
| Pages | `src/app/{newsroom,investors}/*-preview/` | `force-dynamic`, a few lines each around `newsroom/_lib/preview-pages.tsx` and `investors/_lib/preview-pages.tsx`. They render the live route's own component with preview data, images `unoptimized`, under `<PreviewBanner>` |
| Shared | `src/app/_lib/preview.ts` | The session read, the notice and refusal messages, `noindex` metadata, the banner's incomplete block |
| Header | `next.config.ts` `headers()` | `X-Robots-Tag: noindex, nofollow` on every `/{newsroom,investors}/*-preview/…` path |
| Check | `pnpm verify:guardrails`, check 8 | Fails unless the registry, the route files and the proxy matchers agree, and every preview page is `force-dynamic` with no `revalidate` |
| Check | `pnpm verify:guardrails`, check 9 | Fails on any `NextResponse.rewrite(` or `.redirect(` under `src/`, and on a URL built in `src/proxy.ts` from `request.url`, `nextUrl.clone()`, `nextUrl.origin` or `new URL(` |

**The eight pages, and the live component each renders:**

| Preview page | Detail pages | Live component |
|---|---|---|
| `/newsroom/press-release-preview/` | `[slug]/` | `<NewsListing>`, `<NewsArticlePage>` |
| `/newsroom/in-the-news-preview/` | none — cards open the publication | `<NewsListing>` |
| `/newsroom/our-views-preview/` | `[slug]/` | `<NewsListing>`, `<NewsArticlePage>` |
| `/newsroom/multimedia-preview/` | none — cards play in the dialog | `<NewsListing>` |
| `/investors/offer-documents-preview/` | `[slug]/` — each tile | `<AreaIndex>`, `<TilePage>` |
| `/investors/corporate-governance-preview/` | `[slug]/` — each tile | `<AreaIndex>`, `<TilePage>` |
| `/investors/financials-and-reports-preview/` | `[slug]/` — each tile | `<AreaIndex>`, `<TilePage>` |
| `/investors/notifications-preview/` | none — the one tile is the page | `<NotificationsPageBody>` |

- **Cookie: `sael_site_preview`**, `HttpOnly`, `SameSite=Lax`, `Secure` in production, `Max-Age`
  = `expiresInSeconds`, **`Path` = the preview page's root** (`/newsroom/press-release-preview/`).
  Not the backend's `sael_preview`, and never `Path=/`. The site and the backend share one origin
  behind nginx. A cookie the backend reads, scoped wide enough to reach `/app/v1/`, would make
  the preview API callable from the reviewer's browser. One cookie per page also means a second
  reviewer link for another section does not end the first one's session.
- **Only a navigation spends `pt`.** That means `GET` with `Sec-Fetch-Mode: navigate`,
  `Sec-Fetch-Dest: document`, and no `Sec-Purpose`/`Purpose` of `prefetch` or `prerender`. Link
  unfurlers (Slack, Teams, Outlook link scanning) and `<Link>` prefetches send none of that, so
  the link survives them. This fails closed. A browser without Fetch Metadata (Safari before
  16.4) cannot open a preview.
- **A refusal goes back to the page as `?preview=`**: `link-refused`, `wrong-screen`
  (`&for=<screenCode>`) or `unavailable`. The page shows copy from `src/app/_content/preview.ts`.
  The parameter is not a secret. It only chooses the message.
- **Opening a spent link a second time in the same browser** finds the backend refusing the
  token and the cookie still present. The handler then redirects without a notice, and the
  existing session serves the page. In any other browser, the reviewer sees "expired or already
  used".
- **A link for another screen** (the panel's `preview.path-template` pointing at the wrong page)
  is exchanged, found to be for another screen, and **not stored**. The reviewer is told which
  section the link was for and which page they are on ("This preview link is for Offer
  Documents, not Corporate Governance").
- **The preview body is mapped by the live mappers.** `toNewsItem`, `toNewsArticle`,
  `toInvestorTile` and the document mapper are reused, so live and preview cannot map a field
  differently. What changes is where links go: an article card to its preview page, a tile on
  the index and in the side list to its preview page, and a gated media tile's "I Do Not
  Confirm" to the section's preview.
- **A record the site cannot map is shown as incomplete, never dropped.** On live such a record
  is left out (in production) and logged. On a preview it is listed in the banner under
  "Incomplete, so not shown below", with what it lacks in the panel's terms ("Missing a link"),
  the heading it sits under for a document, and its workflow state. A detail page whose own
  record cannot be drawn says so instead. A tile whose slug the site has no page for is listed
  the same way ("a URL slug this website has a page for").
- **Gated tiles are gated in preview**, exactly as on live: the disclaimer is part of what the
  checker approves. The URLs stay out of the page until "I Confirm"; they are then read by
  `app/investors/preview-actions.ts`, which reads the tile through the reviewer's session (the
  cookie reaches the action because it posts to the page's own URL). A draft document's file is
  then a SAS URL to private storage.
- **What differs from the live page, on rendered HTML** (checked 2026-10-05, published records
  in every section): the banner; images `src`-only, with no `srcSet`/`sizes`; links that stay
  inside the preview; and the section's draft records, which appear because the preview shows
  the section's most recent state — draft tiles on an index and in a tile page's side list. A
  published tile with no drafts is otherwise byte-identical outside its side list. The one
  exception is the backend difference in §5.1: a never-promoted file.

## 7. Revalidation — the backend calls the site

### 7.1 What arrives

After every publish, unpublish and delete-of-published, every newsroom reorder and every change to
the homepage highlights, the backend POSTs to the URL in its
setting `publish.revalidation.url`, for example `https://www.sael.co/api/revalidate/`:

```http
POST /api/revalidate/
Content-Type: application/json
X-SAEL-Timestamp: 1759325400
X-SAEL-Signature: sha256=3f1c…e9

{"event":"CONTENT_PUBLISHED","screenCode":"NEWS_IN_THE_NEWS","itemPublicId":"3ab9…","paths":["/newsroom/in-the-news/","/newsroom/","/"],"occurredAt":"2026-10-01T10:04:00.000+05:30"}
```

| Field | Meaning |
|---|---|
| `event` | `CONTENT_PUBLISHED`, `CONTENT_UNPUBLISHED`, `CONTENT_DELETED`, `CONTENT_REORDERED` or `HOME_HIGHLIGHTS_CHANGED` (the last two since backend 1.14). Same body for all five. Nothing needs to branch on it; it is read for the log line |
| `screenCode` | The screen the record belongs to (§6.1 table) |
| `itemPublicId` | The record's `publicId`. **`null`** for `CONTENT_REORDERED` and `HOME_HIGHLIGHTS_CHANGED`, which are about a list rather than one record. The site accepts `null` or absence for every field but `paths` |
| `paths` | **Revalidate every one.** Each ends in `/` |
| `occurredAt` | When the publish happened. **Not** when this attempt was made |

Paths sent today:

| Record | `paths` |
|---|---|
| News of any type | the type's listing (`/newsroom/press-release/`, …), **`/newsroom/`**, plus the article (`/newsroom/press-release/{slug}/`) for `PRESS_RELEASE`/`OUR_VIEWS`, plus **`/`** for `IN_THE_NEWS` |
| A reorder (`CONTENT_REORDERED`) | the type's listing, **`/newsroom/`**, plus **`/`** for `IN_THE_NEWS` |
| A highlights change (`HOME_HIGHLIGHTS_CHANGED`) | **`/`** only |
| Investor tile or document | the section's `basePath`, plus the tile's page `basePath + slug + "/"` |

The tile pages are a dynamic `[slug]` route on the site. `revalidatePath` with a literal path such
as `/investors/offer-documents/drhp/` refreshes that one page of a dynamic route exactly as it does
a static one (Next 16 docs, `revalidatePath`; checked against a running production build on
2026-10-02: a document published in the panel was on the cached tile page 27 seconds later, with
no rebuild). For Notifications the backend sends `/investors/notifications/` and
`/investors/notifications/notifications/`; the second is not a route and refreshes nothing, which
is harmless because the first is the page.

**Sibling pages are refreshed by tag, not by path.** Every page of an investor section (its index,
each tile page, Corporate Governance's two static pages) shows the section's tile list, and
`paths` names only the index and the tile that changed. The site tags its
`GET /app/v1/documents-live?section=…` fetch `investor-tiles:{section}`, and for every path that
lies under a section's `basePath` it also calls `revalidateTag('investor-tiles:{section}',
{ expire: 0 })`, which expires every cached page rendered from that list
(`src/lib/revalidation/tags.ts`). The section is read from `paths`, so this needs nothing more
from the backend than the section `basePath` it already sends. It covers only events that are
sent: a tile reorder sends none today (backend `DocumentServiceImpl.reorder`), so a reorder reaches
no page, the index included, until its five-minute regeneration.

### 7.2 Verification (required)

```ts
// app/api/revalidate/route.ts — Node runtime
export async function POST(req: Request) {
  const timestamp = req.headers.get('x-sael-timestamp') ?? '';
  const signature = req.headers.get('x-sael-signature') ?? '';
  const rawBody = await req.text();                       // the raw bytes, BEFORE JSON.parse
  const expected = 'sha256=' + createHmac('sha256', process.env.SAEL_REVALIDATE_SECRET!)
    .update(`${timestamp}.${rawBody}`).digest('hex');
  if (signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return new Response('bad signature', { status: 401 });
  }
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return new Response('stale', { status: 401 });
  }
  const { paths } = JSON.parse(rawBody) as { paths: string[] };
  for (const p of paths) revalidatePath(p);
  return Response.json({ revalidated: paths });
}
```

- **The signature is HMAC-SHA256 over `` `${timestamp}.${rawBody}` ``**, rendered as lower-case
  hex and prefixed `sha256=`. `timestamp` is the `X-SAEL-Timestamp` header, in unsigned unix
  seconds. `rawBody` is the exact UTF-8 text received. Re-serialising the parsed JSON produces a
  different string and the check fails.
- **The secret is never transmitted.** Both sides hold it out of band: the site in
  `SAEL_REVALIDATE_SECRET`, the backend in `SAEL_PUBLISH_REVALIDATION_SECRET`. They must be the
  same value in each environment.
- **Apply the ±300 s freshness check to `X-SAEL-Timestamp`, never to `occurredAt`.** The
  timestamp is stamped per attempt. A retry's `occurredAt` can be up to half an hour old.
- **Return 2xx only after `revalidatePath` has run.** A non-2xx triggers a retry. Five
  attempts at 1, 2, 4, 8 and 16 minutes, then the message is marked dead and the publishers
  receive a `PUBLISH_FAILED` e-mail. An optimistic 200 hides a stale page from everyone.
- The backend waits 5 s for a response.

### 7.3 Redirects are not followed, so the URL must end in `/`

The backend does not follow redirects. A 3xx counts as a failure. With `trailingSlash: true`,
Next 16 permanently redirects every path whose last segment has no dot to its slash form, and
`/api` gets no exemption. **`/api/revalidate` without the slash returns 308 on every publish**:
five retries, then a `PUBLISH_FAILED` e-mail, and the page stays stale. The backend's
`publish.revalidation.url` must be `…/api/revalidate/` in every environment. Mount the handler
at `src/app/api/revalidate/route.ts` and do not add middleware that redirects it.

### 7.4 The caching model this assumes

ISR plus on-demand `revalidatePath` is the caching model. **Production runs PM2 with
`instances: 1`, and that is a requirement, not a tuning choice.** Each PM2 instance holds its
own ISR cache. With more than one instance, `revalidatePath` clears only the instance that
received the POST, returns 2xx, and the others keep serving the stale page. Nothing reports it.
Raising the instance count requires a shared cache handler first. See `/CLAUDE.md` §7.

---

## 8. Contact form — the browser calls the backend

This is the **only** backend call made from the browser. Every other call in this document is
made by the Next server. The reasoning is in `/CLAUDE.md` §6.

### 8.1 `GET /app/v1/contact-form/options`

```json
{
  "enabled": true,
  "subjects": [ { "code": "BUSINESS_ENQUIRY", "label": "Business Enquiry" },
                { "code": "JOB_VACANCY", "label": "Job Vacancy" },
                { "code": "OTHER", "label": "Other" } ],
  "maxMessageLength": 5000,
  "antibot": { "provider": "NONE", "siteKey": null },
  "honeypotField": "company_website"
}
```

- **`enabled: false`**: show the maintenance notice instead of the form.
- **`subjects`** is data. SAEL change it without a release. Render it in order and post the
  `code`. Never hard-code the list.
- **`honeypotField`**: render an input with this name, hidden off-screen (not `type="hidden"`),
  with `autocomplete="off"`, `tabindex="-1"` and `aria-hidden="true"`. Send it, empty.
- **`antibot.provider`**: `NONE`, `TURNSTILE` or `RECAPTCHA_V3`. Render a widget with
  `siteKey` only when it is not `NONE`. It is `NONE` everywhere today, but it can be switched
  on without a release.
- `no-store`. Fetch the options fresh for every render.

### 8.2 `POST /app/v1/contact-enquiry`

```json
{
  "fullName": "…", "email": "…", "phone": "+91 98…", "subjectCode": "BUSINESS_ENQUIRY",
  "message": "…", "sourcePage": "/contact-us/", "captchaToken": null,
  "company_website": ""
}
```

| Field | Required | Rule |
|---|---|---|
| `fullName` | yes | ≤ 180 |
| `email` | yes | ≤ 255, `something@something.tld` |
| `phone` | **yes** | ≤ 32, digits, spaces and `+ ( ) -` only |
| `subjectCode` | yes | A `code` from the options |
| `message` | yes | ≤ `maxMessageLength` characters |
| `sourcePage` | no | The page's path, ≤ 200 |
| `captchaToken` | when CAPTCHA is on | Single-use |
| *`honeypotField`* | send empty | |

There are no `consent`, `formType`, `meta` or `subject` fields, and there is no separate
investor contact form.

**`202 { "reference": "ENQ-2026-000123", "message": "…" }`**: show `message` and `reference`
and nothing else. A stored enquiry, an identical resubmission within 60 seconds (answered with
the first submission's reference) and a filled honeypot all look exactly like this. Do not
branch on anything in a 202.

| Status | `code` | Show |
|---|---|---|
| 400 | `INTAKE_VALIDATION_FAILED` | One `fieldErrors` entry per field (`fullName`, `email`, `phone`, `subjectCode`, `message`, `sourcePage`), beside the field |
| 400 | `INTAKE_CAPTCHA_FAILED` | Reset the widget for a fresh token before allowing another try |
| 429 | `INTAKE_RATE_LIMITED` | `Retry-After` (seconds) is readable cross-origin: "try again in 40 minutes" |
| 503 | `INTAKE_DISABLED` | The maintenance notice |

Disable the submit button after the first click. A double-click's second request is either a
duplicate or, with CAPTCHA on, a spent token.

### 8.3 Rate limits and CORS: why this call comes from the browser

- The backend limits submissions to **5 per hour per client IP** and **10 per day per e-mail
  address**. It sees the IP of whoever opened the connection. Proxied through the Next server,
  every visitor would share the server's IP, and the site's sixth enquiry in any hour would be
  refused.
- **The form calls relative URLs, on the page's own origin.** nginx serves the site and the
  backend on one host and routes `/app/v1/` to the backend (`deploy/nginx.conf.sample`), so
  the request is same-origin. No API origin is compiled into the site, and no CORS is involved.
- **`next dev`** forwards `/app/v1/` to `API_BASE_URL` through a development-only rewrite in
  `next.config.ts`, which a production build does not contain.
- CORS is answered **only for these two endpoints**, and only for the exact origins in the
  backend's `sael.intake.cors.allowed-origins`. The same-origin form does not need it, and with
  the list empty the backend registers no CORS handling at all. **If the list is ever set, it
  must include every origin the form is served from**, because a browser sends `Origin` on a
  same-origin POST too, and an unlisted origin is refused with `403` with nothing on the
  backend showing it. That includes `http://localhost:3000` for a development backend reached
  through the rewrite.

---

## 9. What the backend does not provide

Each of these was in the earlier proposal. None exists, and none is planned for go-live.

| Proposed | Status | What the site does instead |
|---|---|---|
| `/api/v1/team`, `/board-members`, `/board-committees` | **Descoped by SAEL on 20 Sep 2026.** Never built | Static content in this repo at go-live: `ourTeamMembers` in `src/app/_content/our-team.ts`, `boardMembers` and `boardCommittees` in `src/app/_content/corporate-governance.ts`. Not repository methods since 2026-10-02. SAEL cannot update these pages without a frontend release (backend row 5.24) |
| `/api/v1/capacity-stats`, `/esg-metrics` | Never specified on the backend | Static content in this repo — the capacity figures are `businessTiles` in `src/app/_content/homepage.ts`, not a repository method since 2026-10-02 |
| `/api/v1/investor-videos` (poster, captions) | Not built | The DRHP audio-visuals are `MEDIA_LIST` tiles of `VIDEO`/`AUDIO` items with `file` or `externalUrl`. There are no poster or caption fields; the site plays the one hosted recording of a gated media tile in the page and shows no poster or captions |
| `/api/v1/notifications` (paginated) | Not built | The `NOTIFICATIONS` section of `documents-live` |
| `/api/v1/investor-documents` with `group`, `subgroup`, `displayOrder` | **Superseded by row 3.52 (2026-10-02)** | `documents-live/{slug}` (§4.3) returns the grouping itself: named headings, one level of subheadings, stored anchors, empty headings, and the panel's order. The site no longer groups, orders or anchors anything itself |
| `/api/v1/enquiries` via a Next route handler | Not built | `POST /app/v1/contact-enquiry` from the browser (§8) |
| A news call with no category | Refused (`400`) | One call per `type` |
| Search, multilingual content, accounts | Not built | — |

---

## 10. Changing this document

- A backend change that alters anything here is recorded in the backend repository's
  `frontend-recommendations.md` and reflected in the generated OpenAPI document. Update this
  file in the same change that adapts the code to it.
- When a backend shape does not match the site's domain types (`content-model.md`), absorb the
  difference in the API adapter's mappers. Do not change a component to read a backend field.
- If a page needs data this document does not cover, follow `/CLAUDE.md` §9: propose the shape
  here, **under a heading marked "Proposed — not provided by the backend"**, and raise it with
  the backend team. A proposal is not part of the contract until the backend serves it, and the
  API adapter must not pretend otherwise.
