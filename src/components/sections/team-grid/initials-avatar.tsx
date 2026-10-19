import { cn } from '@/lib/utils/cn';

export interface InitialsAvatarProps {
  /** The person's full name. Only their initials are drawn. */
  name: string;
  className?: string;
}

/**
 * First and last initial, on the brand gradient.
 *
 * `docs/features/07-our-team.md`: "`photo === null` → an initials avatar on a
 * brand-gradient background. Do not ship a broken image icon." The roster the
 * client publishes today has a portrait for every one of its seventeen people,
 * so nothing on the page currently takes this branch — it exists because
 * `photoUrl` is nullable (an unset `AZURE_BLOB_BASE_URL` yields `null`), and a
 * card that renders a cracked-image glyph the first time a portrait is missing
 * is a card that was never finished.
 *
 * Deliberately **not** `<MediaFrame>`'s pending placeholder. That grey block
 * means "this asset has not been supplied yet and will be"; this means "this
 * person has no portrait", which is a permanent state and should look
 * intentional rather than unfinished.
 *
 * `aria-hidden`, because the card's `<h3>` is the name immediately below it —
 * a screen reader announcing "JS" and then "Jasbir Singh" is repetition, and
 * the initials carry nothing the heading does not.
 */
export function InitialsAvatar({ name, className }: InitialsAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex items-center justify-center bg-(image:--gradient-shape)',
        'text-h2 text-white',
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

/**
 * First initial plus last initial: "Jasbir Singh" → "JS", "Øistein Magnar
 * Andresen" → "ØA", "Kewal" → "K".
 *
 * Splits on any run of whitespace so a double space or a stray tab in a CMS
 * field cannot produce an empty initial, and uses the *last* word rather than
 * the second so a middle name is skipped rather than shown.
 *
 * `Array.from` rather than `[0]`, because indexing a string yields a UTF-16
 * code unit: a name beginning with an astral character would otherwise render
 * half a surrogate pair. Not currently reachable with this roster, and one
 * character's worth of care to keep it that way.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  const firstWord = words[0];
  if (firstWord === undefined) return '';

  const lastWord = words.length > 1 ? words[words.length - 1] : undefined;

  const first = Array.from(firstWord)[0] ?? '';
  const last = lastWord === undefined ? '' : (Array.from(lastWord)[0] ?? '');

  return `${first}${last}`.toUpperCase();
}
