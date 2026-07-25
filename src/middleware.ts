import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { buildCorsHeaders } from "@/lib/cors";

/**
 * Runs at the edge, before any page or route handler. Two jobs:
 *
 * 1. Page protection — /admin/* requires a valid session; unauthenticated
 *    visitors are redirected to /login instead of ever rendering the
 *    dashboard shell.
 * 2. Defense-in-depth for the API — the route handlers themselves already
 *    call requireRole()/requireAuth() (see src/lib/auth/rbac.ts), which is
 *    the source of truth for 401/403 responses. This middleware adds a
 *    second, independent check in front of them so a bug in one layer
 *    doesn't become a full bypass, and attaches CORS headers uniformly.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  // CORS preflight — answer directly, never reaches a route handler.
  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return new NextResponse(null, { status: 204, headers: buildCorsHeaders(origin) });
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const isProtectedLeadsRead = pathname === "/api/leads" && req.method === "GET";
  const isProtectedLeadsWrite = /^\/api\/leads\/[^/]+\/status$/.test(pathname) && req.method === "PATCH";
  const isProtectedExport = pathname === "/api/leads/export";

  if (isProtectedLeadsRead || isProtectedLeadsWrite || isProtectedExport) {
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHENTICATED", message: "You must be signed in to perform this action." } },
        { status: 401, headers: buildCorsHeaders(origin) }
      );
    }
    if (isProtectedExport && session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to perform this action." } },
        { status: 403, headers: buildCorsHeaders(origin) }
      );
    }
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/api/")) {
    buildCorsHeaders(origin).forEach((value, key) => res.headers.set(key, value));
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
