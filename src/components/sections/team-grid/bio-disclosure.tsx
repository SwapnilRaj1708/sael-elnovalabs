'use client';

import Image from 'next/image';
import { useRef, type MouseEvent } from 'react';
import { LinkedInIcon } from '@/components/icons/social';
import type { TeamMember } from './types';
import { SIZES_TEAM_DIALOG_PORTRAIT } from '@/lib/utils/image-sizes';
import { InitialsAvatar } from './initials-avatar';

export interface BioDisclosureProps {
  member: TeamMember;
  /**
   * The biography, **already sanitised** by `lib/utils/sanitize-bio.ts` on the
   * server. A string and not `member.bio` on purpose: this component must not
   * be able to render the raw field, and taking the clean copy as a separate
   * required prop is what makes that a type error rather than a code review.
   */
  bio: string;
}

/**
 * A team member's name as the trigger for their biography, and the dialog it
 * opens.
 *
 * **The only client component on this page**, and it is one leaf per card
 * rather than one wrapper around the grid — /CLAUDE.md §5. Everything around
 * it, including the portrait, the designation and the grid itself, is server
 * rendered.
 *
 * A native `<dialog>` opened with `showModal()`, which is what
 * `docs/features/07-our-team.md`'s three dialog criteria are asking for and
 * which the platform already implements correctly: focus is trapped inside the
 * top layer, `Esc` closes, and closing returns focus to the element that was
 * focused when it opened — the trigger. A hand-rolled modal would be several
 * hundred lines to get those three wrong.
 *
 * The trigger's `before:absolute before:inset-0` spreads its hit area over the
 * whole `<Card>`, which is the positioned ancestor, so the portrait and the
 * designation are clickable too. That is the design's own composition, and it
 * is done with a pseudo-element rather than by wrapping the card in a button
 * so that the accessible name stays "Jasbir Singh" and not the card's entire
 * text content.
 *
 * The `+` beside the name is `aria-hidden`: `aria-haspopup="dialog"` on the
 * button already tells a screen reader what activating it does, and a literal
 * "plus" announced after every name would be noise.
 */
export function BioDisclosure({ member, bio }: BioDisclosureProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `bio-${member.id}-name`;

  /**
   * A click that lands on the dialog element itself came from the backdrop —
   * the padding and the panel inside it are children, so anything within the
   * visible box has a different target. The same trick the design file uses.
   */
  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  return (
    <>
      <div className="flex items-baseline justify-between gap-tight">
        <h3 className="text-h3 text-white">
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => dialogRef.current?.showModal()}
            // `focus-visible:outline-white` here and on the close button
            // below: the global ring is --color-brand-blue, which is 1.84:1 on
            // this page's black ground and fails WCAG 1.4.11. globals.css
            // permits a primitive to restyle the ring, never to remove it.
            className="cursor-pointer text-left before:absolute before:inset-0 focus-visible:outline-white"
          >
            {member.name}
          </button>
        </h3>

        <span aria-hidden="true" className="text-h3 leading-none text-on-dark-soft">
          +
        </span>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={closeOnBackdrop}
        className="m-auto max-h-(--team-dialog-max-h) w-(--team-dialog-w) overflow-y-auto border border-hairline-grid bg-surface-black text-body-on-dark backdrop:bg-scrim-dialog"
      >
        <div className="flex flex-col gap-stack p-inset">
          <div className="flex items-start gap-inset">
            <div className="relative aspect-(--aspect-team-photo) w-(--team-dialog-portrait-w) flex-none overflow-hidden bg-surface-deep">
              {member.photoUrl === null ? (
                <InitialsAvatar name={member.name} className="absolute inset-0" />
              ) : (
                <Image
                  src={member.photoUrl}
                  // Decorative here, unlike on the card: the heading beside it
                  // is this person's name, so describing the portrait would
                  // announce it twice.
                  alt=""
                  aria-hidden
                  fill
                  sizes={SIZES_TEAM_DIALOG_PORTRAIT}
                  // The card's photograph, framed the same way as the card.
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex flex-1 flex-col gap-tight">
              <h3 id={titleId} className="text-h3 text-white">
                {member.name}
              </h3>
              <p className="text-body-sm text-on-dark-soft">{member.designation}</p>
            </div>

            <button
              type="button"
              aria-label="Close"
              onClick={() => dialogRef.current?.close()}
              className="flex size-touch flex-none cursor-pointer items-center justify-center border border-hairline-grid text-h3 leading-none text-body-on-dark transition-colors hover:text-white focus-visible:outline-white"
            >
              {/* Multiplication sign, not the letter x: it is the correct glyph
                  and it is invisible to assistive technology anyway, since the
                  button's name comes from aria-label. */}
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {/* Sanitised on the server — `lib/utils/sanitize-bio.ts` allows only
              the eight tags docs/api-contracts.md §4 permits, and this
              component cannot reach the unsanitised field. `rich-text` gives
              those tags back the margins the preflight reset strips; it is an
              `@utility` in globals.css. */}
          <div
            className="rich-text text-body-sm text-pretty text-body-on-dark"
            dangerouslySetInnerHTML={{ __html: bio }}
          />

          {/* Below the biography, which is where the live site puts it. Only
              seven of the seventeen have one, so this is genuinely absent
              rather than empty — no disabled affordance, no placeholder. */}
          {member.linkedinUrl !== null && (
            <a
              href={member.linkedinUrl}
              // An outbound link to a profile the company does not control.
              // `noopener` is the security half, `noreferrer` the privacy one.
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-touch items-center gap-tight self-start text-body-sm text-on-dark-soft transition-colors hover:text-white focus-visible:outline-white"
            >
              <LinkedInIcon className="size-5 shrink-0" />
              LinkedIn
              {/* The visible text is the same on all seven, so the accessible
                  name says whose profile it is and that it leaves the page.
                  `<LinkedInIcon>` is aria-hidden and adds no second name. */}
              <span className="sr-only"> profile for {member.name} (opens in a new tab)</span>
            </a>
          )}
        </div>
      </dialog>
    </>
  );
}
