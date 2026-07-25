export const BUDGET_RANGES = [
  "UNDER_1K",
  "ONE_TO_5K",
  "FIVE_TO_20K",
  "TWENTY_TO_50K",
  "OVER_50K",
] as const;

export type BudgetRange = (typeof BUDGET_RANGES)[number];

export const BUDGET_LABELS: Record<BudgetRange, string> = {
  UNDER_1K: "Under $1,000",
  ONE_TO_5K: "$1,000 – $5,000",
  FIVE_TO_20K: "$5,000 – $20,000",
  TWENTY_TO_50K: "$20,000 – $50,000",
  OVER_50K: "$50,000+",
};

export const LEAD_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

/** Valid forward transitions for the status pipeline (NEW -> CONTACTED -> CLOSED). */
export const NEXT_STATUS: Record<LeadStatus, LeadStatus | null> = {
  NEW: "CONTACTED",
  CONTACTED: "CLOSED",
  CLOSED: null,
};

export interface Lead {
  id: string;
  name: string;
  email: string;
  budget: BudgetRange;
  message: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListResponse {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  stats: {
    total: number;
    new: number;
    contacted: number;
    closed: number;
  };
}

export interface CreateLeadResult {
  lead: Lead;
  duplicate: boolean;
}
