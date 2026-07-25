import { describe, it, expect } from "vitest";
import { loginSchema } from "@/features/auth/schema";
import { createLeadSchema, updateLeadStatusSchema } from "@/features/leads/schema";

describe("loginSchema", () => {
  it("accepts a valid email/password pair", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "short" });
    expect(result.success).toBe(false);
  });
});

describe("createLeadSchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    budget: "ONE_TO_5K",
    message: "We'd like a quote for a new website build.",
  };

  it("accepts a fully valid submission", () => {
    expect(createLeadSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid budget enum value", () => {
    const result = createLeadSchema.safeParse({ ...valid, budget: "A_MILLION_DOLLARS" });
    expect(result.success).toBe(false);
  });

  it("rejects a message over the character limit", () => {
    const result = createLeadSchema.safeParse({ ...valid, message: "x".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("flags a non-empty honeypot field", () => {
    const result = createLeadSchema.safeParse({ ...valid, company: "I am a bot" });
    expect(result.success).toBe(false);
  });
});

describe("updateLeadStatusSchema", () => {
  it("accepts each valid status", () => {
    for (const status of ["NEW", "CONTACTED", "CLOSED"]) {
      expect(updateLeadStatusSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects an unknown status", () => {
    expect(updateLeadStatusSchema.safeParse({ status: "ARCHIVED" }).success).toBe(false);
  });
});
