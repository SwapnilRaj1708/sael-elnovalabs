import { z } from 'zod';
import type { InvestorSection } from '@/lib/content';
import { INVESTOR_AREAS } from './tile-routes';

/**
 * The keys a gate reveals its URLs by — what `toGatedGroups` writes into a
 * row, and what the reveal actions take back. One parser for the live
 * actions (`../actions.ts`) and the preview's (`../preview-actions.ts`), so
 * neither can accept what the other refuses.
 *
 * Every key is untrusted: the page supplies it, but anything can POST to an
 * action. A key that does not parse resolves nothing.
 */

const SECTIONS = Object.keys(INVESTOR_AREAS) as [InvestorSection, ...InvestorSection[]];
const Slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .max(200);

/** `section/slug` — a gated tile. */
const TileKey = z
  .string()
  .max(240)
  .transform((key) => key.split('/'))
  .pipe(z.tuple([z.enum(SECTIONS), Slug]));

/** `section/slug/documentId` — one document on a gated tile. */
const DocumentKey = z
  .string()
  .max(400)
  .transform((key) => key.split('/'))
  .pipe(z.tuple([z.enum(SECTIONS), Slug, z.string().min(1).max(160)]));

export function parseTileKey(key: unknown): { section: InvestorSection; slug: string } | null {
  const parsed = TileKey.safeParse(key);
  return parsed.success ? { section: parsed.data[0], slug: parsed.data[1] } : null;
}

export function parseDocumentKey(
  key: unknown,
): { section: InvestorSection; slug: string; documentId: string } | null {
  const parsed = DocumentKey.safeParse(key);
  return parsed.success
    ? { section: parsed.data[0], slug: parsed.data[1], documentId: parsed.data[2] }
    : null;
}
