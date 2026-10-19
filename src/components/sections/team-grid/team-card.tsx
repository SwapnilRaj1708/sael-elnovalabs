import Image from 'next/image';
import { Card } from '@/components/ui/card';
import type { TeamMember } from './types';
import { cn } from '@/lib/utils/cn';
import { SIZES_TEAM_CARD } from '@/lib/utils/image-sizes';
import { sanitizeBio } from '@/lib/utils/sanitize-bio';
import { BioDisclosure } from './bio-disclosure';
import { InitialsAvatar } from './initials-avatar';

export interface TeamCardProps {
  member: TeamMember;
}

/**
 * One person: portrait, name, designation — and, if they have a biography, the
 * dialog that opens it.
 *
 * A **Server Component**, and the sanitiser call is why that matters.
 * `sanitizeBio` runs here, so `sanitize-html` stays on the server and only the
 * clean string crosses into `<BioDisclosure>`. Moving this file's `'use
 * client'` boundary up by one component would pull a Node HTML parser into the
 * browser bundle.
 *
 * `<Image>` and not `<MediaFrame>`: `photoUrl` is a CMS URL, not a bundled
 * `StaticImageData`. Same reason and same shape as the news card
 * (`sections/news-carousel`), and the box is held by `--aspect-team-photo`
 * either way, so a missing portrait costs no layout shift.
 *
 * Where there is no biography the name is plain text and there is no `+`. A
 * card that looks identical to its neighbours but does nothing when clicked is
 * worse than one that visibly offers less.
 */
export function TeamCard({ member }: TeamCardProps) {
  // Sanitised even though the fixtures are ours and the backend is contracted
  // to sanitise first. See lib/utils/sanitize-bio.ts for why that is not
  // redundant. Returns null for markup that reduces to nothing, so this is one
  // check and not two.
  const bio = sanitizeBio(member.bio);

  return (
    <Card as="article" ground="dark" accentClassName="bg-(image:--gradient-eyebrow-bright)">
      <div className="flex w-full flex-col gap-stack">
        <div className="relative aspect-(--aspect-team-photo) w-full overflow-hidden bg-surface-deep">
          {member.photoUrl === null ? (
            <InitialsAvatar name={member.name} className="absolute inset-0" />
          ) : (
            <Image
              src={member.photoUrl}
              // The portrait *is* the person, and the heading under it repeats
              // their name for a sighted reader. Alt text of the name is the
              // right description of a photograph of someone.
              alt={member.name}
              fill
              sizes={SIZES_TEAM_CARD}
              // A slow, slight zoom on hover, mirrored for keyboard focus so
              // the card behaves the same however it is reached, and held
              // still under reduced motion. The frame above is
              // `overflow-hidden`, so the growth is clipped to the portrait's
              // own box. Same treatment as the news card.
              className={cn(
                'object-cover transition-transform duration-(--duration-card) ease-out',
                'group-hover:scale-105 group-has-focus-visible:scale-105',
                'motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-has-focus-visible:scale-100',
              )}
            />
          )}
        </div>

        {bio === null ? (
          <h3 className="text-h3 text-white">{member.name}</h3>
        ) : (
          <BioDisclosure member={member} bio={bio} />
        )}

        <p className="text-body-sm text-on-dark-soft">{member.designation}</p>
      </div>
    </Card>
  );
}
