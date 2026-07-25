"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { LeadListResponse, LeadStatus } from "@/types/lead";

export interface LeadsFilters {
  search: string;
  status: LeadStatus | "ALL";
  page: number;
  pageSize: number;
}

interface ApiErrorShape {
  success: false;
  error: { code: string; message: string };
}

async function fetchLeads(filters: LeadsFilters): Promise<LeadListResponse> {
  const params = new URLSearchParams({
    search: filters.search,
    status: filters.status,
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  });

  const res = await fetch(`/api/leads?${params.toString()}`);
  const json = await res.json();

  if (!res.ok) {
    throw new Error((json as ApiErrorShape).error?.message ?? "Failed to load leads.");
  }

  return json.data as LeadListResponse;
}

/**
 * Lists leads for the admin dashboard. Keeps the previous page's data
 * visible while a new page/filter combination is fetching, so the table
 * doesn't flash empty on every filter change.
 */
export function useLeads(filters: LeadsFilters) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () => fetchLeads(filters),
    placeholderData: keepPreviousData,
  });
}
