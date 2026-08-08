/**
 * Single source for the desk's contact details.
 *
 * Everything that renders a phone number, a WhatsApp link or an email address
 * reads from here, so replacing the placeholder below is a one-file change
 * rather than a hunt through components.
 *
 * REPLACE BEFORE LAUNCH — `WHATSAPP_NUMBER` is a placeholder. wa.me fails
 * silently on a number that does not exist, so the button will look like it
 * works and go nowhere.
 */
export const WHATSAPP_NUMBER = "971500000000";

export const CONTACT_EMAIL = "hello@beyondpips.com";

/** Matches the location claimed in the site's own copy. */
export const CONTACT_LOCATION = "Dubai, United Arab Emirates";

export const WHATSAPP_MESSAGE =
  "Hi Beyondpips — I'd like to know more about the trading programme.";

export function whatsappHref(message: string = WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
