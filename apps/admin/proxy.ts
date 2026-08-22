import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

/**
 * Optimistic gate only — it checks that a session cookie is *present*, not
 * that it is valid. The Next docs are explicit that Proxy is not an
 * authorization boundary, so every protected page verifies the signature
 * itself; this just saves an unauthenticated visitor a page render.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.get(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // everything except the login page, the login endpoint and static assets
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico).*)"],
};
