import { NextRequest } from "next/server";
import type { Lead } from "@prisma/client";
import { leadService } from "@/services/leadService";

// Reads the session cookie for auth — must never be statically cached.
export const dynamic = "force-dynamic";
import { handleRouteError } from "@/lib/api-response";
import { LEAD_STATUSES, BUDGET_LABELS, STATUS_LABELS } from "@/types/lead";
import { z } from "zod";
import { requireRole } from "@/lib/auth/rbac";

const exportQuerySchema = z.object({
  search: z.string().trim().max(254).optional().default(""),
  status: z.enum([...LEAD_STATUSES, "ALL"]).optional().default("ALL"),
});

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);

    const params = exportQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries())
    );
    const leads = await leadService.exportCsv(params);

    const header = ["Name", "Email", "Budget", "Status", "Message", "Created At"];
    const rows = leads.map((lead: Lead) =>
      [
        lead.name,
        lead.email,
        BUDGET_LABELS[lead.budget as keyof typeof BUDGET_LABELS],
        STATUS_LABELS[lead.status as keyof typeof STATUS_LABELS],
        lead.message,
        lead.createdAt.toISOString(),
      ]
        .map((field) => escapeCsvField(String(field)))
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
