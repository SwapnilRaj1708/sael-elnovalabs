import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { ContactRow } from '@/components/sections/contact-split/contact-row';
import { MapEmbed, type MapEmbedProps } from '@/components/ui/map-embed';

export interface ContactMapCaption {
  /** Verbatim — the details' "Address". */
  label: string;
  /** Verbatim — the address the map shows. */
  address: string;
  /** Directions to it, in Google Maps, in a new tab. */
  directions: { label: string; href: string };
  /** What loading the map does — Google, cookies. */
  note: string;
  /** "opens in a new tab". */
  newTabNote: string;
}

export interface ContactMapProps {
  caption: ContactMapCaption;
  map: Omit<MapEmbedProps, 'preview' | 'className'>;
  /** The picture in the frame until the map loads — `<MapBeacon>`. */
  preview: ReactNode;
}

/**
 * The office map, as the last row of Contact Us — the map in the form's
 * column, and in the details' column the words for it: what it shows, a way
 * there, and what loading it does.
 *
 * **The social row's twin, not its copy** — the client's ask of 2026-10-06,
 * that the two read as one family without repeating each other. Both are a
 * `<ContactRow>`: the same columns, the same hairline. Where the social row
 * has a heading and a line of icons, this one has a caption and a framed
 * map, and the frame is the form fields' ring, so the eye moves from the
 * form, past the icons, to the map without meeting a box of a different
 * kind.
 *
 * The directions link is the details' "Open in Google Maps" in look — the
 * same underline, the same outward arrow, a full 44px target.
 *
 * A Server Component; the map's facade is the client leaf.
 */
export function ContactMap({ caption, map, preview }: ContactMapProps) {
  return (
    <ContactRow
      aside={
        <div className="flex flex-col gap-tight">
          <p className="text-body-sm font-bold text-white">{caption.label}</p>
          <p className="text-body text-body-on-dark">{caption.address}</p>
          <a
            href={caption.directions.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-touch w-fit items-center gap-tight text-body-sm text-body-on-dark underline decoration-hairline-dark underline-offset-4 transition-colors duration-(--duration-micro) hover:text-brand-red-bright hover:decoration-current focus-visible:text-brand-red-bright focus-visible:outline-white"
          >
            {caption.directions.label}
            <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" focusable="false" />
            <span className="sr-only"> ({caption.newTabNote})</span>
          </a>
          <p className="text-body-sm text-on-dark-soft">{caption.note}</p>
        </div>
      }
    >
      <MapEmbed {...map} preview={preview} />
    </ContactRow>
  );
}
