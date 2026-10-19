import sanitizeHtml from 'sanitize-html';
import { isProduction } from '@/lib/config/env';

/**
 * Reduce a Newsroom article body to the markup an article needs, and render
 * nothing else. `sanitize-bio.ts`'s counterpart: `NewsArticle.body` is CMS
 * HTML rendered as markup, so this is the backstop behind the backend's own
 * sanitiser, not a replacement for it.
 *
 * **The allowlist is a superset of the backend's**, and must stay one
 * (docs/api-contracts.md §2.7). The backend permits `p, br, strong, em, u,
 * mark, ul, ol, li, h2, h3, h4, blockquote, a, img, table, thead, tbody, tr,
 * th, td, sup, sub`, and the attributes `href, title, target, rel, src, alt,
 * width, height, colspan, rowspan` on any of them. Anything this list
 * omits, a checker approves in the panel and the public never sees — a
 * results table arrives as run-on text, a highlight disappears. That is
 * silent corruption of an approved publication, so a tag the backend admits
 * is never narrowed here. The legacy articles add `b`, `i`, `figure` and
 * `figcaption`, which are kept for the mock's fixtures.
 *
 * - **Links** keep `href`, `title` and `target`, on schemes that cannot
 *   execute, and are always given `rel="noopener noreferrer"`.
 * - **Images** keep `src`, `alt`, `width` and `height` — the last two so the
 *   browser reserves the box before the file arrives. Each is lazy-loaded.
 *   An image with no `src` is removed rather than rendered broken. The
 *   source must be `https:`, except in development, where local media is
 *   Azurite over plain `http:`.
 * - **Tables** keep `colspan` and `rowspan`, and `width`/`height` as the
 *   backend does. Each is wrapped in a scroll box, so a table wider than a
 *   phone scrolls inside the article instead of widening the page.
 *
 * **Attributes this adds are also on the allowlist**, and must be: the
 * transforms run first, and the attribute filter would otherwise strip them
 * straight back off.
 *
 * Server-side only, for the reason `sanitizeBio` gives. Returns `null` for a
 * body that sanitises down to nothing.
 */
export function sanitizeArticle(body: string): string | null {
  const clean = sanitizeHtml(body, {
    allowedTags: [
      'p',
      'br',
      'h2',
      'h3',
      'h4',
      'ul',
      'ol',
      'li',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'mark',
      'sup',
      'sub',
      'a',
      'blockquote',
      'figure',
      'figcaption',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    allowedAttributes: {
      '*': ['title'],
      a: ['href', 'rel', 'target'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
      table: ['width', 'height'],
      th: ['colspan', 'rowspan', 'width', 'height'],
      td: ['colspan', 'rowspan', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: isProduction ? ['https'] : ['https', 'http'] },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
      img: sanitizeHtml.simpleTransform('img', { loading: 'lazy', decoding: 'async' }),
    },
    exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
  }).trim();

  if (clean === '') return null;

  // On the sanitised output, where every <table> is balanced, so the wrapper
  // always closes. Focusable, so a keyboard user can scroll it too.
  return clean
    .replace(/<table\b/g, '<div class="article-table" tabindex="0"><table')
    .replace(/<\/table>/g, '</table></div>');
}
