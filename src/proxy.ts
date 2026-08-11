import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Gate on /admin.
 *
 * Named `proxy.ts`, not `middleware.ts`: the middleware file convention is
 * deprecated in Next 16 and renamed to proxy, with the same behaviour.
 *
 * This is the outer gate, not the only one. It runs before rendering and keeps
 * signed-out visitors off the admin UI, but the mutating server actions verify
 * the session themselves as well — a proxy matcher is a routing rule, and an
 * action invoked directly would otherwise never pass through it.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  // Already signed in and heading for the login form: send them onward rather
  // than showing a form they do not need.
  if (pathname === "/admin/login") {
    if (signedIn) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!signedIn) {
    const login = new URL("/admin/login", request.url);
    // Remember where they were going, so login can return them there.
    if (pathname !== "/admin") login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
