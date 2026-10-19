# Content Model & Data Layer

The backend is **Spring Boot microservices + MySQL**, with **Azure Blob Storage** for PDFs and media. **None of it exists yet.** This document defines the boundary that lets us build the entire frontend now and swap in real endpoints later without touching a component.

---

## 1. Two kinds of content

Be deliberate about which bucket a piece of content falls into. Putting static marketing copy behind an API is a common and expensive mistake.

| | Static content | Dynamic content |
|---|---|---|
| **Examples** | Hero slide copy, Mission/Vision/Ethos, business descriptions, SDG list, nav structure, legal pages — **and the capacity figures, the board, its committees and the team** (below) | News items, investor documents, notifications |
| **Changes** | With a design/copy review, i.e. a deploy | Independently, by the business |
| **Lives in** | `src/app/_content/*.ts` (a page's content) and `src/lib/content/static/*.ts` (shared) — typed TS constants | The `ContentRepository` |
| **Rendered** | Prerendered at build | Server-fetched with a 5-minute cache |

**The test is whether the backend serves it, not whether the business would like to change it.** Capacity figures, the board, its committees and the team change independently of a design review, and were repository surfaces until 2026-10-02. None has a backend endpoint: SAEL descoped the team and board on 20 Sep 2026 (backend row 5.24) and the figures were never specified (`api-contracts.md` §9). In the repository they could only throw `NotImplementedError` under `CONTENT_SOURCE=api` and render empty, so they are static content now:

| Content | File |
|---|---|
| Capacity figures | `businessTiles` in `src/app/_content/homepage.ts` |
| Board of Directors | `boardMembers` in `src/app/_content/corporate-governance.ts` |
| Board Committees | `boardCommittees` in the same file |
| Our Team | `ourTeamMembers` in `src/app/_content/our-team.ts` |

**The consequence is that SAEL cannot change any of them in the panel**; each change is a release by us. For the board and committees that matters beyond convenience — board composition is a continuing disclosure under SEBI LODR Reg. 46. SAEL's sign-off list is the backend's `docs/client/static-content-sign-off.md`. If the backend ever serves one of them, it comes back through the repository: type, interface method, both implementations, then the page.

### 1.1 Where display copy comes from — not sael.co

**Rule.** For display copy — headings, labels, figures, section names, and body text on static pages — the authority is the content SAEL have reviewed for the new site. That is what this repository holds, and what https://sael-dev.vercel.app/ shows them. It is **not** https://www.sael.co/.

**Reason.** sael.co is SAEL's *previous* website. It is the site this one replaces, and nobody at SAEL keeps it current. When SAEL review the new site, they correct copy and figures there, not on the old one. So when the two disagree, the likeliest explanation is that the old site is out of date, not that our copy is wrong. Treating sael.co as the truth reverses that: it puts the copy SAEL rejected back over the copy they approved.

That has already happened once. On 2026-10-02 the homepage capacity figures were "corrected" to sael.co's (8299.5 MWp, 5000 MW+ (proposed), and so on). In fact they were the figures SAEL had supplied after their own review, set on 2026-10-01 (`5494e70`): 8.3 GWp, 5 GW\*, and so on. The change was undone on 2026-10-04 (backend row 5.24).

**"The live site says X" is not grounds for changing display copy.** If sael.co disagrees with what we hold:

1. Keep our copy.
2. Record the difference where it is visible to SAEL: the sign-off list, which is the backend's `docs/client/static-content-sign-off.md`, or a question to them. They may want their old site corrected.

Our copy changes when SAEL say so, not when the old site disagrees.

**sael.co *is* the source for exactly two things:**

| What | Why |
|---|---|
| **Migrated content records** — investor documents, news items: titles, dates, files, article bodies | They are records SAEL published there, and the new site carries them over unchanged. They are not copy that SAEL rewrite for the new design |
| **Tile and page slugs** | They must match the existing URLs (`/CLAUDE.md` §2 rule 6). SEO equity and inbound links depend on it |

URL parity, redirects and the canonical host follow sael.co for the same reason as slugs (`accessibility-and-seo.md`). Everything else — a page's headings, a section's name, a figure, a qualifier, a paragraph of marketing copy — comes from SAEL's reviewed content for the new site. If none exists yet, write `{{TODO: content}}` (`/CLAUDE.md` §2 rule 3). Transcribing it from sael.co as a stand-in is a choice to flag, never one to make silently. The flag records that the copy is the old site's and that SAEL have not yet reviewed it for the new one.

---

## 2. Domain types

`src/lib/content/types.ts`. These are the frontend's model — they are **not** required to mirror the backend's DTOs one-for-one. The API adapter maps between them.

```ts
/** Anything backed by an Azure Blob asset. */
export interface BlobAsset {
  url: string;              // absolute, Azure Blob
  fileName: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface ImageAsset {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

/* ---------- Newsroom ---------- */

/* Built 2026-10-01 with the Newsroom. Four sections; two of them host articles. */

export type NewsCategory = 'press-release' | 'in-the-news' | 'our-views' | 'multimedia';
export type NewsArticleCategory = 'press-release' | 'our-views';

/* A Multimedia item's video, by where it plays from. Mapped from the backend's
   mediaKind; mediaVideoId is read only as the id of the provider mediaKind names. */
export type NewsVideo =
  | { provider: 'youtube'; id: string }
  | { provider: 'vimeo'; id: string; pageUrl: string }   // pageUrl: the URL the maker entered
  | { provider: 'hosted'; fileUrl: string };             // mediaFileUrl

/* Lists of these are in the source's order, set on the panel's Reorder screen —
   unplaced items first, newest first, then the editor's order. Never re-sorted. */
export interface NewsItem {
  id: string;                 // publicId
  category: NewsCategory;     // type, PRESS_RELEASE ↔ press-release
  title: string;              // verbatim, as the legacy card reads
  publishedAt: string | null; // publishDate, yyyy-MM-dd; may be null for Our Views and Multimedia
  href: string;               // resolved by the repository: article page, publication, or the video's own page
  imageUrl: string | null;    // heroImage.url; for a YouTube video without one, its thumbnail
  imageAlt: string | null;    // heroImage.altText; a card falls back to the title
  slug: string | null;        // press-release, our-views — verbatim legacy URL segment
  externalUrl: string | null; // in-the-news
  video: NewsVideo | null;    // multimedia
  publication: string | null; // sourcePublication; null in every mock row
}

export interface NewsArticle extends NewsItem {
  category: NewsArticleCategory;
  slug: string;
  body: string;               // bodyHtml; sanitised again on render (lib/utils/sanitize-article.ts)
  summary: string | null;
  seoTitle: string | null;    // the panel's; the page falls back to title
  seoDescription: string | null; // the panel's; falls back to summary, then the legacy body derivation
  ogImageUrl: string | null;  // ogImage.url; falls back to imageUrl
}

/* ---------- Investors ---------- */
/* Rebuilt 2026-10-02 on the backend's sections → tiles → documents — see the note after this block. */

export type InvestorSection =     // the URL segment under /investors/
  | 'offer-documents' | 'corporate-governance' | 'financials-and-reports' | 'notifications';

export type InvestorGate = { enabled: false } | { enabled: true; disclaimerHtml: string };

export interface InvestorTile {   // the API's "category"
  id: string;
  section: InvestorSection;
  title: string;                  // verbatim — the <h1>
  slug: string;                   // must equal a route segment — app/investors/_lib/tile-routes.ts
  path: string;                   // backend basePath + slug + "/" — what the webhook names
  sectionPath: string;            // backend basePath
  displayMode: 'single-document' | 'document-list' | 'media-list' | 'fy-grouped-list' | 'external-link';
  descriptionHtml: string | null;
  gate: InvestorGate;
  documentCount: number;          // itemCount; 0 is real
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface BlobFile {
  url: string;                    // absolute
  mimeType: string;               // the backend's contentType — also the type label's basis
  sizeBytes: number | null;
}

export interface InvestorDocument {
  id: string;
  title: string;                  // verbatim — the published link text
  kind: 'file' | 'external-link' | 'video' | 'audio';
  publishedAt: string | null;     // documentDate
  financialYear: string | null;   // metadata; headings come from the groups
  file: BlobFile | null;          // null: an external link, or a file never promoted
  externalUrl: string | null;
}

export interface InvestorDocumentGroup {
  label: string | null;           // null together with anchor: documents under no heading
  anchor: string | null;          // the backend's, used as given — never derived here
  documents: InvestorDocument[];
  subgroups: { label: string; anchor: string; documents: InvestorDocument[] }[];  // one level
}

export interface InvestorTilePage {
  tile: InvestorTile;
  groups: InvestorDocumentGroup[];  // in the backend's order; [] = nothing published
}


**The investor types were rebuilt on 2026-10-02**, when the pages moved from
mock data to `documents-live`. The earlier model — a flat list of documents
with a free-text `group` and `subgroup`, one `order` across the listing, a
listing addressed by `category` plus `section`, and videos as their own type
— was the frontend's own invention, and the site derived its headings and
their anchors from it. The backend now serves the grouping (backend row
3.52): each tile page's documents arrive under headings with stored anchors,
one optional level of subheadings, empty headings kept and documents under no
heading in a trailing unlabelled group. So the domain carries that, mapped one
for one, and nothing on the site groups, sorts or derives an anchor. Videos
are documents of kind `video` on a `media-list` tile; the backend has no
poster or caption track. A document's `file` is nullable, and a document with
neither file nor link is shown as unavailable, never dropped.
`api-contracts.md` §4.

**`BoardMember`, `BoardCommittee`, `CommitteeMember`, `TeamMember`,
`TeamGroup` and `CapacityStat` left this file on 2026-10-02** with the
content they typed (§1). The board types live beside the board in
`src/app/_content/corporate-governance.ts`; `TeamMember` and `TeamGroup` in
`src/components/sections/team-grid/types.ts`, the section that renders them;
a capacity figure is `value` and `footnote` on `BusinessTile`. The board stays
a separate record from `TeamMember` even for the same person, because the
governance page words them differently. The notes on `TeamMember` below still
hold, for the type in its new place.

`portraitZoom` was added on 2026-09-17 and removed on 2026-10-06. The
biography dialog zoomed the card's photograph to a head-and-shoulders crop;
the portraits have since been replaced, and the dialog now shows each one
exactly as the card does.

**Two fields changed in FE-07**, which built `/our-team/` and is the only
consumer of this type.

`group` is new. `Our Team.dc.html` splits the roster into Leadership and
Management tabs, and a tab is a partition of the data, so the grouping has to
travel with the person rather than live as a hardcoded list of names in a
component. `GET /api/v1/team` gains a matching `group` string — see
`api-contracts.md` §4.

`photoUrl: string | null` replaces `photo: ImageAsset | null`. These portraits
are CMS assets the frontend cannot know at build time, so what a component
needs is a URL that `next/image` can optimise — which is exactly the shape
`NewsItem.imageUrl` already took in FE-04, for the same reason. There is no
`photoAlt`: the contract offers one and it is `null` in every row, and the
right alternative text for a portrait is the name of the person in it, which
`name` already carries.

`linkedinUrl` was added on 2026-09-10, from the live site's own popups: seven of
the seventeen publish a profile and ten do not. It is genuinely sparse rather
than merely unfilled — whether someone publishes a profile is their decision —
so a consumer omits the link entirely rather than rendering a disabled one.

export interface EsgMetric {
  id: string;
  label: string;
  value: string;
  unit: string | null;
  period: string | null;    // "FY 2024-25"
  category: string | null;  // "Environment" | "Social" | "Governance"
  order: number;
}

/* ---------- Shared ---------- */

export interface Paginated<T> {
  items: T[];
  page: number;             // 1-based
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
```

### Conventions

- **Dates are ISO 8601 strings**, never `Date` objects. `Date` does not survive the server→client boundary and forces every consumer to re-parse. Format at render with `formatDate()`.
- **Pre-formatted display values.** A figure is the string SAEL supply — `"3.6 GWp + 5 GW*"`, not a number plus a unit. The frontend must not attempt to compose it.
- **Nullable, not optional.** `foo: string | null` rather than `foo?: string`. Makes "the backend sent nothing" explicit and distinguishable from "we forgot to map it".
- **No `id` invention.** If the backend does not supply a stable id, the adapter derives one deterministically (e.g. slug of title + date) and documents it. Never `Math.random()` or array index — both break React reconciliation and pagination.

---

## 3. The repository contract

`src/lib/content/repository.ts`. **This interface is the entire boundary.** Adding a dynamic surface means adding a method here first.

```ts
export interface ContentRepository {
  // Newsroom — built 2026-10-01, wired to the API the same day. No paging on
  // the site: the legacy listings have none, and paged URLs would be new URLs.
  // The adapter reads every backend page instead. `category` is required: the
  // backend refuses a news call without a type.
  getNewsItems(options: { category: NewsCategory; limit?: number }): Promise<NewsItem[]>;
  // The homepage's In the News rail: highlights or the latest K, as the backend
  // chooses (api-contracts.md §3.3). Expect 1 to `limit`, rendered as received.
  getInTheNewsRail(limit: number): Promise<NewsItem[]>;
  getNewsArticle(category: NewsArticleCategory, slug: string): Promise<NewsArticle | null>;

  // Investors — wired to documents-live on 2026-10-02. Notifications is the
  // NOTIFICATIONS section's one tile, not an endpoint of its own.
  getInvestorTiles(section: InvestorSection): Promise<InvestorTile[]>;
  getInvestorTilePage(section: InvestorSection, slug: string): Promise<InvestorTilePage | null>;
  hasInvestorTile(section: InvestorSection, slug: string): Promise<boolean>;  // for src/proxy.ts

  // Company. The team, the board, its committees and the capacity figures were
  // methods here until 2026-10-02; they are static content now (§1).
  getEsgMetrics(): Promise<EsgMetric[]>;
}
```

Rules:

1. **Every method returns a resolved value or throws `ContentUnavailableError`.** No `undefined`, no silent `null` for a list. An empty list is `[]`.
2. **Callers handle failure locally.** A page wraps its repository call and renders `<EmptyState>` on error. A failed news fetch must not take down the homepage.
3. **Both implementations, always.** Never merge a method implemented only in the mock. The API implementation may be a stub that throws `NotImplementedError` — but it must exist so the cutover is a checklist, not an archaeology exercise.
4. **No pass-through of backend shapes.** If the Spring Boot response calls it `docTitle`, the adapter maps it to `title`. Components never learn the backend's vocabulary.

### The factory

```ts
// src/lib/content/index.ts
import { env } from '@/lib/config/env';

let instance: ContentRepository | null = null;

export function getContentRepository(): ContentRepository {
  if (!instance) {
    instance = env.CONTENT_SOURCE === 'api'
      ? new ApiContentRepository({ baseUrl: env.API_BASE_URL, timeoutMs: env.API_TIMEOUT_MS })
      : new MockContentRepository();
  }
  return instance;
}
```

Components import **only** `getContentRepository` from `@/lib/content`. Importing from `@/lib/content/mock` or `@/lib/content/api` anywhere outside `index.ts` is a review rejection. Add an ESLint `no-restricted-imports` rule to enforce it.

---

## 4. Mock implementation

```
src/lib/content/mock/
├── index.ts              MockContentRepository
└── data/
    ├── news.json
    ├── investor-tiles.json      (tiles, their headings and stored anchors)
    ├── investor-documents.json  (documents, filed by tile and heading)
    ├── notifications.json
    └── esg-metrics.json
```

The mock must be a realistic stand-in, not a happy path:

- **Realistic volume.** 25+ news items so pagination is genuinely exercised. 40+ investor documents across all categories and several financial years.
- **Realistic content.** Seed from the live site — real headlines, real dates, real document titles. Placeholder Lorem hides layout failures that real copy exposes.
- **Edge cases included.** At least one news item with no image, one with a 140-character headline, one document with no date. These are the cases that break in production.
- **Pagination implemented properly.** `getNewsPage` slices and returns correct `totalItems`/`totalPages`. Do not return everything and let the UI slice.
- **Optional latency.** Honour `MOCK_LATENCY_MS` (default `0`) so loading and error states can be exercised locally.
- **Blob URLs are plausible.** `https://<account>.blob.core.windows.net/public/investors/annual-return-fy2024-25.pdf` — composed via `blobUrl()`, so switching to the real account is one env change. Mock PDFs may 404; that is acceptable and should be noted in the mock's file header.

---

## 5. API implementation

```
src/lib/content/api/
├── index.ts       ApiContentRepository
├── client.ts      apiFetch<T>() — timeout, error normalisation, Zod parse
├── schemas.ts     Zod schemas for every backend response
└── mappers.ts     backend DTO → domain type
```

`apiFetch` responsibilities:

- `AbortController` timeout at `API_TIMEOUT_MS` (default 8000ms).
- Next.js cache options passed through: `{ next: { revalidate, tags } }`.
- Non-2xx → `ContentUnavailableError` carrying status and endpoint.
- **Zod parse before returning.** A schema failure logs the issue paths server-side and throws `ContentUnavailableError` — it never returns half-valid data into the render tree.
- No retries at this layer. A marketing page should fail fast to its empty state rather than hold the request open.

---

## 6. Forms — the write path

The contact form calls the backend **from the browser**, at relative URLs on the site's own origin. nginx routes `/app/v1/` to Spring Boot.

```
<ContactForm> ──GET──▶  /app/v1/contact-form/options ──▶ Spring Boot
   'use client' ──POST─▶ /app/v1/contact-enquiry      ──▶ Spring Boot
```

Why: the backend rate-limits submissions per client IP. Through a Next route handler every visitor would share the server's one IP. No credential is involved. `/CLAUDE.md` §6 and `api-contracts.md` §8 have the contract.

- `src/lib/forms/contact-enquiry.ts` is the contract: it loads the options, builds the payload under the backend's field names, and reduces every response to sent (a 2xx with a receipt only), field errors, rate-limited or unavailable.
- `src/lib/forms/contact.ts` is the browser's own validation, aligned with the backend's bounds. The subjects and the message limit come from the options.
- While `CONTENT_SOURCE=mock`, the options and the submission are stand-ins (`contact-enquiry-mock.ts`) and nothing is sent.

There is one form: **Contact Us**. There is no separate investor contact form (`api-contracts.md` §8.2). Careers has no form: it became a page on 2026-09-22, and its two "Explore" CTAs link out to the Oracle recruiting portal, which is where an application is made.

---

## 7. Cutover procedure (FE-23)

When the Spring Boot endpoints land:

1. Backend team supplies the OpenAPI spec. Reconcile it against `api-contracts.md` and record any divergence there.
2. Write Zod schemas in `api/schemas.ts` from the actual spec.
3. Write `api/mappers.ts` — backend DTO to domain type.
4. Implement `ApiContentRepository` method by method. Ship them one at a time; the factory is all-or-nothing per environment, so use a staging environment with `CONTENT_SOURCE=api` while `mock` remains the default elsewhere.
5. For each method, diff mock output against API output for the same query. Field-level parity, including nulls.
6. Verify every empty and error state against the real backend (kill the service, confirm pages still render).
7. Flip `CONTENT_SOURCE=api` per environment.
8. **Keep the mock.** It stays as the local-development default and as a fixture source. Do not delete it.

No component file should change during this entire process. If one does, the boundary was wrong and that is the bug to fix.
