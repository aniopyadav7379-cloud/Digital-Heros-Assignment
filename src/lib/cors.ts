/**
 * Comma-separated list of origins allowed to call the API with
 * credentials from a browser (e.g. a separate admin SPA). Same-origin
 * requests from this app itself never need CORS headers at all — this
 * only matters for cross-origin callers.
 */
function getAllowedOrigins(): string[] {
  return (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function buildCorsHeaders(requestOrigin: string | null): Headers {
  const headers = new Headers();
  const allowed = getAllowedOrigins();

  if (requestOrigin && allowed.includes(requestOrigin)) {
    headers.set("Access-Control-Allow-Origin", requestOrigin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }

  headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
}
