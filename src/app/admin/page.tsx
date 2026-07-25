"use client";

import { useState } from "react";
import { useLeads } from "@/features/leads/hooks/useLeads";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { StatsCards } from "@/components/admin/StatsCards";
import { LeadsFilters } from "@/components/admin/LeadsFilters";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { Pagination } from "@/components/admin/Pagination";
import { ExportButton } from "@/components/admin/ExportButton";
import type { LeadStatus } from "@/types/lead";

const PAGE_SIZE = 10;

export default function AdminDashboardPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data: user } = useCurrentUser();
  const { data, isLoading } = useLeads({ search, status, page, pageSize: PAGE_SIZE });

  const stats = data?.stats ?? { total: 0, new: 0, contacted: 0, closed: 0 };
  const leads = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Track and follow up on everyone who&apos;s reached out.
        </p>
      </div>

      <StatsCards stats={stats} loading={isLoading} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LeadsFilters
          search={search}
          status={status}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        {/* Export is ADMIN-only server-side (GET /api/leads/export); hide it
            from STAFF up front rather than showing a button that will 403. */}
        {user?.role === "ADMIN" && <ExportButton search={search} status={status} />}
      </div>

      <LeadsTable leads={leads} loading={isLoading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
