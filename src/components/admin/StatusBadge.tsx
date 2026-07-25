import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type LeadStatus } from "@/types/lead";

const VARIANT_BY_STATUS: Record<LeadStatus, "accent" | "default" | "success"> = {
  NEW: "accent",
  CONTACTED: "default",
  CLOSED: "success",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={VARIANT_BY_STATUS[status]}>{STATUS_LABELS[status]}</Badge>;
}
