import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { signSessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE } from "@/lib/auth/session";

vi.mock("@/services/leadService", () => ({
  leadService: {
    list: vi.fn().mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, pageSize: 10, totalPages: 1 },
      stats: { total: 0, new: 0, contacted: 0, closed: 0 },
    }),
  },
}));

function withSessionCookie(url: string, token?: string) {
  return new NextRequest(url, {
    headers: token ? { cookie: `${SESSION_COOKIE}=${token}` } : undefined,
  });
}

describe("GET /api/leads", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no session cookie is present", async () => {
    const { GET } = await import("@/app/api/leads/route");
    const res = await GET(withSessionCookie("http://localhost/api/leads"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 200 with a valid STAFF session", async () => {
    const token = await signSessionToken({
      sub: "user_1",
      email: "staff@leaddesk.dev",
      role: "STAFF",
      name: "Staff Member",
    });
    const { GET } = await import("@/app/api/leads/route");
    const res = await GET(withSessionCookie("http://localhost/api/leads", token));

    expect(res.status).toBe(200);
  });

  it("returns 401 for a tampered session token", async () => {
    const token = await signSessionToken({
      sub: "user_1",
      email: "staff@leaddesk.dev",
      role: "STAFF",
      name: "Staff Member",
    });
    const { GET } = await import("@/app/api/leads/route");
    const res = await GET(withSessionCookie("http://localhost/api/leads", `${token}tampered`));

    expect(res.status).toBe(401);
  });
});

describe("GET /api/leads/export", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 403 for an authenticated STAFF (non-admin) session", async () => {
    const token = await signSessionToken({
      sub: "user_1",
      email: "staff@leaddesk.dev",
      role: "STAFF",
      name: "Staff Member",
    });
    const { GET } = await import("@/app/api/leads/export/route");
    const res = await GET(withSessionCookie("http://localhost/api/leads/export", token));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error.code).toBe("FORBIDDEN");
  });
});
