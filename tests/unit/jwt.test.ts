import { describe, it, expect } from "vitest";
import { signSessionToken, verifySessionToken } from "@/lib/auth/jwt";
import type { SessionPayload } from "@/types/auth";

const payload: SessionPayload = {
  sub: "user_123",
  email: "admin@leaddesk.dev",
  role: "ADMIN",
  name: "Test Admin",
};

describe("session JWT", () => {
  it("round-trips a signed token back to its original payload", async () => {
    const token = await signSessionToken(payload);
    const decoded = await verifySessionToken(token);
    expect(decoded).toEqual(payload);
  });

  it("rejects a malformed token", async () => {
    await expect(verifySessionToken("not-a-real-token")).resolves.toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "a-completely-different-secret-key-value-here";
    const tokenFromOtherSecret = await signSessionToken(payload);
    process.env.JWT_SECRET = originalSecret;

    await expect(verifySessionToken(tokenFromOtherSecret)).resolves.toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken(payload);
    const tampered = token.slice(0, -2) + (token.slice(-2) === "aa" ? "bb" : "aa");
    await expect(verifySessionToken(tampered)).resolves.toBeNull();
  });
});
