import { describe, it, expect } from "vitest";
import { normalizeMerchantName, matchesMerchantPattern } from "../normalize";

describe("normalizeMerchantName", () => {
  it("lowercases the name", () => {
    expect(normalizeMerchantName("DOORDASH")).toBe("doordash");
  });

  it("strips order numbers with *", () => {
    expect(normalizeMerchantName("LYFT *RIDE 8472")).toBe("lyft ride");
  });

  it("strips order numbers with #", () => {
    expect(normalizeMerchantName("UBER EATS #1234")).toBe("uber eats");
  });

  it("cleans up asterisks", () => {
    expect(normalizeMerchantName("LYFT * RIDE")).toBe("lyft ride");
  });

  it("trims whitespace", () => {
    expect(normalizeMerchantName("  DOORDASH  ")).toBe("doordash");
  });

  it("returns empty string for null", () => {
    expect(normalizeMerchantName(null)).toBe("");
  });

  it("handles complex merchant names", () => {
    expect(normalizeMerchantName("DOORDASH*ORDER #555")).toBe("doordash order");
  });

  it("normalizes multiple spaces", () => {
    expect(normalizeMerchantName("UBER   EATS")).toBe("uber eats");
  });
});

describe("matchesMerchantPattern", () => {
  it("matches substring", () => {
    expect(matchesMerchantPattern("doordash order", ["doordash"])).toBe(true);
  });

  it("matches any pattern in array", () => {
    expect(
      matchesMerchantPattern("lyft ride", ["uber", "lyft", "doordash"])
    ).toBe(true);
  });

  it("returns false for no match", () => {
    expect(
      matchesMerchantPattern("starbucks coffee", ["doordash", "lyft"])
    ).toBe(false);
  });

  it("is case-insensitive for patterns", () => {
    expect(matchesMerchantPattern("doordash", ["DoorDash"])).toBe(true);
  });

  it("returns false for empty name", () => {
    expect(matchesMerchantPattern("", ["doordash"])).toBe(false);
  });

  it("returns false for empty patterns", () => {
    expect(matchesMerchantPattern("doordash", [])).toBe(false);
  });
});
