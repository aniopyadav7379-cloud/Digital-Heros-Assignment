"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeadSchema, type CreateLeadInput } from "@/features/leads/schema";
import { useCreateLead } from "@/features/leads/hooks/useCreateLead";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BUDGET_RANGES, BUDGET_LABELS } from "@/types/lead";

export function LeadForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadInput>({ resolver: zodResolver(createLeadSchema) });

  const createLead = useCreateLead();
  const { toast } = useToast();
  const budget = watch("budget");

  const onSubmit = async (values: CreateLeadInput) => {
    try {
      const result = await createLead.mutateAsync(values);
      toast({
        title: result.duplicate ? "We already have your message" : "Thanks — we got it!",
        description: result.duplicate
          ? "We found an open request from this email and will follow up on that one."
          : "Someone from our team will reach out shortly.",
        variant: "success",
      });
      reset();
    } catch (error) {
      toast({
        title: "Could not send your message",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="lead-form" className="container py-20">
      <Card className="mx-auto max-w-xl animate-fade-up">
        <CardHeader>
          <CardTitle className="text-2xl">Tell us about your project</CardTitle>
          <CardDescription>We typically respond within one business day.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            {/* Honeypot field — hidden from real users; bots that auto-fill every input will trip it. */}
            <div className="hidden" aria-hidden="true">
              <Label htmlFor="company">Company</Label>
              <Input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget">Budget</Label>
              <Select
                value={budget}
                onValueChange={(value) =>
                  setValue("budget", value as CreateLeadInput["budget"], { shouldValidate: true })
                }
              >
                <SelectTrigger id="budget" invalid={!!errors.budget}>
                  <SelectValue placeholder="Select a range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {BUDGET_LABELS[range]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.budget && <p className="text-sm text-destructive">{errors.budget.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us what you're looking to build…"
                invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                {...register("message")}
              />
              {errors.message && (
                <p id="message-error" className="text-sm text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>

            <Button type="submit" size="lg" loading={isSubmitting || createLead.isPending}>
              Send message
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
