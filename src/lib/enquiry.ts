"use server";

/**
 * Sends a contact enquiry to the Google Sheet via its Apps Script web app.
 *
 * Server-side, not a `fetch` from the browser, for three reasons:
 *  - No CORS. An Apps Script `/exec` endpoint answers a cross-origin POST with a
 *    redirect to googleusercontent.com and no `Access-Control-Allow-Origin`, so
 *    the browser route only works as a blind `mode: "no-cors"` call — which can
 *    never tell whether the row was actually written.
 *  - The endpoint URL stays out of the client bundle.
 *  - The real outcome reaches the visitor. The form must not claim success when
 *    the write failed.
 *
 * The Apps Script replies with the plain text "Added.." or "Failed.." and a 200
 * either way, so the status code alone cannot be trusted — the body is what
 * distinguishes them.
 */

export type EnquiryResult = { ok: true } | { ok: false; error: string };

/** Apps Script is occasionally slow to wake; 15s, then give up cleanly. */
const TIMEOUT_MS = 15_000;

export async function sendEnquiry(formData: FormData): Promise<EnquiryResult> {
  const endpoint = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!endpoint) {
    return {
      ok: false,
      error:
        "The enquiry form is not connected yet. Set GOOGLE_SHEET_WEBHOOK_URL and restart the server.",
    };
  }

  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const name = text("name");
  const email = text("email");
  const phone = text("phone");

  // Re-validated here rather than trusting the browser: `required` and
  // `type="email"` are a convenience for the person filling it in, not a
  // guarantee about what arrives.
  if (!name) return { ok: false, error: "Please add your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That email address does not look right." };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      // The script does JSON.parse(e.postData.contents), so the body has to be
      // JSON, and the keys have to match the columns it appends.
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: name, Email: email, PhoneNumber: phone }),
      // Apps Script answers /exec with a 302 to googleusercontent.com; the
      // response body only appears if that is followed.
      redirect: "follow",
      // Never cache a write.
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const body = (await response.text()).trim();

    if (!response.ok) {
      // Deliberately not surfaced to the visitor — the status and the script's
      // own reply are for whoever reads the server logs.
      console.error(
        `[enquiry] Apps Script returned ${response.status}: ${body.slice(0, 200)}`,
      );
      return { ok: false, error: FAILURE_MESSAGE };
    }

    // "Added.." on success, "Failed.." when the script's own try/catch fired —
    // both arrive with a 200.
    if (!/^added/i.test(body)) {
      console.error(`[enquiry] Apps Script did not confirm: ${body.slice(0, 200)}`);
      return { ok: false, error: FAILURE_MESSAGE };
    }

    return { ok: true };
  } catch (cause) {
    console.error("[enquiry] could not reach the Apps Script endpoint:", cause);
    return { ok: false, error: FAILURE_MESSAGE };
  }
}

/**
 * One message for every failure mode, and it offers a way through.
 *
 * A visitor cannot act on "the upstream returned 500", and telling them the
 * enquiry vanished with no alternative is worse than useless — the email
 * address is the fallback that still works.
 */
const FAILURE_MESSAGE =
  "Something went wrong sending that. Please try again, or email hello@beyondpips.com directly.";
