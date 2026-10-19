import 'server-only';

import { z } from 'zod';

/**
 * The backend's response shapes, as Zod schemas. docs/api-contracts.md §3–§4.
 *
 * **Strict on purpose.** Every key the contract says is present is required,
 * and `.nullable()` appears exactly where the contract says a value may be
 * `null` — no blanket `.optional()`, no `.catch()`. A field the backend
 * renames therefore fails here, by name, rather than reaching a page as an
 * empty value that looks deliberate. `.optional()` is used only for the keys
 * the contract says are *omitted* when null, which is a different thing.
 *
 * Unknown keys are dropped, not refused, so a field the backend *adds* is not
 * a failure.
 *
 * **Dates are `z.iso.date()`**, not `z.iso.datetime()`: `publishDate` is a
 * date-only `yyyy-MM-dd`, which a datetime validator rejects outright.
 */

export const NEWS_TYPES = ['PRESS_RELEASE', 'IN_THE_NEWS', 'OUR_VIEWS', 'MULTIMEDIA'] as const;
export type NewsType = (typeof NEWS_TYPES)[number];

/**
 * An absolute `http(s)` URL. `http` because local media is served by Azurite
 * over plain HTTP; any other scheme — `javascript:` above all — is refused,
 * since these values become `href`s and `src`s.
 */
const webUrl = z.url({ protocol: /^https?$/ });

/** `{ url, altText, width, height }` — §3.1. Dimensions are null for an unmeasured import. */
const imageSchema = z.object({
  url: webUrl,
  altText: z.string().nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

/** `NewsBody` as a listing serves it — §3.1. */
export const newsListItemSchema = z.object({
  // Any 8-4-4-4-12 hex: the backend's ids include v1 and v7 UUIDs, and
  // z.uuid() is stricter about variant bits than the contract is.
  publicId: z.guid(),
  type: z.enum(NEWS_TYPES),
  title: z.string().min(1),
  slug: z.string().min(1).nullable(),
  publishDate: z.iso.date().nullable(),
  summary: z.string().nullable(),
  heroImage: imageSchema.nullable(),
  externalUrl: webUrl.nullable(),
  sourcePublication: z.string().nullable(),
  // A provider this list does not name fails the item, so a new one is
  // loud in development rather than a card that silently cannot play.
  mediaKind: z.enum(['YOUTUBE', 'VIMEO', 'HOSTED']).nullable(),
  mediaUrl: webUrl.nullable(),
  mediaVideoId: z.string().min(1).nullable(),
  mediaFileUrl: webUrl.nullable(),
  featured: z.boolean(),
});
export type NewsListItemBody = z.infer<typeof newsListItemSchema>;

/** `NewsBody` as the detail endpoint serves it — §3.2. These five are omitted when null. */
export const newsDetailSchema = newsListItemSchema.extend({
  bodyHtml: z.string().optional(),
  authorName: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImage: imageSchema.optional(),
});
export type NewsDetailBody = z.infer<typeof newsDetailSchema>;

/* ---------- Preview — §5, §6 ---------- */

export const PREVIEW_SCREEN_CODES = [
  'NEWS_PRESS_RELEASE',
  'NEWS_IN_THE_NEWS',
  'NEWS_OUR_VIEWS',
  'NEWS_MULTIMEDIA',
  'DOC_OFFER_DOCUMENTS',
  'DOC_CORPORATE_GOVERNANCE',
  'DOC_FINANCIALS_REPORTS',
  'DOC_NOTIFICATIONS',
] as const;

/**
 * `POST /app/v1/preview/session`'s answer — §6.1. A screen code this list
 * does not name fails here: a session the site cannot place on a page is not
 * one it should store.
 */
export const previewSessionSchema = z.object({
  sessionToken: z.string().min(1),
  expiresInSeconds: z.number().int().positive(),
  screenCode: z.enum(PREVIEW_SCREEN_CODES),
  issuedFor: z.string(),
});
export type PreviewSessionBody = z.infer<typeof previewSessionSchema>;

/**
 * The `preview` block on every preview record — §5.1. The maker is a LEFT
 * JOIN on the backend, and the time falls back to the version's creation, so
 * both are admitted as null rather than trusted to be present.
 */
export const previewBlockSchema = z.object({
  status: z.string().min(1),
  versionNo: z.number().int().positive(),
  isDraft: z.boolean(),
  lastUpdatedBy: z.string().nullable(),
  lastUpdatedAt: z.iso.datetime({ offset: true }).nullable(),
});

/** A news item on `news-live-preview`: the live body, plus `preview`, plus `deleted` when true. */
export const newsPreviewListItemSchema = newsListItemSchema.extend({
  preview: previewBlockSchema,
  deleted: z.literal(true).optional(),
});
export type NewsPreviewListItemBody = z.infer<typeof newsPreviewListItemSchema>;

export const newsPreviewDetailSchema = newsDetailSchema.extend({
  preview: previewBlockSchema,
  deleted: z.literal(true).optional(),
});
export type NewsPreviewDetailBody = z.infer<typeof newsPreviewDetailSchema>;

/* ---------- Investor documents — §4 ---------- */

export const DOCUMENT_SECTIONS = [
  'OFFER_DOCUMENTS',
  'CORPORATE_GOVERNANCE',
  'FINANCIALS_REPORTS',
  'NOTIFICATIONS',
] as const;
export type DocumentSectionCode = (typeof DOCUMENT_SECTIONS)[number];

export const DISPLAY_MODES = [
  'SINGLE_DOCUMENT',
  'DOCUMENT_LIST',
  'MEDIA_LIST',
  'FY_GROUPED_LIST',
  'EXTERNAL_LINK',
] as const;
export type DisplayMode = (typeof DISPLAY_MODES)[number];

/**
 * A heading's in-page id, in the one form the backend stores
 * (`Anchors.FORM`): lower-case letters and digits in hyphen-separated runs.
 * **Validated, never derived** — it becomes an element `id` and a `#`
 * fragment as given, so anything else fails here rather than reaching the
 * page.
 */
const anchorSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'is not an anchor');

/** Root-relative with a trailing slash — `/investors/offer-documents/`. */
const basePathSchema = z.string().regex(/^\/(?:[a-z0-9-]+\/)+$/, 'is not a root-relative path');

/**
 * `DocumentCategoryBody` — §4.2. A tile, on the section listing and as the
 * `category` of its own page.
 *
 * **A gated tile must carry its disclaimer.** The backend refuses to submit
 * one without it; one that arrives without it anyway is refused here, so a
 * page never shows gated documents behind a blank notice — or, worse, with
 * no notice at all.
 */
export const documentCategorySchema = z.object({
  publicId: z.guid(),
  section: z.object({
    code: z.enum(DOCUMENT_SECTIONS),
    label: z.string().min(1),
    basePath: basePathSchema,
  }),
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'is not a slug'),
  displayMode: z.enum(DISPLAY_MODES),
  descriptionHtml: z.string().nullable(),
  gate: z
    .object({ enabled: z.boolean(), disclaimerHtml: z.string().nullable() })
    .refine((gate) => !gate.enabled || (gate.disclaimerHtml ?? '').trim() !== '', {
      path: ['disclaimerHtml'],
      message: 'is blank on a gated tile',
    }),
  itemCount: z.number().int().nonnegative(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});
export type DocumentCategoryBody = z.infer<typeof documentCategorySchema>;

/**
 * `DocumentItemBody` — §4.3. `file` is null for a link and for a hosted file
 * never promoted (§0.3). `description`, `language` and `file.sha256` are
 * sent and not read: nothing on the site shows them.
 */
export const documentItemSchema = z.object({
  publicId: z.guid(),
  title: z.string().min(1),
  documentDate: z.iso.date().nullable(),
  financialYear: z.string().min(1).nullable(),
  itemKind: z.enum(['FILE', 'EXTERNAL_LINK', 'VIDEO', 'AUDIO']),
  file: z
    .object({
      url: webUrl,
      contentType: z.string().min(1),
      sizeBytes: z.number().int().nonnegative().nullable(),
    })
    .nullable(),
  externalUrl: webUrl.nullable(),
});
export type DocumentItemBody = z.infer<typeof documentItemSchema>;

/** A subheading — one level only, always labelled. */
const documentSubgroupSchema = z.object({
  label: z.string().min(1),
  anchor: anchorSchema,
  items: z.array(documentItemSchema),
});

/**
 * A heading and what sits under it. `label` and `anchor` are null together,
 * for the documents under no heading.
 */
const documentGroupSchema = z
  .object({
    label: z.string().min(1).nullable(),
    anchor: anchorSchema.nullable(),
    items: z.array(documentItemSchema),
    subgroups: z.array(documentSubgroupSchema),
  })
  .refine((group) => (group.label === null) === (group.anchor === null), {
    path: ['anchor'],
    message: 'is null where label is not, or the other way round',
  });

/** `GET /app/v1/documents-live/{slug}` — §4.3. A bare body, never paginated. */
export const documentCategoryPageSchema = z.object({
  category: documentCategorySchema,
  groups: z.array(documentGroupSchema),
});
export type DocumentCategoryPageBody = z.infer<typeof documentCategoryPageSchema>;

/* ---------- Investor documents on preview — §5.1 ---------- */

/** A tile on `documents-live-preview`: the live body, plus `preview`, plus `deleted` when true. */
export const documentPreviewCategorySchema = documentCategorySchema.extend({
  preview: previewBlockSchema,
  deleted: z.literal(true).optional(),
});
export type DocumentPreviewCategoryBody = z.infer<typeof documentPreviewCategorySchema>;

/** A document on a tile's preview page: the live body, plus its own `preview`. */
export const documentPreviewItemSchema = documentItemSchema.extend({
  preview: previewBlockSchema,
});
export type DocumentPreviewItemBody = z.infer<typeof documentPreviewItemSchema>;

/**
 * A tile's preview page, **read in two passes**. The headings are checked
 * here, as strictly as on live: they are the backend's own arrangement. The
 * tile and each document are left `unknown` and checked one by one by the
 * adapter, because on a preview they are drafts — half-written by definition
 * — and one that fails must be shown as incomplete, not take the page with it.
 */
const documentPreviewSubgroupSchema = documentSubgroupSchema.extend({
  items: z.array(z.unknown()),
});

const documentPreviewGroupSchema = z
  .object({
    label: z.string().min(1).nullable(),
    anchor: anchorSchema.nullable(),
    items: z.array(z.unknown()),
    subgroups: z.array(documentPreviewSubgroupSchema),
  })
  .refine((group) => (group.label === null) === (group.anchor === null), {
    path: ['anchor'],
    message: 'is null where label is not, or the other way round',
  });

export const documentPreviewPageSchema = z.object({
  category: z.unknown(),
  groups: z.array(documentPreviewGroupSchema),
  preview: z.unknown(),
});
export type DocumentPreviewPageBody = z.infer<typeof documentPreviewPageSchema>;
