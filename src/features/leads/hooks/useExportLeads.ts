"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import type { LeadStatus } from "@/types/lead";

interface ExportFilters {
  search: string;
  status: LeadStatus | "ALL";
}

/**
 * Downloads the filtered CSV export. ADMIN-only server-side; the button
 * that triggers this is also hidden from STAFF users in the UI.
 */
async function exportLeadsRequest(filters: ExportFilters): Promise<void> {
  const params = new URLSearchParams({ search: filters.search, status: filters.status });
  const res = await fetch(`/api/leads/export?${params.toString()}`);

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error?.message ?? "Export failed. Please try again.");
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const filename = disposition?.match(/filename="([^"]+)"/)?.[1] ?? "leads.csv";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useExportLeads() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: exportLeadsRequest,
    onError: (error: Error) => {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    },
  });
}
