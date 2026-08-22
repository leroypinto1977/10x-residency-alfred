/**
 * Password hashing for the team accounts.
 *
 * PBKDF2 over Web Crypto rather than bcrypt or argon2: those are native
 * modules, and this file is imported by the login route, which has to keep
 * running wherever the rest of `lib/auth.ts` does. PBKDF2-SHA256 at this
 * iteration count is what OWASP still lists as acceptable, and it needs
 * nothing that is not already in the runtime.
 *
 * Stored as `pbkdf2$<iterations>$<salt>$<hash>`, so the iteration count
 * travels with the hash and can be raised later without stranding the
 * passwords already in the table.
 */

const ITERATIONS = 210_000;
const KEY_BITS = 256;

function b64(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromB64(s: string) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(hash)}`;
}

/**
 * Constant-time over the derived bytes. Comparing the encoded strings would
 * leak how many leading characters matched, which is the whole point of
 * hashing them in the first place.
 */
export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 1) return false;

  let salt: Uint8Array;
  let expected: Uint8Array;
  try {
    salt = fromB64(parts[2]);
    expected = fromB64(parts[3]);
  } catch {
    return false;
  }

  const actual = await derive(password, salt, iterations);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

/**
 * What a new account is handed. Ambiguous characters are left out — these get
 * read off a screen and typed by someone else, and `l` against `1` is a
 * support message waiting to happen.
 */
export function generatePassword(length = 16) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  // rejection-free because the alphabet divides evenly enough that the bias is
  // under a thousandth of a bit; for a 16-character password that is nothing
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}
