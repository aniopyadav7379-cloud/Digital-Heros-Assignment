"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportLeads } from "@/features/leads/hooks/useExportLeads";
import type { LeadStatus } from "@/types/lead";

interface ExportButtonProps {
  search: string;
  status: LeadStatus | "ALL";
}

/** Renders only where the caller already knows the user is ADMIN. */
export function ExportButton({ search, status }: ExportButtonProps) {
  const exportLeads = useExportLeads();

  return (
    <Button
      variant="outline"
      size="sm"
      loading={exportLeads.isPending}
      onClick={() => exportLeads.mutate({ search, status })}
      className="gap-2"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Export CSV
    </Button>
  );
}
