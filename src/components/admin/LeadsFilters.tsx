"use client";

import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/types/lead";

interface LeadsFiltersProps {
  search: string;
  status: LeadStatus | "ALL";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: LeadStatus | "ALL") => void;
}

export function LeadsFilters({ search, status, onSearchChange, onStatusChange }: LeadsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedChange = useDebouncedCallback(onSearchChange, 300);

  // Stay in sync if the parent resets search (e.g. after clearing filters).
  useEffect(() => setLocalSearch(search), [search]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={localSearch}
          onChange={(event) => {
            setLocalSearch(event.target.value);
            debouncedChange(event.target.value);
          }}
          placeholder="Search by name or email…"
          className="pl-9"
          aria-label="Search leads"
        />
      </div>
      <Select value={status} onValueChange={(value) => onStatusChange(value as LeadStatus | "ALL")}>
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
