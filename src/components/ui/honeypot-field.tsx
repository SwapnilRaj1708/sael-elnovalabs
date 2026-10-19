export interface HoneypotFieldProps {
  /** Unique on the page — the form's own prefix, say. */
  id: string;
  /**
   * The field's name. The contact form takes it from the backend's options
   * (`honeypotField`, docs/api-contracts.md §8.1), which SAEL can change
   * without a release.
   */
  name: string;
  /** Read only if the page's CSS fails to load: "Leave this field empty". */
  label: string;
}

/**
 * A field no person fills in, for catching bots that fill in every field.
 * Sent with the form, empty from a person; the backend answers a filled one
 * exactly as it answers an accepted enquiry, and stores nothing.
 *
 * Kept out of everyone's way three ways: off-screen (`sr-only`, so it is
 * still in the layout a bot reads, where `display: none` is a tell), out of
 * the accessibility tree (`aria-hidden`), and out of the tab order
 * (`tabIndex={-1}`). `autoComplete="off"` keeps a browser from filling it for
 * a person, which would cost that person their message without a word.
 *
 * Uncontrolled: the form reads it from the submitted `FormData`.
 */
export function HoneypotField({ id, name, label }: HoneypotFieldProps) {
  return (
    <div aria-hidden="true" className="sr-only">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}
