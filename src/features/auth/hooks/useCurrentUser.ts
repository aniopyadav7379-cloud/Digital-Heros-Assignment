"use client";

import { useQuery } from "@tanstack/react-query";
import type { AuthUser } from "@/types/auth";

async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load session.");
  const json = await res.json();
  return json.data as AuthUser;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
  });
}
