/**
 * Best-effort, in-memory rate limiter keyed by IP. This resets whenever
 * the serverless instance recycles, so it is not a substitute for an
 * edge/WAF-level limiter in production — but it stops naive scripted
 * abuse of the public POST /api/leads endpoint at zero extra infra cost.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;

export function isRateLimited(key: string, limit: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}
