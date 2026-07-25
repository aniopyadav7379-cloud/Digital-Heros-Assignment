"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

async function logoutRequest(): Promise<void> {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) throw new Error("Could not sign out. Please try again.");
}

export function useLogout() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
    onError: (error: Error) => {
      toast({ title: "Sign out failed", description: error.message, variant: "destructive" });
    },
  });
}
