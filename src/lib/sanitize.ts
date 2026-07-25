/**
 * Strips HTML tags and control characters from user-submitted free text.
 * React already escapes output by default, but we sanitize at the
 * storage layer too (defense in depth) so raw payloads never sit in the
 * database, get exported to CSV, or leak through any future non-React
 * consumer of this data (emails, admin exports, etc).
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
}
