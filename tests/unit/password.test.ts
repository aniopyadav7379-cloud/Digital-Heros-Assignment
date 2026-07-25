import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("hashes a password to a bcrypt string distinct from the plaintext", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toBe("correct-horse-battery-staple");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("s3cur3-Passw0rd!");
    await expect(verifyPassword("s3cur3-Passw0rd!", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("s3cur3-Passw0rd!");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("produces a different hash each time (unique salts)", async () => {
    const [a, b] = await Promise.all([hashPassword("same-input"), hashPassword("same-input")]);
    expect(a).not.toBe(b);
  });
});
