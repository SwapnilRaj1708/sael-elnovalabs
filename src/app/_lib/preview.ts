import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  incompleteRow,
  previewBanner,
  previewMessages,
  previewScreenNames,
  previewTitle,
  wrongScreenMessage,
  type PreviewMessage,
} from '@/app/_content/preview';
import type { PreviewBannerProps } from '@/components/sections/preview-banner';
import type { IncompleteRecord, PreviewRead, PreviewScreenCode } from '@/lib/content';
import {
  PREVIEW_COOKIE,
  PREVIEW_NOTICE_PARAM,
  PREVIEW_NOTICES,
  PREVIEW_SCREEN_PARAM,
  type PreviewNotice,
} from '@/lib/preview/pages';

/**
 * What every Live Preview page shares, Newsroom and investors alike. Page
 * code, in a folder the router ignores. The session and the rules for it are
 * `lib/preview/pages.ts`; the words are `app/_content/preview.ts`; what each
 * area's pages add is beside them (`newsroom/_lib/news-preview.ts`,
 * `investors/_lib/documents-preview.ts`).
 */

/**
 * A preview page's metadata: **never indexed**, whatever the origin. The root
 * layout marks only non-production origins `noindex`, so on the real host a
 * preview page would otherwise be indexable. `next.config.ts` sends
 * `X-Robots-Tag` on the same paths, for whatever reads headers and not HTML.
 *
 * The same `<title>` on a listing and its detail pages: deriving a detail
 * page's from the draft would mean a second credentialed fetch per page view,
 * and every fetch mints signed URLs that the backend audits one by one.
 */
export function previewMetadata(sectionName: string): Metadata {
  return {
    title: { absolute: previewTitle(sectionName) },
    robots: { index: false, follow: false },
  };
}

/**
 * The session for this page, from its cookie. The cookie's `Path` is this
 * preview page's root, so the browser sends only this section's session here
 * — on a page load, and on a Server Action posted from the page alike.
 */
export async function previewSessionToken(): Promise<string | null> {
  return (await cookies()).get(PREVIEW_COOKIE)?.value ?? null;
}

export type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isScreenCode(value: string | undefined): value is PreviewScreenCode {
  return value !== undefined && Object.hasOwn(previewScreenNames, value);
}

/**
 * The message for the notice the session route handler redirected with, or
 * `null` if it sent none. The notice describes what just happened to the link
 * the reviewer clicked, so it wins over a session the browser may still hold
 * from earlier.
 */
export function noticeMessage(searchParams: SearchParams, pageName: string): PreviewMessage | null {
  const notice = first(searchParams[PREVIEW_NOTICE_PARAM]);
  if (notice === undefined || !(PREVIEW_NOTICES as readonly string[]).includes(notice)) return null;

  switch (notice as PreviewNotice) {
    case 'link-refused':
      return previewMessages.linkRefused;
    case 'unavailable':
      return previewMessages.unavailable;
    case 'wrong-screen': {
      const linkFor = first(searchParams[PREVIEW_SCREEN_PARAM]);
      return wrongScreenMessage(
        pageName,
        isScreenCode(linkFor) ? previewScreenNames[linkFor] : null,
      );
    }
  }
}

/** The message for a preview read the backend refused. */
export function refusalMessage(
  read: Extract<PreviewRead<unknown>, { ok: false }>,
  pageName: string,
): PreviewMessage {
  switch (read.reason) {
    case 'session-ended':
      return previewMessages.sessionEnded;
    case 'wrong-screen':
      return wrongScreenMessage(pageName, null);
    case 'switched-off':
      return previewMessages.switchedOff;
  }
}

/** The banner's block of records the page cannot draw. */
export function incompleteBlock(
  records: readonly IncompleteRecord[],
): NonNullable<PreviewBannerProps['incomplete']> {
  return {
    heading: previewBanner.incompleteHeading,
    note: previewBanner.incompleteNote,
    rows: records.map(incompleteRow),
  };
}
