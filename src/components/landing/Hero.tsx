import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="container flex flex-col items-center gap-6 py-20 text-center">
      <span className="animate-fade-up rounded-full border border-border bg-card px-4 py-1 text-xs font-medium text-muted-foreground shadow-soft">
        Built for small teams that hate spreadsheets
      </span>
      <h1 className="animate-fade-up max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Capture every lead. Never lose track of a follow-up again.
      </h1>
      <p className="animate-fade-up max-w-xl text-muted-foreground sm:text-lg">
        LeadDesk Mini gives you a public intake form and a lightweight admin dashboard to triage,
        track, and close incoming leads — no spreadsheet required.
      </p>
      <div className="animate-fade-up flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <a href="#lead-form">Get in touch</a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="#how-it-works">See how it works</a>
        </Button>
      </div>
    </section>
  );
}
