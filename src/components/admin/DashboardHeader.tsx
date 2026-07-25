"use client";

import Link from "next/link";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  const { data: user } = useCurrentUser();

  return (
    <header className="border-b border-border bg-card">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/admin" className="font-display text-lg font-semibold">
          LeadDesk <span className="text-primary">Mini</span>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
