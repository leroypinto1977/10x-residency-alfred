/**
 * Session handling for the admin panel.
 *
 * A username and password are exchanged for a signed, httpOnly cookie. The
 * cookie carries only a user id and an expiry, plus an HMAC over both — there
 * is nothing in it worth stealing and nothing a client can usefully edit,
 * since any change breaks the signature.
 *
 * This replaces the shared secret the old panel passed in the query string.
 * A key in a URL is written to every server log, sent in the Referer header
 * of anything the page links to, and sits in browser history; a cookie with
 * httpOnly and SameSite is none of those things.
 *
 * Web Crypto rather than node:crypto, so the same helpers run unchanged in
 * middleware, which may execute outside the Node runtime.
 */

export const SESSION_COOKIE = "founder10x_admin";
const SESSION_HOURS = 12;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(mac);
}

/** `<userId>.<expiryMs>.<hmac>` */
export async function createSession(userId: number) {
  const expires = Date.now() + SESSION_HOURS * 3600_000;
  const payload = `${userId}.${expires}`;
  return `${payload}.${await sign(payload)}`;
}

/**
 * The user id a token vouches for, or null.
 *
 * Constant-time comparison of the signature: an early return on the first
 * differing character leaks how much of a forged MAC was right, which is the
 * one thing that makes forging feasible.
 */
export async function sessionUserId(token: string | undefined): Promise<number | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [idRaw, expRaw, mac] = parts;

  const expected = await sign(`${idRaw}.${expRaw}`);
  if (expected.length !== mac.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ mac.charCodeAt(i);
  if (diff !== 0) return null;

  const expires = Number(expRaw);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;

  const id = Number(idRaw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  };
}
