import { describe, it, expect } from "vitest";
import {
  computeDollarImpactScore,
  computeUrgencyScore,
  computeActionabilityScore,
  computeNoveltyScore,
  computeConfidenceScore,
  computeTotalScore,
  isFloorOverride,
  scoreCandidate,
} from "../scoring";
import type { InsightImpressionHistory } from "../types";

describe("computeDollarImpactScore", () => {
  it("returns 100 for $300+", () => {
    expect(computeDollarImpactScore(300)).toBe(100);
    expect(computeDollarImpactScore(500)).toBe(100);
  });

  it("returns 80 for $150-299", () => {
    expect(computeDollarImpactScore(150)).toBe(80);
    expect(computeDollarImpactScore(299)).toBe(80);
  });

  it("returns 60 for $50-149", () => {
    expect(computeDollarImpactScore(50)).toBe(60);
    expect(computeDollarImpactScore(149)).toBe(60);
  });

  it("returns 40 for $20-49", () => {
    expect(computeDollarImpactScore(20)).toBe(40);
    expect(computeDollarImpactScore(49)).toBe(40);
  });

  it("returns 20 for $10-19", () => {
    expect(computeDollarImpactScore(10)).toBe(20);
    expect(computeDollarImpactScore(19)).toBe(20);
  });

  it("returns 10 for < $10", () => {
    expect(computeDollarImpactScore(5)).toBe(10);
    expect(computeDollarImpactScore(0)).toBe(10);
  });
});

describe("computeUrgencyScore", () => {
  it("returns 100 for <= 7 days", () => {
    expect(computeUrgencyScore(7)).toBe(100);
    expect(computeUrgencyScore(1)).toBe(100);
  });

  it("returns 80 for 8-30 days", () => {
    expect(computeUrgencyScore(8)).toBe(80);
    expect(computeUrgencyScore(30)).toBe(80);
  });

  it("returns 60 for 31-90 days", () => {
    expect(computeUrgencyScore(31)).toBe(60);
    expect(computeUrgencyScore(90)).toBe(60);
  });

  it("returns 50 for > 90 days", () => {
    expect(computeUrgencyScore(91)).toBe(50);
  });

  it("returns 20 for null (no expiration)", () => {
    expect(computeUrgencyScore(null)).toBe(20);
  });

  it("returns 0 for expired", () => {
    expect(computeUrgencyScore(0)).toBe(0);
    expect(computeUrgencyScore(-1)).toBe(0);
  });
});

describe("computeActionabilityScore", () => {
  it("maps tiers correctly", () => {
    expect(computeActionabilityScore("one_click")).toBe(100);
    expect(computeActionabilityScore("switch_platform")).toBe(80);
    expect(computeActionabilityScore("book_portal")).toBe(60);
    expect(computeActionabilityScore("change_recurring")).toBe(40);
    expect(computeActionabilityScore("plan_future")).toBe(20);
  });
});

describe("computeNoveltyScore", () => {
  it("returns 100 for first time (null history)", () => {
    expect(computeNoveltyScore(null)).toBe(100);
  });

  it("returns 100 for never shown", () => {
    const h: InsightImpressionHistory = {
      insightId: "x",
      showCount: 0,
      lastShownAt: null,
      firstShownAt: null,
    };
    expect(computeNoveltyScore(h)).toBe(100);
  });

  it("returns 0 for shown within last day", () => {
    const h: InsightImpressionHistory = {
      insightId: "x",
      showCount: 1,
      lastShownAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      firstShownAt: new Date(Date.now() - 1000 * 60 * 60),
    };
    expect(computeNoveltyScore(h)).toBe(0);
  });

  it("returns 60 for shown once 30+ days ago", () => {
    const h: InsightImpressionHistory = {
      insightId: "x",
      showCount: 1,
      lastShownAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31),
      firstShownAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31),
    };
    expect(computeNoveltyScore(h)).toBe(60);
  });

  it("returns 20 for shown 2+ times within 60 days", () => {
    const h: InsightImpressionHistory = {
      insightId: "x",
      showCount: 2,
      lastShownAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      firstShownAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    };
    expect(computeNoveltyScore(h)).toBe(20);
  });
});

describe("computeConfidenceScore", () => {
  it("maps tiers correctly", () => {
    expect(computeConfidenceScore("exact_confirmed")).toBe(100);
    expect(computeConfidenceScore("exact_inferred")).toBe(80);
    expect(computeConfidenceScore("category_match")).toBe(50);
    expect(computeConfidenceScore("amount_heuristic")).toBe(30);
  });
});

describe("computeTotalScore", () => {
  it("computes weighted total", () => {
    const score = computeTotalScore({
      dollarImpactScore: 100,
      urgencyScore: 100,
      actionabilityScore: 100,
      noveltyScore: 100,
      confidenceScore: 100,
    });
    expect(score).toBe(100);
  });

  it("computes partial scores", () => {
    const score = computeTotalScore({
      dollarImpactScore: 80,
      urgencyScore: 60,
      actionabilityScore: 40,
      noveltyScore: 20,
      confidenceScore: 100,
    });
    // 80*0.35 + 60*0.25 + 40*0.20 + 20*0.10 + 100*0.10
    // = 28 + 15 + 8 + 2 + 10 = 63
    expect(score).toBe(63);
  });
});

describe("isFloorOverride", () => {
  it("returns true for Group A with high dollar and urgency", () => {
    expect(isFloorOverride("A1", 80, 80)).toBe(true);
    expect(isFloorOverride("A2", 100, 100)).toBe(true);
  });

  it("returns true for Group B with high dollar and urgency", () => {
    expect(isFloorOverride("B1", 80, 80)).toBe(true);
  });

  it("returns false for Group C", () => {
    expect(isFloorOverride("C1", 100, 100)).toBe(false);
    expect(isFloorOverride("C0", 80, 80)).toBe(false);
  });

  it("returns false when scores below threshold", () => {
    expect(isFloorOverride("A1", 60, 80)).toBe(false);
    expect(isFloorOverride("A1", 80, 60)).toBe(false);
  });
});

describe("scoreCandidate", () => {
  it("scores a full candidate", () => {
    const result = scoreCandidate(
      {
        category: "A1",
        benefitId: "csr_stubhub_h1",
        templateKey: "a1_standard",
        templateVars: { amount: 95, merchant: "Ticketmaster" },
        dedupKey: "a1:stubhub:2026-02",
        triggeredByTransactionId: null,
        periodStart: null,
        periodEnd: null,
        dollarAmount: 95,
        daysRemaining: 45,
        actionability: "switch_platform",
        confidence: "exact_confirmed",
      },
      null
    );

    expect(result.dollarImpactScore).toBe(60);
    expect(result.urgencyScore).toBe(60);
    expect(result.actionabilityScore).toBe(80);
    expect(result.noveltyScore).toBe(100);
    expect(result.confidenceScore).toBe(100);
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.floorOverride).toBe(false);
  });
});
