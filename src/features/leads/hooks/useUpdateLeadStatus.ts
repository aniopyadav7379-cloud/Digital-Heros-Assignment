"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import type { Lead, LeadStatus } from "@/types/lead";

interface UpdateStatusInput {
  id: string;
  status: LeadStatus;
}

interface ApiErrorShape {
  success: false;
  error: { code: string; message: string };
}

async function updateStatusRequest({ id, status }: UpdateStatusInput): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();

  if (!res.ok) {
    throw new Error((json as ApiErrorShape).error?.message ?? "Could not update lead status.");
  }

  return json.data as Lead;
}

/** Updates a lead's status from the dashboard and refreshes the leads list. */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateStatusRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Status updated", variant: "success" });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });
}
