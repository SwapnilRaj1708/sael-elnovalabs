/**
 * Which tab on `/our-team/` a person appears under. `Our Team.dc.html` splits
 * the page into Leadership and Management, and a tab is a partition of the
 * roster, so it comes from each person's record rather than from a hardcoded
 * list of names in a component.
 */
export type TeamGroup = 'leadership' | 'management';

/**
 * A director or a member of the leadership team, on `/our-team/`.
 *
 * **Static content, not repository content.** There is no backend endpoint
 * for the team (descoped by SAEL on 20 Sep 2026, backend row 5.24), so the
 * roster is `ourTeamMembers` in `app/_content/our-team.ts` and a change to it
 * is a release.
 *
 * `photoUrl` is an absolute URL, composed from a blob path by the content
 * file, so `next/image` can optimise it like any remote image.
 *
 * There is no `photoAlt`: the correct alternative text for a portrait is the
 * name of the person in it, which this type already carries.
 *
 * `bio` may contain HTML — `p, br, strong, em, ul, ol, li, a`. It is
 * sanitised before it is rendered; see `lib/utils/sanitize-bio.ts`.
 */
export interface TeamMember {
  id: string;
  name: string;
  /** "Managing Director and Chairperson". Plain text, never HTML. */
  designation: string;
  group: TeamGroup;
  /** `null` when no portrait exists; the card then shows an initials avatar. */
  photoUrl: string | null;
  /** HTML, or `null` when the person has no published biography. */
  bio: string | null;
  /**
   * Absolute URL to this person's LinkedIn profile, or `null`.
   *
   * `null` for most of the board and set for most of the leadership team —
   * whether someone publishes a profile is their own decision, so this is
   * genuinely sparse rather than merely unfilled, and the dialog omits the
   * link entirely rather than showing a disabled one.
   */
  linkedinUrl: string | null;
}
