import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, adminToken } from "@/lib/admin-auth";

/**
 * Guards the admin area with a session cookie set by the /login page. Every
 * /admin request — pages and the POST server actions they submit to — must
 * carry a valid cookie, or it is redirected to /login. Meant as a stopgap until
 * "Sign in with Apple / Google" replaces it.
 *
 * Fails closed in production: if the credentials are not configured, admin is
 * blocked rather than left open. In development it lets requests through so the
 * admin is usable without setting anything.
 */
export async function proxy(request: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse(
      "Admin login is not configured. Set ADMIN_USER and ADMIN_PASSWORD.",
      { status: 503 },
    );
  }

  const expected = await adminToken();
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  if (expected && cookie === expected) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/admin/:path*",
};
