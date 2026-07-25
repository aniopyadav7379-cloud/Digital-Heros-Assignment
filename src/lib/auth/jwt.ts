import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { SessionPayload } from "@/types/auth";

const ALG = "HS256";
const DEFAULT_EXPIRY = "8h";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or too short. Set a random string of at least 32 characters in your environment."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload } as unknown as JWTPayload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? DEFAULT_EXPIRY)
    .sign(getSecretKey());
}

/** Returns the verified session payload, or null if the token is missing/invalid/expired. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: [ALG] });
    if (
      typeof payload.sub === "string" &&
      typeof payload.email === "string" &&
      typeof payload.role === "string" &&
      typeof payload.name === "string"
    ) {
      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role as SessionPayload["role"],
        name: payload.name,
      };
    }
    return null;
  } catch {
    // Covers expired, malformed, or tampered tokens alike — callers never
    // need to distinguish, they just treat the session as absent.
    return null;
  }
}
