"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function LogoutButton() {
  const logout = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      loading={logout.isPending}
      onClick={() => logout.mutate()}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Sign out
    </Button>
  );
}
