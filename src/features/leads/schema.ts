import { z } from "zod";
import { BUDGET_RANGES, LEAD_STATUSES } from "@/types/lead";

/**
 * Single source of truth for lead-capture validation.
 * Used by the React Hook Form resolver on the client AND by the
 * POST /api/leads route on the server, so client and server can
 * never drift apart.
 */
export const createLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(120, "Name must be under 120 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(254, "Email must be under 254 characters.")
    .email("Enter a valid email address."),
  budget: z.enum(BUDGET_RANGES, {
    errorMap: () => ({ message: "Select a budget range." }),
  }),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(2000, "Message must be under 2000 characters."),
  // Honeypot field: real users never fill this in. Bots that auto-fill every
  // input will, so a non-empty value is a strong spam signal.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES, {
    errorMap: () => ({ message: "Status must be NEW, CONTACTED, or CLOSED." }),
  }),
});

export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;

export const leadQuerySchema = z.object({
  search: z.string().trim().max(254).optional().default(""),
  status: z.enum([...LEAD_STATUSES, "ALL"]).optional().default("ALL"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});
