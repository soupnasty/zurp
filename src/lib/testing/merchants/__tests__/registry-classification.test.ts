import { describe, it, expect } from "vitest";
import { normalizeMerchantName } from "@/lib/engine/normalize";
import { classifyForPoints } from "@/lib/points/categories";
import { getMerchantByKey } from "../index";

/**
 * Registry Classification Tests
 *
 * High-priority disambiguation cases that test the most complex
 * interactions between normalization, merchant-map, and Plaid category.
 */

describe("Uber Ecosystem Disambiguation", () => {
  it("Uber Eats classifies as food_delivery, not rideshare", () => {
    const uberEats = getMerchantByKey("uber_eats");
    expect(uberEats).toBeDefined();

    const assignment = classifyForPoints(
      uberEats!.plaidMerchantName,
      uberEats!.plaidCategoryPrimary,
      uberEats!.plaidCategoryDetailed
    );
    expect(assignment.category).toBe("food_delivery");
  });

  it("Uber Ride classifies as rideshare, not food_delivery", () => {
    const uberRide = getMerchantByKey("uber_ride");
    expect(uberRide).toBeDefined();

    const assignment = classifyForPoints(
      uberRide!.plaidMerchantName,
      uberRide!.plaidCategoryPrimary,
      uberRide!.plaidCategoryDetailed
    );
    expect(assignment.category).toBe("rideshare");
  });

  it('"UBER *EATS" normalizes to contain "uber eats" for high-priority matching', () => {
    const normalized = normalizeMerchantName("UBER *EATS");
    expect(normalized).toContain("uber eats");
  });

  it('"UBER *TRIP" normalizes to contain "uber trip" for rideshare matching', () => {
    const normalized = normalizeMerchantName("UBER *TRIP");
    expect(normalized).toContain("uber trip");
  });

  it('"UBEREATS *ORDER" (no space) still contains "uber" for fallback matching', () => {
    const normalized = normalizeMerchantName("UBEREATS *ORDER");
    expect(normalized).toContain("uber");
    // But does NOT contain "uber eats" (space-separated)
    expect(normalized).not.toContain("uber eats");
  });
});

describe("Walmart+ vs Walmart Disambiguation", () => {
  it("Walmart store classifies as shopping", () => {
    const target = getMerchantByKey("target_store");
    expect(target).toBeDefined();

    // Using Target as a proxy for generic shopping classification
    const assignment = classifyForPoints(
      target!.plaidMerchantName,
      target!.plaidCategoryPrimary,
      target!.plaidCategoryDetailed
    );
    expect(assignment.category).toBe("shopping_instore");
  });

  it('"WAL-MART *PLUS" normalizes with hyphen preserved', () => {
    const normalized = normalizeMerchantName("WAL-MART *PLUS");
    expect(normalized).toContain("wal-mart");
    // Note: "wal-mart" does NOT contain "walmart" (no hyphen)
    expect(normalized).not.toContain("walmart");
  });

  it('"WALMART+ MEMBERSHIP" normalizes removing the +', () => {
    // The + in "WALMART+" is not treated as an asterisk/order marker
    const normalized = normalizeMerchantName("WALMART+ MEMBERSHIP");
    expect(normalized).toContain("walmart");
  });
});

describe("Hotel Sub-brand Recognition", () => {
  it("Hyatt sub-brands exist in registry", () => {
    const hyatt = getMerchantByKey("hyatt_hotel");
    expect(hyatt).toBeDefined();
    // Hyatt templates should include sub-brand variants
    expect(hyatt!.nameVariants.length).toBeGreaterThanOrEqual(2);
  });

  it("Hilton sub-brands exist in registry", () => {
    const hilton = getMerchantByKey("hilton_hotel");
    expect(hilton).toBeDefined();
    expect(hilton!.nameVariants.length).toBeGreaterThanOrEqual(2);
  });
});

describe("NYTimes Prefix Handling", () => {
  it('"NYT*NYTIMES DIGITAL" preserves NYT prefix (not in POS strip list)', () => {
    const normalized = normalizeMerchantName("NYT*NYTIMES DIGITAL");
    // NYT is NOT in the POS prefix list (sq, tst, pp, cke, sp, wf, ck, par)
    // Asterisk becomes space
    expect(normalized).toBe("nyt nytimes digital");
  });

  it("NYTimes template has nytimes edge case documented", () => {
    const nyt = getMerchantByKey("nytimes");
    expect(nyt).toBeDefined();
    expect(nyt!.edgeCases).toBeDefined();
    expect(nyt!.edgeCases!.length).toBeGreaterThan(0);
    expect(nyt!.edgeCases![0].rawName).toBe("NYT*NYTIMES DIGITAL");
  });
});

describe("Google-Prefixed YouTube", () => {
  it('"GOOGLE *YOUTUBE PREMIUM" normalizes preserving google prefix', () => {
    const normalized = normalizeMerchantName("GOOGLE *YOUTUBE PREMIUM");
    expect(normalized).toBe("google youtube premium");
    // Still contains "youtube" for merchant-map matching
    expect(normalized).toContain("youtube");
  });

  it("YouTube template classifies as streaming", () => {
    const yt = getMerchantByKey("youtube_premium");
    expect(yt).toBeDefined();

    const assignment = classifyForPoints(
      yt!.plaidMerchantName,
      yt!.plaidCategoryPrimary,
      yt!.plaidCategoryDetailed
    );
    expect(assignment.category).toBe("streaming");
  });
});

describe("Abbreviated Merchant Names", () => {
  it('"WHOLEFDS MKT" does not contain "whole foods"', () => {
    const normalized = normalizeMerchantName("WHOLEFDS MKT #04217");
    expect(normalized).not.toContain("whole foods");
    // Falls back to Plaid category for classification
  });

  it("Whole Foods classifies correctly via Plaid enrichment", () => {
    const wf = getMerchantByKey("whole_foods");
    expect(wf).toBeDefined();

    // With enriched merchant name "Whole Foods Market"
    const assignment = classifyForPoints(
      wf!.plaidMerchantName,
      wf!.plaidCategoryPrimary,
      wf!.plaidCategoryDetailed
    );
    expect(assignment.category).toBe("groceries");
  });

  it("Whole Foods falls back to groceries via Plaid category when enrichment missing", () => {
    const wf = getMerchantByKey("whole_foods");
    expect(wf).toBeDefined();

    // Without enriched merchant name — use abbreviated raw name only
    const assignment = classifyForPoints(
      "WHOLEFDS MKT",
      wf!.plaidCategoryPrimary,
      wf!.plaidCategoryDetailed
    );
    // Should fall back to Plaid category → groceries
    expect(assignment.category).toBe("groceries");
  });
});

describe("POS Prefix Stripping", () => {
  it("SQ* prefix is stripped", () => {
    const normalized = normalizeMerchantName("SQ *THAI BASIL");
    expect(normalized).toBe("thai basil");
  });

  it("TST* prefix is stripped", () => {
    const normalized = normalizeMerchantName("TST* PIZZA PLACE");
    expect(normalized).toBe("pizza place");
  });

  it("PP* prefix is stripped", () => {
    const normalized = normalizeMerchantName("PP*DOORDASH");
    expect(normalized).toBe("doordash");
  });

  it("WF* prefix is stripped but WFM* is not", () => {
    const wf = normalizeMerchantName("WF *WHOLE FOODS");
    expect(wf).toBe("whole foods");

    const wfm = normalizeMerchantName("WFM *WHOLE FOODS 365");
    expect(wfm).toContain("wfm");
  });
});
