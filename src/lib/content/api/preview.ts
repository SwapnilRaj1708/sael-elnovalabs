import 'server-only';

import type { z } from 'zod';
import type { IncompleteField, IncompleteRecord, PreviewState } from '../types';
import { InvalidContentError } from './client';
import { previewBlockSchema } from './schemas';

/**
 * How a preview turns the backend's records into the site's, **keeping the
 * ones it cannot**. docs/api-contracts.md §5.
 *
 * On a live page a record that fails its schema or its mapping is logged and
 * left out in production (`rejectItem`): it is one card, and the page around
 * it matters more. On a preview that policy is exactly wrong. The records are
 * drafts, half-written by definition, and the reviewer was sent to approve
 * one; if it fails to map, it would vanish from the page they are reviewing,
 * with nothing to say it was ever there. So here each record either maps, or
 * becomes an {@link IncompleteRecord} naming what it lacks — never an absence,
 * and never a throw that takes the page down with it.
 *
 * **The same schemas and mappers as live**, unchanged: a record that maps
 * here maps identically on the live page.
 */

/**
 * The backend's field, by the first segment of its path, as the reviewer
 * would name it. The detail stays in the server log.
 */
const FIELD_BY_KEY: Readonly<Record<string, IncompleteField>> = {
  title: 'title',
  slug: 'slug',
  externalUrl: 'link',
  mediaKind: 'video',
  mediaUrl: 'video',
  mediaVideoId: 'video',
  mediaFileUrl: 'video',
  publishDate: 'date',
  documentDate: 'date',
  heroImage: 'image',
  thumbnail: 'image',
  gate: 'disclaimer',
  displayMode: 'display-mode',
  file: 'file',
  itemKind: 'kind',
  section: 'section',
};

function fieldOf(path: readonly PropertyKey[]): IncompleteField {
  const [key] = path;
  return typeof key === 'string' ? (FIELD_BY_KEY[key] ?? 'other') : 'other';
}

/** `items[3].heroImage.url` → `heroImage.url`, for the field a mapper names. */
function fieldOfPath(dotted: string): IncompleteField {
  return fieldOf(dotted.replace(/^items\[\d+\]\./, '').split(/[.[]/));
}

function unique(fields: readonly IncompleteField[]): IncompleteField[] {
  return [...new Set(fields)];
}

function stringOf(raw: unknown, key: string): string | null {
  if (typeof raw !== 'object' || raw === null || !(key in raw)) return null;
  const value = (raw as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

/** A record's `preview` block, if it is readable on its own. */
export function previewStateOf(block: unknown): PreviewState | null {
  const parsed = previewBlockSchema.safeParse(block);
  return parsed.success ? parsed.data : null;
}

function previewOf(raw: unknown): PreviewState | null {
  if (typeof raw !== 'object' || raw === null || !('preview' in raw)) return null;
  return previewStateOf(raw.preview);
}

function incomplete(
  raw: unknown,
  missing: readonly IncompleteField[],
  heading: string | null,
  state: PreviewState | null = previewOf(raw),
): IncompleteRecord {
  return {
    id: stringOf(raw, 'publicId'),
    title: stringOf(raw, 'title'),
    missing: missing.length === 0 ? ['other'] : unique(missing),
    preview: state,
    heading,
  };
}

/**
 * Logged in every environment. The reviewer is told what is missing in their
 * terms; whoever reads the log needs the backend's field and the record.
 */
function logIncomplete(endpoint: string, record: IncompleteRecord, detail: string): void {
  console.warn(
    `[content-api] Preview: ${record.id ?? 'a record with no publicId'} from "${endpoint}" is incomplete (${detail}); shown as incomplete.`,
  );
}

export type PreviewMapped<T> =
  { complete: true; value: T } | { complete: false; record: IncompleteRecord };

/**
 * One raw preview record: parsed by `schema`, then mapped by `map`, exactly as
 * live parses and maps it. A schema failure names **every** field at fault; a
 * mapper's refusal ({@link InvalidContentError}) names its one. Any other
 * error is a defect, and is thrown.
 *
 * `state` overrides the record's own `preview` block — a tile page's block
 * sits beside the tile rather than in it.
 */
export function mapPreviewRecord<B, T>(
  raw: unknown,
  schema: z.ZodType<B>,
  map: (body: B) => T,
  context: { endpoint: string; heading?: string | null; state?: PreviewState | null },
): PreviewMapped<T> {
  const heading = context.heading ?? null;
  const state = context.state === undefined ? previewOf(raw) : context.state;

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const record = incomplete(
      raw,
      parsed.error.issues.map((issue) => fieldOf(issue.path)),
      heading,
      state,
    );
    logIncomplete(
      context.endpoint,
      record,
      parsed.error.issues.map((issue) => `${issue.path.join('.')} ${issue.message}`).join('; '),
    );
    return { complete: false, record };
  }

  try {
    return { complete: true, value: map(parsed.data) };
  } catch (error) {
    if (!(error instanceof InvalidContentError)) throw error;
    const record = incomplete(raw, [fieldOfPath(error.field)], heading, state);
    logIncomplete(context.endpoint, record, `${error.field} ${error.detail}`);
    return { complete: false, record };
  }
}

/** Every raw record of a listing, split into those that map and those that do not. */
export function mapPreviewRecords<B, T>(
  raws: readonly unknown[],
  schema: z.ZodType<B>,
  map: (body: B) => T,
  endpoint: string,
): { records: T[]; incomplete: IncompleteRecord[] } {
  const records: T[] = [];
  const incompleteRecords: IncompleteRecord[] = [];
  for (const raw of raws) {
    const mapped = mapPreviewRecord(raw, schema, map, { endpoint });
    if (mapped.complete) records.push(mapped.value);
    else incompleteRecords.push(mapped.record);
  }
  return { records, incomplete: incompleteRecords };
}
