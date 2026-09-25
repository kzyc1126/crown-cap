import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Temporary gate for the admin area: HTTP Basic Auth against ADMIN_USER /
 * ADMIN_PASSWORD. It runs before every /admin request — pages and the POST
 * server actions they submit to alike — so the whole catalogue manager is
 * behind one login. Meant as a stopgap until "Sign in with Apple / Google"
 * replaces it.
 *
 * Fails closed in production: if the credentials are not configured, admin is
 * blocked rather than left open. In development it lets requests through so the
 * admin is usable without setting anything.
 */
export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse(
      "Admin login is not configured. Set ADMIN_USER and ADMIN_PASSWORD.",
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    const givenUser = decoded.slice(0, separator);
    const givenPass = decoded.slice(separator + 1);
    // Length-independent-ish compare; for one personal admin this is enough.
    if (givenUser === user && givenPass === pass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Crown Caps admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
