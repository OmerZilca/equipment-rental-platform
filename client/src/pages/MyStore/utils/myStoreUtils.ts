/**
 * My Store helpers: normalize category strings, read API error `detail` from axios-like errors.
 */
import { PRODUCT_CATEGORIES } from "../constants";

const categoryValues = new Set(PRODUCT_CATEGORIES.map((c) => c.value));

export function normalizeCategory(raw: string | null): string {
  if (!raw) return "general";
  if (categoryValues.has(raw)) return raw;
  return "general";
}

export function apiErrorMessage(e: unknown, fallback: string): string {
  if (
    typeof e === "object" &&
    e !== null &&
    "response" in e &&
    typeof (e as { response?: { data?: { detail?: unknown } } }).response
      ?.data?.detail === "string"
  ) {
    return (e as { response: { data: { detail: string } } }).response.data
      .detail;
  }
  return fallback;
}
