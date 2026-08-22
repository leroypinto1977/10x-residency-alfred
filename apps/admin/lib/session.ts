import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { canEdit, findUserById, type AdminUser } from "@founder10x/db";
import { SESSION_COOKIE, sessionUserId } from "./auth";

/**
 * The signed-in user, or a redirect to the login page.
 *
 * The middleware only confirms a cookie exists; this is where the signature is
 * checked and the account looked up. Every page and every action calls it
 * before touching data — a Server Action is a public POST endpoint, and
 * rendering a form behind a login is not what stops someone calling it.
 *
 * The lookup also catches accounts deactivated mid-session: the token stays
 * validly signed for its twelve hours, but findUserById only returns active
 * rows, so the next request bounces them to the login page.
 */
export async function requireUser(): Promise<AdminUser> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const id = await sessionUserId(token);
  if (id === null) redirect("/login");
  const user = await findUserById(id);
  if (!user) redirect("/login");
  return user;
}

/** Same check without the redirect, for routes that answer in JSON. */
export async function currentUser(): Promise<AdminUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const id = await sessionUserId(token);
  if (id === null) return null;
  return findUserById(id);
}

/**
 * The signed-in user, refused if their account may not change anything.
 *
 * This is the read-only boundary. Disabling the controls in the sheet is a
 * courtesy to the person clicking; it stops nobody, because a Server Action is
 * a POST endpoint anyone holding a session can call directly. A viewer who
 * does gets this.
 */
export async function requireEditor(): Promise<AdminUser> {
  const user = await requireUser();
  if (!canEdit(user.role)) throw new Error("Your account has read-only access.");
  return user;
}

/** Owners administer accounts; everyone else is refused the team page. */
export async function requireOwner(): Promise<AdminUser> {
  const user = await requireUser();
  if (user.role !== "owner") throw new Error("Only an owner can manage accounts.");
  return user;
}
