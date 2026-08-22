import { NextResponse } from "next/server";
import {
  clearLoginFailures,
  findUserByUsername,
  loginLockRemaining,
  markLogin,
  recordLoginFailure,
} from "@founder10x/db";
import { verifyPassword } from "@founder10x/db/password";
import { createSession, cookieOptions, SESSION_COOKIE } from "@/lib/auth";

/**
 * The client's address, for throttling.
 *
 * x-forwarded-for is a client-settable header everywhere except behind a proxy
 * that overwrites it, which Vercel does — it appends the real peer and is the
 * value to trust here. Taking the first entry is correct for that shape; on a
 * host that merely forwards the header it would be spoofable, and the throttle
 * would be too, which is why the panel does not rely on it alone.
 */
function clientIp(request: Request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  let username = "";
  let password = "";
  try {
    const body = await request.json();
    username = String(body.username ?? "");
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, message: "Bad request." }, { status: 400 });
  }

  const ip = clientIp(request);

  const locked = await loginLockRemaining(ip);
  if (locked > 0) {
    const mins = Math.ceil(locked / 60);
    return NextResponse.json(
      { ok: false, message: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` },
      { status: 429, headers: { "Retry-After": String(locked) } }
    );
  }

  const user = username ? await findUserByUsername(username) : null;

  // The password is verified even when there is no such account, so a wrong
  // username and a wrong password take the same time to answer. Skipping the
  // hash for an unknown user is a timing oracle for which usernames exist.
  const stored =
    user?.passwordHash ??
    "pbkdf2$210000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  const ok = await verifyPassword(password, stored);

  if (!user || !user.active || !ok) {
    await recordLoginFailure(ip);
    // One message for every failure: naming which half was wrong tells an
    // attacker they have found a real account.
    return NextResponse.json(
      { ok: false, message: "Wrong username or password." },
      { status: 401 }
    );
  }

  await clearLoginFailures(ip);
  await markLogin(user.id);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSession(user.id), cookieOptions());
  return response;
}
