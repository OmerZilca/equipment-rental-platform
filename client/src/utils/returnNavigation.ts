/**
 * Validates post-auth redirect targets (same-origin SPA paths only).
 * Rejects protocol-relative and absolute URLs to avoid open redirects.
 */
export function getSafeReturnPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.includes("://") || value.includes("\\")) return null;
  return value;
}
