import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { signSessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE } from "@/lib/auth/session";

describe("middleware", () => {
  it("redirects unauthenticated visitors away from /admin to /login", async () => {
    const req = new NextRequest("http://localhost/admin");
    const res = await middleware(req);

    expect(res.status).toBe(307); // NextResponse.redirect default
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("from=%2Fadmin");
  });

  it("lets an authenticated session through to /admin", async () => {
    const token = await signSessionToken({
      sub: "user_1",
      email: "admin@leaddesk.dev",
      role: "ADMIN",
      name: "Admin",
    });
    const req = new NextRequest("http://localhost/admin", {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
    });
    const res = await middleware(req);

    // NextResponse.next() carries no redirect location and a 200-ish passthrough status.
    expect(res.headers.get("location")).toBeNull();
  });

  it("answers CORS preflight OPTIONS requests directly with 204", async () => {
    const req = new NextRequest("http://localhost/api/leads", { method: "OPTIONS" });
    const res = await middleware(req);
    expect(res.status).toBe(204);
  });
});
