/**
 * Event names for the contact modal, kept in their own module rather than
 * exported from the component.
 *
 * `ThemeButton` opens the modal, and the modal renders `ThemeButton` — importing
 * the constants straight from the component would make that a cycle, and a cyclic
 * ES import resolves to `undefined` at evaluation time depending on which module
 * the bundler reaches first. A leaf module both can depend on avoids it.
 */

/** Fires when the modal opens, so the corner offer toast can get out of the way. */
export const CONTACT_MODAL_OPEN_EVENT = "contact-modal:open";

/** Request the form from anywhere: window.dispatchEvent(new Event(...)). */
export const CONTACT_MODAL_REQUEST_EVENT = "contact-modal:request";

/** Opens the contact modal. No-op on the server. */
export function openContactModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONTACT_MODAL_REQUEST_EVENT));
}
