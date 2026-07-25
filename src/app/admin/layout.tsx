import type { Metadata } from "next";
import { DashboardHeader } from "@/components/admin/DashboardHeader";

export const metadata: Metadata = { title: "Dashboard" };

// Route protection itself lives in src/middleware.ts (redirects unauthenticated
// visitors to /login before this layout ever renders); this file is just shell UI.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <main className="container flex flex-col gap-6 py-8">{children}</main>
    </div>
  );
}
