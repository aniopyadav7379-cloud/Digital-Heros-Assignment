import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { SESSION_COOKIE } from "@/lib/auth/session";

const findUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

function postJson(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a malformed body with 422", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(postJson("http://localhost/api/auth/login", { email: "not-an-email" }));
    expect(res.status).toBe(422);
  });

  it("returns 401 when the user does not exist (no enumeration hint)", async () => {
    findUnique.mockResolvedValue(null);
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(
      postJson("http://localhost/api/auth/login", { email: "ghost@leaddesk.dev", password: "password123" })
    );
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for a wrong password", async () => {
    findUnique.mockResolvedValue({
      id: "user_1",
      name: "Admin",
      email: "admin@leaddesk.dev",
      passwordHash: await hashPassword("correct-password"),
      role: "ADMIN",
    });
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(
      postJson("http://localhost/api/auth/login", { email: "admin@leaddesk.dev", password: "wrong-password" })
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 and sets a session cookie for correct credentials", async () => {
    findUnique.mockResolvedValue({
      id: "user_1",
      name: "Admin",
      email: "admin@leaddesk.dev",
      passwordHash: await hashPassword("correct-password"),
      role: "ADMIN",
    });
    const { POST } = await import("@/app/api/auth/login/route");
    const res = await POST(
      postJson("http://localhost/api/auth/login", { email: "admin@leaddesk.dev", password: "correct-password" })
    );

    expect(res.status).toBe(200);
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBeTruthy();
  });
});
