/**
 * Admin session tokens.
 *
 * Deliberately built on Web Crypto rather than `node:crypto`: this module is
 * imported by `middleware.ts`, which runs on the Edge runtime where the Node
 * crypto module does not exist. Web Crypto is available in both runtimes, so one
 * implementation covers the middleware and the server actions.
 *
 * The token is a signed statement, not an encrypted one — it carries only an
 * issue time and an expiry, and its integrity comes from the HMAC. Nothing
 * secret is inside it, so there is nothing to leak if a cookie is read; forging
 * one requires AUTH_SECRET.
 */
export const SESSION_COOKIE = "beyondpips_admin";

/** Eight hours: long enough for a working session, short enough to matter. */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

type SessionPayload = { iat: number; exp: number };

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * There is no development fallback secret on purpose. A hardcoded default would
 * mean every checkout signs tokens the same way, so anyone who read the source
 * could mint a valid admin cookie for a deployment whose env was incomplete.
 * Failing loudly is the safer outcome.
 */
function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short (needs 16+ characters). Admin sign-in is disabled until it is set.",
    );
  }
  return secret;
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(now = Date.now()) {
  const payload: SessionPayload = {
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getKey(),
    new TextEncoder().encode(body),
  );

  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** True only for a token this server signed that has not expired. */
export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;

  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  try {
    // `crypto.subtle.verify` compares the MAC itself, so there is no
    // hand-rolled string equality here to leak timing.
    const valid = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromBase64Url(signature),
      new TextEncoder().encode(body),
    );
    if (!valid) return false;

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(body)),
    ) as SessionPayload;

    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    // Malformed base64, malformed JSON, or a missing secret all mean "not
    // signed in" rather than a crash on a public route.
    return false;
  }
}

/** Shared cookie attributes, so login and logout can never disagree. */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    // Secure in production only, or the cookie is dropped over plain http on
    // localhost and sign-in appears to silently fail in development.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
