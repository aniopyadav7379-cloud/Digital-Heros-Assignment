import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";
import { ok } from "@/lib/api-response";

export async function POST() {
  const res = ok({ loggedOut: true }) as NextResponse;
  clearSessionCookie(res);
  return res;
}
