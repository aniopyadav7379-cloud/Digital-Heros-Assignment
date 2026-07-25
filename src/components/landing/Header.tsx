import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold">
          LeadDesk <span className="text-primary">Mini</span>
        </Link>
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </header>
  );
}
