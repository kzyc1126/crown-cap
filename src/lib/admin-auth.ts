/**
 * Admin session token. The cookie holds an HMAC of a fixed payload keyed by the
 * admin password, so it cannot be forged without the password and it is
 * invalidated automatically when the password changes. Uses Web Crypto only, so
 * the same helper runs in the Edge proxy and in Node server actions.
 */
export const ADMIN_COOKIE = "cc_admin";

const encoder = new TextEncoder();
const PAYLOAD = "cc-admin-session-v1";

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The session token for the configured password, or null when unconfigured. */
export async function adminToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(PAYLOAD));
  return base64url(new Uint8Array(signature));
}
