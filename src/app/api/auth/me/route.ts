import { NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth/rbac";
import { ok, fail } from "@/lib/api-response";

// Reads the session cookie on every request — must never be statically cached.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session) {
    return fail(401, "UNAUTHENTICATED", "No active session.");
  }
  return ok({ id: session.sub, name: session.name, email: session.email, role: session.role });
}
