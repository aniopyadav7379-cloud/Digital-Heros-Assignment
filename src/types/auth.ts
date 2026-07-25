export const ROLES = ["ADMIN", "STAFF"] as const;
export type Role = (typeof ROLES)[number];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** Shape of the payload encoded inside the session JWT. */
export interface SessionPayload {
  sub: string; // user id
  email: string;
  role: Role;
  name: string;
}
