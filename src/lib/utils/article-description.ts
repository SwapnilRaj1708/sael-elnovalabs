/**
 * An article page's meta description, derived from its body **by the rule
 * the legacy site uses**, so the snippet search engines already show for each
 * of these URLs does not change at cutover.
 *
 * The legacy CMS does not store a description: it strips the tags from the
 * body's raw HTML, keeps the first 170 characters, trims the end and appends
 * "...". Checked against all seventeen legacy article pages on 2026-10-01;
 * the rule reproduces every one of them.
 *
 * One deliberate difference: the legacy pages escape the body's entities a
 * second time, so "R&D" reaches the search snippet as "R&amp;D". Here the
 * entities are decoded after the cut, and Next escapes the attribute once.
 * That changes one description of seventeen, for the better.
 *
 * Tags go by regular expression, which is fine for this and only this: the
 * input is a sanitised body, the output is a plain string that Next escapes
 * into an attribute, and nothing here is ever rendered as markup.
 */

const LEGACY_LIMIT = 170;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith('#')) {
      const code =
        entity[1] === 'x' || entity[1] === 'X'
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

export function articleDescription(body: string): string {
  // Code points, not UTF-16 units and not graphemes: that is what the legacy
  // cut counts (the curly quotes and the ₹ in these bodies are one each), and
  // a cut by code point cannot split a surrogate pair.
  const characters = Array.from(body.replace(/<[^>]*>/g, ''));
  const truncated = characters.length > LEGACY_LIMIT;
  const text = characters.slice(0, LEGACY_LIMIT).join('').trimEnd();

  return `${decodeEntities(text)}${truncated ? '...' : ''}`;
}
