import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { BUDGET_LABELS, type Lead } from "@/types/lead";
import { formatDate, truncate } from "@/lib/utils";

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
}

export function LeadsTable({ leads, loading }: LeadsTableProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (leads.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">
        No leads match these filters yet.
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Budget</th>
            <th className="px-4 py-3 font-medium">Message</th>
            <th className="px-4 py-3 font-medium">Received</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{lead.email}</td>
              <td className="px-4 py-3 text-muted-foreground">{BUDGET_LABELS[lead.budget]}</td>
              <td className="px-4 py-3 text-muted-foreground" title={lead.message}>
                {truncate(lead.message, 48)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-4 py-3">
                <StatusSelect leadId={lead.id} status={lead.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
