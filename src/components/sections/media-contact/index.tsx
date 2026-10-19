export interface MediaContactProps {
  /** Verbatim, colon included — "Media Contact:". */
  heading: string;
  name: string;
  designation: string;
  /** "Email:" */
  emailLabel: string;
  email: string;
  /** The heading's level — `h2` among the Newsroom index's sections. */
  headingLevel?: 'h2' | 'h3';
}

/**
 * Who the press should write to — the block at the foot of the legacy
 * Newsroom index: a name, a role and an address.
 *
 * An `<address>`, which is the element for contact information about the
 * page's subject, under its own heading so it is reachable by heading like
 * the sections above it. Name and role are lines rather than labelled fields
 * because the legacy block labels neither; only "Email:" is a label there,
 * so only it is one here.
 *
 * A Server Component.
 */
export function MediaContact({
  heading,
  name,
  designation,
  emailLabel,
  email,
  headingLevel: Heading = 'h2',
}: MediaContactProps) {
  return (
    <section
      aria-labelledby="media-contact-heading"
      className="flex flex-col gap-stack border-t border-hairline-dark pt-inset"
    >
      <Heading id="media-contact-heading" className="text-h3 text-white">
        {heading}
      </Heading>

      <address className="flex flex-col text-body-sm text-body-on-dark not-italic">
        <strong className="font-bold text-white">{name}</strong>
        <span>{designation}</span>
        <span>
          <strong className="font-bold text-white">{emailLabel}</strong>{' '}
          <a
            href={`mailto:${email}`}
            className="wrap-break-word underline decoration-hairline-dark underline-offset-4 transition-colors duration-(--duration-micro) hover:text-white hover:decoration-current focus-visible:outline-white"
          >
            {email}
          </a>
        </span>
      </address>
    </section>
  );
}
