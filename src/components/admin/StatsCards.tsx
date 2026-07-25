import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: { total: number; new: number; contacted: number; closed: number };
  loading?: boolean;
}

const CARDS = [
  { key: "total", label: "Total leads", accent: "text-foreground" },
  { key: "new", label: "New", accent: "text-accent-foreground" },
  { key: "contacted", label: "Contacted", accent: "text-primary" },
  { key: "closed", label: "Closed", accent: "text-success" },
] as const;

export function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {CARDS.map((card) => (
        <Card key={card.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("font-display text-3xl font-semibold", card.accent)}>
              {loading ? "–" : stats[card.key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
