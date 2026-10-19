import sanitizeHtml from 'sanitize-html';

/**
 * Reduce a biography to the tags `docs/api-contracts.md` §4 permits.
 *
 * **This is the second sanitiser, not the only one.** That contract makes
 * server-side sanitisation in Spring Boot the primary control and this the
 * backstop, and `docs/features/07-our-team.md` asks for it explicitly. The
 * redundancy is the point: `bio` is the one field on this site that is
 * rendered as markup rather than as text, so it is the one field where a
 * backend that is misconfigured, rolled back, or simply shipped before its
 * sanitiser lands would put script into a page. A defence that only works when
 * the other defence works is not a defence.
 *
 * The allowlist is exactly the contract's — `p, br, strong, em, ul, ol, li, a`
 * — and everything outside it is dropped rather than escaped, so a stripped
 * `<script>` leaves no visible residue in the prose. `disallowedTagsMode`
 * stays at the default `discard` for that reason.
 *
 * Links keep `href` and nothing else, are restricted to schemes that cannot
 * execute (so no `javascript:`), and are given `rel="noopener noreferrer"`.
 * `target` is deliberately not allowed through: a biography that opened a new
 * window on its own would be a surprise, and the attribute is the other half
 * of the `noopener` hazard.
 *
 * **Server-side only.** `sanitize-html` is a Node library and pulling it into
 * a client bundle would be both broken and large, so this is called from the
 * Server Component that renders the biography and the sanitised *string* is
 * what crosses into the client leaf that displays it. There is no
 * `import 'server-only'` guard because the package is not a dependency of this
 * project; if one is added later, this module should take it.
 *
 * Returns `null` unchanged, and returns `null` for markup that sanitises down
 * to nothing, so a caller has one emptiness check rather than two.
 */
export function sanitizeBio(bio: string | null): string | null {
  if (bio === null) return null;

  const clean = sanitizeHtml(bio, {
    allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: { a: ['href'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    // A relative href has no scheme to check, and the backend has no reason to
    // emit one into a biography. Treat it as it treats an unknown scheme.
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  }).trim();

  return clean === '' ? null : clean;
}
