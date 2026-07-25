import { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { ApiError } from "@/lib/api-response";
import type { Role, SessionPayload } from "@/types/auth";

/**
 * Reads and verifies the session cookie directly off the request (rather
 * than next/headers) so this works identically in every route handler
 * regardless of caching context.
 */
export async function getRequestSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Throws 401 if there is no valid session; otherwise returns it. */
export async function requireAuth(req: NextRequest): Promise<SessionPayload> {
  const session = await getRequestSession(req);
  if (!session) {
    throw new ApiError(401, "UNAUTHENTICATED", "You must be signed in to perform this action.");
  }
  return session;
}

/** Throws 401 if unauthenticated, 403 if authenticated but lacking the required role. */
export async function requireRole(req: NextRequest, allowed: Role[]): Promise<SessionPayload> {
  const session = await requireAuth(req);
  if (!allowed.includes(session.role)) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action.");
  }
  return session;
}
