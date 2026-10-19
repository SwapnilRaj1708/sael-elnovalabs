/**
 * Moves focus to a form control and brings its whole field into view — the
 * label and the error above the control, not just the control.
 *
 * The browser's own scroll-on-focus aims at the control alone, and on a
 * phone with the keyboard up that can leave the error under the field's
 * label cut off at the top. So focus is moved without scrolling, and the
 * field wrapper `<FormField>` renders (`data-form-field`) is scrolled to
 * instead — `nearest`, so a field already on screen does not move, and clear
 * of the fixed header by the page's own `scroll-padding-top`. Smooth only
 * where motion is welcome: that is the `scroll-behavior` globals.css sets.
 */
export function focusField(controlId: string): void {
  const control = document.getElementById(controlId);
  if (control === null) return;

  control.focus({ preventScroll: true });
  (control.closest('[data-form-field]') ?? control).scrollIntoView({ block: 'nearest' });
}
