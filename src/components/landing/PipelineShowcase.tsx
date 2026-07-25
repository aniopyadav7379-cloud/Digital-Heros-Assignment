import { Card, CardContent } from "@/components/ui/card";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/types/lead";

const STAGE_COPY: Record<LeadStatus, string> = {
  NEW: "Every submission lands here the moment it's sent.",
  CONTACTED: "Mark a lead once your team has reached out.",
  CLOSED: "Wrap up the conversation — won or lost.",
};

export function PipelineShowcase() {
  return (
    <section id="how-it-works" className="border-y border-border/60 bg-card/50 py-20">
      <div className="container flex flex-col gap-10">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold">A simple three-stage pipeline</h2>
          <p className="mt-2 text-muted-foreground">
            Every lead moves through the same clear stages, so nothing falls through the cracks.
          </p>
        </div>
        <div className="relative grid gap-6 sm:grid-cols-3">
          {LEAD_STATUSES.map((status, index) => (
            <Card key={status} className="relative overflow-hidden">
              <CardContent className="flex flex-col gap-2 p-6">
                <span className="font-display text-sm font-semibold text-primary">0{index + 1}</span>
                <h3 className="font-display text-lg font-semibold">{STATUS_LABELS[status]}</h3>
                <p className="text-sm text-muted-foreground">{STAGE_COPY[status]}</p>
              </CardContent>
              {index < LEAD_STATUSES.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1.5 top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-primary/60 animate-pipeline-flow sm:block"
                />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
