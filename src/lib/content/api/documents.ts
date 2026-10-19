import 'server-only';

import type {
  IncompleteRecord,
  InvestorDocument,
  InvestorDocumentGroup,
  InvestorDocumentKind,
  InvestorSection,
  InvestorTile,
  InvestorTileDisplayMode,
  InvestorTilePage,
  PreviewDetail,
  PreviewState,
  PreviewTilePage,
  Previewed,
} from '../types';
import { InvalidContentError } from './client';
import { mapPreviewRecord, previewStateOf } from './preview';
import {
  documentCategorySchema,
  documentPreviewItemSchema,
  type DisplayMode,
  type DocumentCategoryBody,
  type DocumentCategoryPageBody,
  type DocumentItemBody,
  type DocumentPreviewCategoryBody,
  type DocumentPreviewPageBody,
  type DocumentSectionCode,
} from './schemas';

/**
 * `DocumentCategoryBody` and `DocumentItemBody` → the site's investor types.
 * The one place the backend's names meet the frontend's
 * (docs/api-contracts.md §10):
 *
 * | backend                              | frontend                      |
 * |--------------------------------------|-------------------------------|
 * | `publicId`                           | `id`                          |
 * | `section.code` `OFFER_DOCUMENTS`     | `section` `offer-documents` (both ways) |
 * | `section.basePath` + `slug` + `/`    | `path`                        |
 * | `itemCount`                          | `documentCount`               |
 * | `gate.enabled` / `.disclaimerHtml`   | `gate` (a union)              |
 * | `documentDate`                       | `publishedAt`                 |
 * | `itemKind` `EXTERNAL_LINK`           | `kind` `external-link`        |
 * | `file.contentType`                   | `file.mimeType`               |
 * | `groups[].label` / `.anchor` / `.items` / `.subgroups` | `groups[].label` / `.anchor` / `.documents` / `.subgroups` |
 *
 * **Groups are mapped, never made.** Their order, their labels and their
 * anchors are the backend's, carried across one for one. Nothing here
 * sorts, merges, drops or names a group, and nothing derives an anchor.
 */

/**
 * Both directions as literal tables, each checked exhaustive by `satisfies`,
 * so a fifth section is a compile error rather than an `undefined`. Routes
 * use the kebab-case value; the API requires the upper-case one.
 */
const SECTION_BY_CODE = {
  OFFER_DOCUMENTS: 'offer-documents',
  CORPORATE_GOVERNANCE: 'corporate-governance',
  FINANCIALS_REPORTS: 'financials-and-reports',
  NOTIFICATIONS: 'notifications',
} as const satisfies Record<DocumentSectionCode, InvestorSection>;

const CODE_BY_SECTION = {
  'offer-documents': 'OFFER_DOCUMENTS',
  'corporate-governance': 'CORPORATE_GOVERNANCE',
  'financials-and-reports': 'FINANCIALS_REPORTS',
  notifications: 'NOTIFICATIONS',
} as const satisfies Record<InvestorSection, DocumentSectionCode>;

const DISPLAY_MODE = {
  SINGLE_DOCUMENT: 'single-document',
  DOCUMENT_LIST: 'document-list',
  MEDIA_LIST: 'media-list',
  FY_GROUPED_LIST: 'fy-grouped-list',
  EXTERNAL_LINK: 'external-link',
} as const satisfies Record<DisplayMode, InvestorTileDisplayMode>;

const KIND = {
  FILE: 'file',
  EXTERNAL_LINK: 'external-link',
  VIDEO: 'video',
  AUDIO: 'audio',
} as const satisfies Record<DocumentItemBody['itemKind'], InvestorDocumentKind>;

export function sectionCodeOf(section: InvestorSection): DocumentSectionCode {
  return CODE_BY_SECTION[section];
}

/**
 * A tile. `expected` is the section the call asked for: a tile the backend
 * files under another one is refused, since its page would be built under
 * the wrong area and the webhook would name a path the site does not serve.
 */
export function toInvestorTile(
  body: DocumentCategoryBody,
  expected: InvestorSection,
  endpoint: string,
): InvestorTile {
  const section = SECTION_BY_CODE[body.section.code];
  if (section !== expected) {
    throw new InvalidContentError(
      endpoint,
      'section.code',
      `is ${body.section.code}, but ${sectionCodeOf(expected)} was asked for`,
      body.publicId,
    );
  }

  return {
    id: body.publicId,
    section,
    title: body.title,
    slug: body.slug,
    path: `${body.section.basePath}${body.slug}/`,
    sectionPath: body.section.basePath,
    displayMode: DISPLAY_MODE[body.displayMode],
    descriptionHtml: body.descriptionHtml,
    // The schema has already refused a gated tile with a blank disclaimer;
    // this narrows it.
    gate:
      body.gate.enabled && body.gate.disclaimerHtml !== null
        ? { enabled: true, disclaimerHtml: body.gate.disclaimerHtml }
        : { enabled: false },
    documentCount: body.itemCount,
    seoTitle: body.seoTitle ?? null,
    seoDescription: body.seoDescription ?? null,
  };
}

/**
 * A document. Kept whatever its `file` and `externalUrl` hold — including
 * neither, a hosted file never promoted — because the page shows such a
 * document as unavailable rather than leaving it out.
 */
function toInvestorDocument(body: DocumentItemBody): InvestorDocument {
  return {
    id: body.publicId,
    title: body.title,
    kind: KIND[body.itemKind],
    publishedAt: body.documentDate,
    financialYear: body.financialYear,
    file:
      body.file === null
        ? null
        : { url: body.file.url, mimeType: body.file.contentType, sizeBytes: body.file.sizeBytes },
    externalUrl: body.externalUrl,
  };
}

function toGroup(group: DocumentCategoryPageBody['groups'][number]): InvestorDocumentGroup {
  return {
    label: group.label,
    anchor: group.anchor,
    documents: group.items.map(toInvestorDocument),
    subgroups: group.subgroups.map((subgroup) => ({
      label: subgroup.label,
      anchor: subgroup.anchor,
      documents: subgroup.items.map(toInvestorDocument),
    })),
  };
}

export function toInvestorTilePage(
  body: DocumentCategoryPageBody,
  expected: InvestorSection,
  endpoint: string,
): InvestorTilePage {
  return {
    tile: toInvestorTile(body.category, expected, endpoint),
    groups: body.groups.map(toGroup),
  };
}

/* ---------- Preview — docs/api-contracts.md §5 ---------- */

/** A tile on the preview listing: {@link toInvestorTile}, unchanged, and its state. */
export function toInvestorTilePreview(
  body: DocumentPreviewCategoryBody,
  expected: InvestorSection,
  endpoint: string,
): Previewed<InvestorTile> {
  return { record: toInvestorTile(body, expected, endpoint), preview: body.preview };
}

/**
 * A tile's preview page. The tile and every document are mapped by the live
 * mappers; a document that will not map is kept as incomplete, with the
 * heading it sits under, and the rest of the page is drawn. A tile that will
 * not map makes the whole page incomplete — there is no page to draw without
 * its tile.
 *
 * The groups are carried across one for one, as on live: an incomplete
 * document leaves its heading in place, empty if it was the only one.
 */
export function toInvestorTilePagePreview(
  body: DocumentPreviewPageBody,
  expected: InvestorSection,
  endpoint: string,
): PreviewDetail<PreviewTilePage> {
  const tileState = previewStateOf(body.preview);
  const tile = mapPreviewRecord(
    body.category,
    documentCategorySchema,
    (category) => toInvestorTile(category, expected, endpoint),
    { endpoint, state: tileState },
  );
  if (!tile.complete) return tile;
  if (tileState === null) {
    // The tile mapped, but the block saying what state it is in did not: a
    // contract change, not a half-written draft. Live throws on the same.
    throw new InvalidContentError(endpoint, 'preview', 'is not a preview block', tile.value.id);
  }

  const documentStates: Record<string, PreviewState> = {};
  const incomplete: IncompleteRecord[] = [];
  const documents = (raws: readonly unknown[], heading: string | null): InvestorDocument[] =>
    raws.flatMap((raw) => {
      const mapped = mapPreviewRecord(
        raw,
        documentPreviewItemSchema,
        (item) => ({ document: toInvestorDocument(item), state: item.preview }),
        { endpoint, heading },
      );
      if (!mapped.complete) {
        incomplete.push(mapped.record);
        return [];
      }
      documentStates[mapped.value.document.id] = mapped.value.state;
      return [mapped.value.document];
    });

  const groups = body.groups.map((group): InvestorDocumentGroup => ({
    label: group.label,
    anchor: group.anchor,
    documents: documents(group.items, group.label),
    subgroups: group.subgroups.map((subgroup) => ({
      label: subgroup.label,
      anchor: subgroup.anchor,
      documents: documents(subgroup.items, subgroup.label),
    })),
  }));

  return {
    complete: true,
    value: {
      record: { page: { tile: tile.value, groups }, documentStates, incomplete },
      preview: tileState,
    },
  };
}
