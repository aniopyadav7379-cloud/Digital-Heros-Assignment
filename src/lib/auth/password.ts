import bcrypt from "bcryptjs";

/**
 * Work factor of 12 balances brute-force resistance against acceptable
 * login latency (~150-250ms on typical serverless CPU). Re-evaluate
 * periodically as hardware improves.
 */
const SALT_ROUNDS = 12;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
