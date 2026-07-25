import { NextRequest } from "next/server";
import { createLeadSchema, leadQuerySchema } from "@/features/leads/schema";
import { leadService } from "@/services/leadService";
import { created, ok, fail, handleRouteError } from "@/lib/api-response";
import { isRateLimited } from "@/lib/rate-limit";
import { requireRole } from "@/lib/auth/rbac";

// GET reads the session cookie for auth — must never be statically cached.
export const dynamic = "force-dynamic";

const SUBMIT_LIMIT = Number(process.env.LEAD_SUBMIT_RATE_LIMIT ?? 10);

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`lead:${ip}`, SUBMIT_LIMIT)) {
      return fail(429, "RATE_LIMITED", "Too many submissions. Please try again in a minute.");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return fail(400, "MALFORMED_REQUEST", "Request body must be valid JSON.");
    }

    const input = createLeadSchema.parse(body);

    // Honeypot tripped: pretend success so bots don't learn to adapt, but
    // never touch the database.
    if (input.company) {
      return created({
        id: "noop",
        name: input.name,
        email: input.email,
        budget: input.budget,
        message: input.message,
        status: "NEW",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const { lead, duplicate } = await leadService.create(input);
    return created({ ...lead, duplicate });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    // Dashboard data — every lead's name, email, and message — is only for
    // signed-in staff/admins. Throws 401/403 via the shared error handler.
    await requireRole(req, ["ADMIN", "STAFF"]);

    const params = leadQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries())
    );
    const result = await leadService.list(params);
    return ok(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
