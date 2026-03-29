/** Ensures product category constants stay in sync with expected API values. */
import { describe, it, expect } from "vitest";
import { PRODUCT_CATEGORIES } from "./constants";

describe("MyStore constants", () => {
  it("includes all category values used by the API", () => {
    const values = PRODUCT_CATEGORIES.map((c) => c.value);
    expect(values).toEqual(
      expect.arrayContaining([
        "trips",
        "audio",
        "photo",
        "construction",
        "gardening",
        "general",
      ])
    );
    expect(values.length).toBe(6);
  });
});
