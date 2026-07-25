"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateLeadInput } from "@/features/leads/schema";
import type { Lead, CreateLeadResult } from "@/types/lead";

interface ApiErrorShape {
  success: false;
  error: { code: string; message: string };
}

async function createLeadRequest(input: CreateLeadInput): Promise<Lead & { duplicate: boolean }> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();

  if (!res.ok) {
    throw new Error((json as ApiErrorShape).error?.message ?? "Could not submit your request.");
  }

  return json.data as CreateLeadResult["lead"] & { duplicate: boolean };
}

/** Public lead-capture submission. No auth required. */
export function useCreateLead() {
  return useMutation({
    mutationFn: createLeadRequest,
  });
}
