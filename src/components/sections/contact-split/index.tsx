import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';

export interface ContactSplitProps {
  /** `<ContactDetails>`. */
  details: ReactNode;
  /** The form's heading — the legacy "GET IN TOUCH" over "Send us a message". */
  formHeading: {
    eyebrow: string;
    title: string;
    /** The `<h2>`'s id, which the form takes as its accessible name. */
    id: string;
  };
  /** The form itself. */
  form: ReactNode;
}

/**
 * Contact Us's first section: the contact details beside the form.
 *
 * **Below `lg`, one column — details, then form.** On a phone the form is
 * what the page is for, so the only thing above it is the three short rows
 * that answer "how else do I reach them".
 *
 * **From `lg`, two — the legacy split.** Details in the narrow left column,
 * the form in the wide right one, as the legacy page sets them (4/12 and
 * 8/12). The details stay in view while the form is filled in
 * (`sticky`, clear of the masthead), so the phone number and address are
 * beside the form however far down it the visitor is.
 *
 * The social profiles and the office map are not in here; they are the rows
 * under it (`<ContactRow>`), on these same two columns.
 *
 * A Server Component; the form brings its own client leaf.
 */
export function ContactSplit({ details, formHeading, form }: ContactSplitProps) {
  return (
    <div className="flex flex-col gap-flow lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start lg:gap-x-ledger-col-gap">
      <div className="lg:sticky lg:top-[calc(var(--spacing-header)+var(--spacing-flow))]">
        {details}
      </div>

      <section aria-labelledby={formHeading.id} className="flex flex-col gap-flow">
        <div className="flex flex-col gap-stack">
          <Eyebrow tone="bright">{formHeading.eyebrow}</Eyebrow>
          <h2 id={formHeading.id} className="text-h2 text-white">
            {formHeading.title}
          </h2>
        </div>

        {form}
      </section>
    </div>
  );
}
