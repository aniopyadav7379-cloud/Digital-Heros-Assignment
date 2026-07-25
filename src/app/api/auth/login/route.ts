import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/schema";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { attachSessionCookie } from "@/lib/auth/session";
import { ok, fail, handleRouteError } from "@/lib/api-response";
import { isRateLimited } from "@/lib/rate-limit";

const LOGIN_LIMIT = Number(process.env.LOGIN_RATE_LIMIT ?? 5);

// A precomputed bcrypt hash of a random, never-used string. Comparing
// against this when the account doesn't exist keeps login latency
// constant, so response timing can't be used to enumerate valid emails.
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEeOFH2vgYh1F5D2TzL5Q1I9K5F2Z9E9m9K";

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`login:${ip}`, LOGIN_LIMIT)) {
      return fail(429, "RATE_LIMITED", "Too many login attempts. Please try again in a minute.");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return fail(400, "MALFORMED_REQUEST", "Request body must be valid JSON.");
    }

    const { email, password } = loginSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const passwordValid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !passwordValid) {
      return fail(401, "INVALID_CREDENTIALS", "Incorrect email or password.");
    }

    const res = ok({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }) as NextResponse;

    await attachSessionCookie(res, {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res;
  } catch (error) {
    return handleRouteError(error);
  }
}
