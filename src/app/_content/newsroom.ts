import type { NewsGridLabels } from '@/components/sections/news-grid';
import type { SubPageNavProps } from '@/components/sections/sub-page';
import { TODO_CONTENT } from '@/lib/config/site';
import { NEWSROOM_PATH, newsListingPath, type NewsCategory } from '@/lib/content';

/**
 * The Newsroom's static content — everything on its pages that is not a news
 * item. The items themselves are dynamic and come from the repository
 * (`getNewsItems`, `getNewsArticle`).
 *
 * **Transcribed from the legacy https://www.sael.co/newsroom/ and its four
 * listings**, read from their raw HTML on 2026-10-01: every name, `<title>`
 * and label below is the legacy page's own, verbatim — "Press Release" in the
 * singular, "In The News" with its capital T, "View More", "Published On:".
 *
 * **Not transcribed, because the legacy pages do not have them:** the cards'
 * action labels, which are the homepage card's ("Read More") and its
 * counterpart for a video; the screen-reader text; the video dialog's close
 * button; and the empty state for a listing the repository could not load.
 * Those are functional copy and are marked where they are defined.
 *
 * Every legacy Newsroom page ships `<meta name="description" content="">`,
 * so there is no description to transcribe and none is invented:
 * `buildMetadata()` drops the marker. An article's description is derived
 * from its body by the legacy rule — `lib/utils/article-description.ts`.
 */

/** A page's `<title>` and description. */
interface PageMeta {
  title: string;
  description: string;
}

/** The index. */
export const newsroomIndex: { path: string; title: string; meta: PageMeta } = {
  path: NEWSROOM_PATH,
  title: 'Newsroom',
  meta: { title: 'Newsroom - SAEL', description: TODO_CONTENT },
};

export interface NewsroomSection {
  category: NewsCategory;
  /** The section's name — its `<h1>` on its listing, its `<h2>` on the index. */
  name: string;
  path: string;
  meta: PageMeta;
}

function section(category: NewsCategory, name: string, title: string): NewsroomSection {
  return {
    category,
    name,
    path: newsListingPath(category),
    meta: { title, description: TODO_CONTENT },
  };
}

/** The four sections, in the legacy order — the tab row's and the index's. */
export const newsroomSections = {
  'press-release': section('press-release', 'Press Release', 'Press Release - SAEL'),
  'in-the-news': section('in-the-news', 'In The News', 'In The News - SAEL'),
  'our-views': section('our-views', 'Our Views', 'Our Views - SAEL'),
  multimedia: section('multimedia', 'Multimedia', 'Multimedia - SAEL'),
} as const satisfies Record<NewsCategory, NewsroomSection>;

export const newsroomSectionList: readonly NewsroomSection[] = Object.values(newsroomSections);

/**
 * A listing's side list: the four sections, this one marked current — the
 * legacy tab row across the top of every Newsroom page, in the investor
 * template's place for it. Its heading is the area's name.
 */
export function newsroomNav(current: NewsroomSection): SubPageNavProps {
  return {
    label: newsroomIndex.title,
    items: newsroomSectionList.map(({ name, path }) => ({ name, href: path })),
    currentHref: current.path,
  };
}

/**
 * How many items each section shows on the index: one row of four on a wide
 * screen. The legacy index shows six of each (four of Our Views, which has
 * four); everything is one "View More" away.
 */
export const NEWSROOM_INDEX_ROW = 4;

/** The index's link to each listing, verbatim. */
export const viewMoreLabel = 'View More';

/**
 * Functional copy: the accessible name of the index's row of section links,
 * the same name the investor pages give theirs.
 */
export const sectionLinksLabel = 'On this page';

/**
 * Functional copy — not on the legacy pages. "Read More" is the homepage
 * card's own label; the rest are its counterparts and the text a screen
 * reader needs where the eye has the layout.
 */
export const newsCardLabels: NewsGridLabels = {
  read: 'Read More',
  readPrefix: 'Read more',
  newTab: 'opens in a new tab',
  watch: 'Watch Video',
  watchPrefix: 'Watch video',
  close: 'Close',
};

/** Functional copy for a listing the repository could not load. */
export const newsEmpty = {
  title: 'News is unavailable',
  description: 'We could not load these items just now. Please try again shortly.',
} as const;

/** The article page's date label, verbatim: "Published On: Jun 10, 2026". */
export const publishedOnLabel = 'Published On:';

/**
 * The legacy index's "Media Contact" block, after the Multimedia row,
 * verbatim. The address is Cloudflare-obfuscated in the legacy HTML
 * (`data-cfemail`) and is decoded here; it is the same address the legacy
 * `mailto:` opens.
 */
export const mediaContact = {
  heading: 'Media Contact:',
  name: 'Aditya Singh',
  designation: 'Head of Corporate Communications',
  emailLabel: 'Email:',
  email: 'media@sael.co',
} as const;
