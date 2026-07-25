import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { signSessionToken, verifySessionToken } from "@/lib/auth/jwt";
import type { SessionPayload } from "@/types/auth";

export const SESSION_COOKIE = "leaddesk_session";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8, // 8 hours, kept in sync with JWT_EXPIRES_IN default
};

/** Signs a session token and attaches it as an httpOnly cookie on the response. */
export async function attachSessionCookie(res: NextResponse, payload: SessionPayload) {
  const token = await signSessionToken(payload);
  res.cookies.set(SESSION_COOKIE, token, cookieOptions);
  return res;
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}

/** Reads and verifies the session from the incoming request's cookies (Server Components, Route Handlers). */
export async function getServerSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
