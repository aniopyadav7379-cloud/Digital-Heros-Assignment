"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { LoginInput } from "@/features/auth/schema";
import { useToast } from "@/components/ui/use-toast";
import type { AuthUser } from "@/types/auth";

interface ApiError {
  success: false;
  error: { code: string; message: string };
}

async function loginRequest(input: LoginInput): Promise<AuthUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as ApiError).error?.message ?? "Login failed.");
  }
  return json.data as AuthUser;
}

export function useLogin(redirectTo = "/admin") {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (user) => {
      toast({ title: `Welcome back, ${user.name.split(" ")[0]}`, variant: "success" });
      router.push(redirectTo);
      router.refresh();
    },
    onError: (error: Error) => {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    },
  });
}
