"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/types/lead";
import { useUpdateLeadStatus } from "@/features/leads/hooks/useUpdateLeadStatus";

interface StatusSelectProps {
  leadId: string;
  status: LeadStatus;
}

/** Inline status changer used in each row of the leads table. */
export function StatusSelect({ leadId, status }: StatusSelectProps) {
  const updateStatus = useUpdateLeadStatus();

  return (
    <Select
      value={status}
      disabled={updateStatus.isPending}
      onValueChange={(value) => {
        if (value !== status) {
          updateStatus.mutate({ id: leadId, status: value as LeadStatus });
        }
      }}
    >
      <SelectTrigger className="h-9 w-[150px] text-xs" aria-label="Change lead status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
