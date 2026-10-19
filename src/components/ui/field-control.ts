import { cva } from 'class-variance-authority';

/**
 * The look every form control shares — `<Input>`, `<Select>`, `<Textarea>` —
 * on the black ground every form on the site sits on. Its own module, as
 * `news-card-action.ts` is, so three primitives can take one definition.
 *
 * Kin to the document filter's field (`ui/document-filter.tsx`) — the same
 * corner, padding and type — with two differences, both about legibility:
 *
 *  - **The edge is `--color-outline-dark`, not the hairline.** A control's
 *    boundary must reach 3:1 against its ground (WCAG 1.4.11); the hairline
 *    is ~1.5:1 there, which suits a search box above a list but leaves an
 *    empty form field nearly invisible. The outline is 3.2:1.
 *  - **A solid fill, `--color-surface-black`**, where the filter is
 *    transparent, so the ground's dot grid does not run behind what is typed.
 *
 * `--text-body` is 16px at its smallest, and that is load-bearing: iOS Safari
 * zooms the page into any field set smaller when it takes focus.
 *
 * An invalid control turns its edge `--color-error-on-dark` (`aria-invalid`,
 * set by `<FormField>`), which outranks hover and focus — it stays red while
 * it is being corrected, under a white focus ring. Colour is never the only
 * sign: the field's error text says what is wrong.
 *
 * `scheme-dark` gives the native parts — a select's open list, a date
 * picker, Chrome's autofill fill — their dark rendering.
 *
 * **Dark ground only, for now.** A form on paper needs its own edge token:
 * `--color-outline-paper` is ~2.1:1 on paper, short of 3:1.
 */
export const fieldControl = cva([
  'block min-h-touch w-full rounded-(--radius-card) border border-outline-dark bg-surface-black',
  'px-stack py-tight text-body text-white placeholder:text-on-dark-muted',
  'scheme-dark',
  'transition-colors duration-(--duration-micro) motion-reduce:transition-none',
  'hover:border-on-dark-soft',
  // The global ring is --color-brand-blue, 1.84:1 on this ground.
  'focus-visible:border-white focus-visible:outline-white',
  'aria-invalid:border-error-on-dark',
]);
