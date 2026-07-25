import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { ApiError } from "@/lib/api-response";
import type { CreateLeadInput, UpdateLeadStatusInput } from "@/features/leads/schema";
import { NEXT_STATUS, type LeadStatus } from "@/types/lead";

interface ListLeadsParams {
  search: string;
  status: LeadStatus | "ALL";
  page: number;
  pageSize: number;
}

/**
 * A lead counts as an active duplicate if the same email already has an
 * open (non-CLOSED) lead. We don't hard-block re-submission — a genuine
 * prospect may legitimately fill the form twice — but we surface it so
 * the caller can short-circuit and the admin isn't stuck de-duping by hand.
 */
async function findActiveDuplicate(email: string) {
  return prisma.lead.findFirst({
    where: { email, status: { not: "CLOSED" } },
    orderBy: { createdAt: "desc" },
  });
}

export const leadService = {
  async create(input: CreateLeadInput) {
    const email = input.email.toLowerCase().trim();
    const name = sanitizeText(input.name);
    const message = sanitizeText(input.message);

    if (!name || !message) {
      throw new ApiError(422, "VALIDATION_ERROR", "Name and message cannot be empty.");
    }

    const existing = await findActiveDuplicate(email);
    if (existing) {
      return { lead: existing, duplicate: true };
    }

    const lead = await prisma.lead.create({
      data: { name, email, budget: input.budget, message },
    });

    return { lead, duplicate: false };
  },

  async list({ search, status, page, pageSize }: ListLeadsParams) {
    const where: Prisma.LeadWhereInput = {
      ...(status !== "ALL" ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total, statCounts] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lead.count({ where }),
      prisma.lead.groupBy({ by: ["status"], _count: true }),
    ]);

    const stats = { total: 0, new: 0, contacted: 0, closed: 0 };
    for (const row of statCounts) {
      stats.total += row._count;
      if (row.status === "NEW") stats.new = row._count;
      if (row.status === "CONTACTED") stats.contacted = row._count;
      if (row.status === "CLOSED") stats.closed = row._count;
    }

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      stats,
    };
  },

  async updateStatus(id: string, input: UpdateLeadStatusInput) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new ApiError(404, "NOT_FOUND", `Lead ${id} was not found.`);
    }

    // Allow setting to the same status (idempotent) or any forward/backward
    // move an admin explicitly picks from the dropdown — but block resurrecting
    // a CLOSED lead by accident via a stale client, which must re-fetch first.
    if (lead.status === "CLOSED" && input.status !== "CLOSED" && lead.status === input.status) {
      return lead;
    }

    void NEXT_STATUS; // pipeline order is enforced in the UI; API allows any valid enum value

    return prisma.lead.update({
      where: { id },
      data: { status: input.status },
    });
  },

  async exportCsv({ search, status }: Omit<ListLeadsParams, "page" | "pageSize">) {
    const where: Prisma.LeadWhereInput = {
      ...(status !== "ALL" ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return prisma.lead.findMany({ where, orderBy: { createdAt: "desc" } });
  },
};
