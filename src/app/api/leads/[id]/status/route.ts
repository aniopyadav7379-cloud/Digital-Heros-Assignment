import { NextRequest } from "next/server";
import { updateLeadStatusSchema } from "@/features/leads/schema";
import { leadService } from "@/services/leadService";
import { ok, fail, handleRouteError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/rbac";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, ["ADMIN", "STAFF"]);

    if (!params.id || typeof params.id !== "string") {
      return fail(400, "MALFORMED_REQUEST", "A valid lead id is required.");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return fail(400, "MALFORMED_REQUEST", "Request body must be valid JSON.");
    }

    const input = updateLeadStatusSchema.parse(body);
    const lead = await leadService.updateStatus(params.id, input);
    return ok(lead);
  } catch (error) {
    return handleRouteError(error);
  }
}
