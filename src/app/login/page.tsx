import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const session = await getServerSession();
  if (session) {
    redirect(searchParams.from?.startsWith("/admin") ? searchParams.from : "/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm animate-fade-up">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in to LeadDesk</CardTitle>
          <CardDescription>Use your admin credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={searchParams.from} />
        </CardContent>
      </Card>
    </main>
  );
}
