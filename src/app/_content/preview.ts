import type {
  IncompleteField,
  IncompleteRecord,
  PreviewScreenCode,
  PreviewState,
} from '@/lib/content';
import { formatDateTime } from '@/lib/utils/format-date';

/**
 * The copy on Live Preview pages: the draft banner, and what a reviewer sees
 * when a preview cannot be shown. docs/api-contracts.md §6.
 *
 * **Functional copy, written for the new site**, like the Newsroom's empty
 * state: no legacy page has a preview to transcribe. The readers are SAEL's
 * reviewers, who arrive from a button in the admin panel and need to know two
 * things: what happened, and what to do next. "401" answers neither. Every
 * message ends with the step that fixes it, and that step is in the panel,
 * because the panel is the only place a new link comes from.
 *
 * No durations are written into the copy. The link's and the session's
 * lifetimes are settings in the panel (`preview.token.ttl-seconds`,
 * `preview.session.ttl-seconds`), and a number here would go stale the day
 * either changes.
 */

/** Each screen as a reviewer knows it — the section's name on the site and in the panel. */
export const previewScreenNames: Record<PreviewScreenCode, string> = {
  NEWS_PRESS_RELEASE: 'Press Release',
  NEWS_IN_THE_NEWS: 'In The News',
  NEWS_OUR_VIEWS: 'Our Views',
  NEWS_MULTIMEDIA: 'Multimedia',
  DOC_OFFER_DOCUMENTS: 'Offer Documents',
  DOC_CORPORATE_GOVERNANCE: 'Corporate Governance',
  DOC_FINANCIALS_REPORTS: 'Financials & Reports',
  DOC_NOTIFICATIONS: 'Notifications',
};

/** A preview page's `<title>`. */
export function previewTitle(name: string): string {
  return `Preview: ${name} - SAEL`;
}

/* ---------- The banner ---------- */

export const previewBanner = {
  /** The strip that stays on screen while the reviewer scrolls. */
  label: 'Draft preview',
  labelNote: 'This is not the live website',
  /** Under the strip, once. */
  audience:
    'Only people with a Live Preview link from the admin panel can see this page. Nothing here is public until it is approved and published.',
  listingHeading: 'Not yet live on this page',
  /** A listing whose items are all already published, as shown. */
  listingNothingPending: 'Everything on this page is already live, exactly as shown.',
  articleHeading: 'This article',
  /** An article that is published and has nothing in flight. */
  articleLive: 'This article is live, exactly as shown.',
  /** A tile's page: the tile's own row, then each document not yet live. */
  tilePageHeading: 'Not yet live on this page',
  /** The tile's own row: its title, description, headings or disclaimer. */
  tileOwnRow: 'The page itself: its title, description, headings and notice',
  tilePageNothingPending: 'Everything on this page is already live, exactly as shown.',
  /**
   * Records the page cannot draw. The live site would leave them out, so a
   * reviewer who did not see them here would never know they existed.
   */
  incompleteHeading: 'Incomplete, so not shown below',
  incompleteNote:
    'These records are missing something this page needs, so the live website would leave them out. Complete them in the admin panel, then select Live Preview again.',
};

/** What a record lacks, as the panel's form calls it. */
const incompleteFieldLabels: Record<IncompleteField, string> = {
  title: 'a title',
  slug: 'a URL slug',
  link: 'a link',
  video: 'a video',
  date: 'a valid date',
  image: 'a valid image',
  disclaimer: 'the disclaimer text',
  'display-mode': 'a display mode',
  file: 'a valid file',
  kind: 'a document type',
  section: 'the right section',
  route: 'a URL slug this website has a page for',
  other: 'a value the website could not read (the website team can see which in its log)',
};

/** "Missing a title and a link". */
function missingLabel(fields: readonly IncompleteField[]): string {
  const labels = fields.map((field) => incompleteFieldLabels[field]);
  const listed =
    labels.length <= 1
      ? (labels[0] ?? '')
      : `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1] ?? ''}`;
  return `Missing ${listed}`;
}

/** A record with no usable title. */
const untitled = 'Untitled record';

/** An incomplete record's banner row: what it is, what it lacks, where it sits, its state. */
export function incompleteRow(record: IncompleteRecord): { title: string; facts: string[] } {
  return {
    title: record.title ?? untitled,
    facts: [
      missingLabel(record.missing),
      ...(record.heading === null ? [] : [`Under “${record.heading}”`]),
      ...(record.preview === null ? [] : previewFacts(record.preview)),
    ],
  };
}

/**
 * `PENDING_APPROVAL` → "Pending approval". The panel's eight statuses are
 * shown as words, never branched on: whether a record is a draft is
 * `isDraft`, the backend's call.
 */
export function previewStatusLabel(status: string): string {
  const words = status.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** "Pending approval", "Version 3", "Last changed by Meera Raghavan on Sep 5, 2026, 8:33 AM". */
export function previewFacts(state: PreviewState): string[] {
  const changed = state.lastUpdatedAt === null ? '' : formatDateTime(state.lastUpdatedAt);
  const by = state.lastUpdatedBy;
  const lastChanged =
    by !== null && changed !== ''
      ? `Last changed by ${by} on ${changed}`
      : by !== null
        ? `Last changed by ${by}`
        : changed !== ''
          ? `Last changed on ${changed}`
          : null;

  return [
    previewStatusLabel(state.status),
    `Version ${String(state.versionNo)}`,
    ...(lastChanged === null ? [] : [lastChanged]),
  ];
}

/* ---------- When there is nothing to show ---------- */

export interface PreviewMessage {
  title: string;
  body: string;
}

/**
 * What a reviewer sees in place of the preview, by what went wrong. The four
 * reasons are different situations with different next steps, so they get
 * different words.
 */
export const previewMessages = {
  /**
   * The link was refused: expired, already used, revoked or malformed. The
   * backend's own recommended wording leads (docs/api-contracts.md §6.2).
   */
  linkRefused: {
    title: 'This preview link has expired or has already been used',
    body: 'Each Live Preview link opens once, and only for a short time after it is made. A link forwarded from someone else will not open for you either. Go back to the record in the admin panel and select Live Preview to get a new link.',
  },
  /**
   * No session: the page was opened without a link, the session has run out,
   * or the link came through something that is not a browser. These cannot be
   * told apart here, and the next step is the same.
   */
  noSession: {
    title: 'Open this preview from the admin panel',
    body: 'Preview pages open only from the Live Preview button in the admin panel. If you were already reviewing, your preview session has ended. Select Live Preview again in the panel to carry on.',
  },
  /** A session that the backend stopped accepting while the page was open. */
  sessionEnded: {
    title: 'Your preview session has ended',
    body: 'Preview sessions last a short time, for security. Select Live Preview again on the record in the admin panel to carry on reviewing.',
  },
  /** The backend could not be reached during the exchange. */
  unavailable: {
    title: 'The preview could not be opened',
    body: 'The website could not reach the admin panel to check your link. Try the link again in a minute. If it then says the link has been used, select Live Preview in the admin panel for a new one.',
  },
  /** Preview is turned off in the panel's settings. */
  switchedOff: {
    title: 'Live Preview is switched off',
    body: 'An administrator has turned Live Preview off in the admin panel. Ask them to turn it back on, then select Live Preview again.',
  },
} as const satisfies Record<string, PreviewMessage>;

/**
 * A link, or a session, for another section. `linkFor` is the section the
 * link was made for, when it is known. It is known when the link was just
 * exchanged, and unknown when the backend refuses a session already stored.
 */
export function wrongScreenMessage(pageName: string, linkFor: string | null): PreviewMessage {
  return linkFor === null
    ? {
        title: `This preview is not for ${pageName}`,
        body: `Your preview session is for a different section of the website. Open the ${pageName} screen in the admin panel and select Live Preview there.`,
      }
    : {
        title: `This preview link is for ${linkFor}, not ${pageName}`,
        body: `Open the ${linkFor} screen in the admin panel and select Live Preview there. If the panel's button keeps opening the wrong page, tell the website team: the panel's preview addresses need correcting.`,
      };
}

/**
 * A detail page whose record cannot be drawn at all — a draft tile or article
 * missing something its page is built from.
 */
export function incompleteMessage(record: IncompleteRecord): PreviewMessage {
  return {
    title: `“${record.title ?? untitled}” is not complete yet`,
    body: `${missingLabel(record.missing)}, so its page cannot be shown. Complete it in the admin panel, then select Live Preview again.`,
  };
}

/** The way out of a message: the live page the preview stands in for. */
export function previewLiveLinkLabel(name: string): string {
  return `Go to the live ${name} page`;
}
