import { describe, it, expect } from "vitest";
import type { ScoredInsight, InsightCategory } from "../types";
import { insightGroup } from "../types";

/**
 * Display rules tests — validates the ranking/filtering logic
 * from getInsightsForDisplay without needing a real DB.
 *
 * These test the pure-function aspects of orchestrator display rules:
 * - Score floor (≥ 30 or floorOverride)
 * - Max 1 per benefit
 * - A1/P2 mutual exclusion
 * - Group A outranks Group B within 10 pts
 * - C0 pending always first
 * - At least 1 Group C reserved
 */

function makeInsight(overrides: Partial<ScoredInsight>): ScoredInsight {
  const now = new Date();
  return {
    id: `insight-${Math.random().toString(36).slice(2, 8)}`,
    userId: "user-1",
    category: "B1" as InsightCategory,
    benefitId: null,
    templateKey: "b1_standard",
    templateVars: {},
    renderedTitle: "Test",
    renderedBody: "Test body",
    dollarImpactScore: 60,
    urgencyScore: 80,
    actionabilityScore: 60,
    noveltyScore: 100,
    confidenceScore: 100,
    totalScore: 75,
    floorOverride: false,
    state: "pending",
    dedupKey: `test:${Math.random()}`,
    triggeredByTransactionId: null,
    periodStart: null,
    periodEnd: null,
    generatedAt: now,
    shownAt: null,
    resolvedAt: null,
    ...overrides,
  };
}

/**
 * Replicates the display rules from getInsightsForDisplay
 * without DB dependencies.
 */
function applyDisplayRules(
  rows: ScoredInsight[],
  max = 3
): ScoredInsight[] {
  let insights = [...rows];

  // Rule 4: Score floor
  insights = insights.filter((i) => i.totalScore >= 30 || i.floorOverride);

  // A1/P2 mutual exclusion
  const a1Merchants = new Set(
    insights
      .filter((i) => i.category === "A1")
      .map((i) => String(i.templateVars.merchant ?? "").toLowerCase())
      .filter(Boolean)
  );
  if (a1Merchants.size > 0) {
    insights = insights.filter((i) => {
      if (i.category !== "P2") return true;
      const merchant = String(i.templateVars.merchant ?? "").toLowerCase();
      return !a1Merchants.has(merchant);
    });
  }

  // Rule 2: Max 1 per benefit
  const seenBenefits = new Set<string>();
  insights = insights.filter((i) => {
    if (!i.benefitId) return true;
    if (seenBenefits.has(i.benefitId)) return false;
    seenBenefits.add(i.benefitId);
    return true;
  });

  // Rule 5: Group A outranks Group B within 10 points
  insights.sort((a, b) => {
    const groupA = insightGroup(a.category);
    const groupB = insightGroup(b.category);
    const scoreDiff = Math.abs(a.totalScore - b.totalScore);

    if (scoreDiff <= 10 && groupA === "A" && groupB === "B") return -1;
    if (scoreDiff <= 10 && groupA === "B" && groupB === "A") return 1;

    return b.totalScore - a.totalScore;
  });

  // Rule 6: C0 pending always first
  const c0Index = insights.findIndex(
    (i) => i.category === "C0" && i.state === "pending"
  );
  if (c0Index > 0) {
    const [c0] = insights.splice(c0Index, 1);
    insights.unshift(c0);
  }

  // Rule 3: Reserve 1 Group C slot
  const selected: ScoredInsight[] = [];
  const nonC = insights.filter((i) => insightGroup(i.category) !== "C");
  const groupC = insights.filter((i) => insightGroup(i.category) === "C");

  if (groupC.length > 0 && max >= 2) {
    for (const insight of nonC) {
      if (selected.length >= max - 1) break;
      selected.push(insight);
    }
    selected.push(groupC[0]);
  } else {
    for (const insight of insights) {
      if (selected.length >= max) break;
      selected.push(insight);
    }
  }

  // Fill remaining slots
  const selectedIds = new Set(selected.map((s) => s.id));
  for (const insight of insights) {
    if (selected.length >= max) break;
    if (!selectedIds.has(insight.id)) {
      selected.push(insight);
      selectedIds.add(insight.id);
    }
  }

  // Re-apply Rule 6: C0 pending must be first even after Rule 3 reordering
  const c0SelIdx = selected.findIndex(
    (i) => i.category === "C0" && i.state === "pending"
  );
  if (c0SelIdx > 0) {
    const [c0Item] = selected.splice(c0SelIdx, 1);
    selected.unshift(c0Item);
  }

  return selected.slice(0, max);
}

describe("Display Rules: Score Floor", () => {
  it("filters out insights below score 30", () => {
    const insights = [
      makeInsight({ totalScore: 50 }),
      makeInsight({ totalScore: 25 }), // below threshold
      makeInsight({ totalScore: 40 }),
    ];

    const result = applyDisplayRules(insights);
    expect(result.length).toBe(2);
    expect(result.every((i) => i.totalScore >= 30)).toBe(true);
  });

  it("keeps low-score insights with floorOverride", () => {
    const insights = [
      makeInsight({ totalScore: 20, floorOverride: true }),
      makeInsight({ totalScore: 50 }),
    ];

    const result = applyDisplayRules(insights);
    expect(result.length).toBe(2);
  });
});

describe("Display Rules: Max 1 Per Benefit", () => {
  it("keeps only the first insight per benefitId", () => {
    const insights = [
      makeInsight({ benefitId: "csr_lyft", totalScore: 80 }),
      makeInsight({ benefitId: "csr_lyft", totalScore: 70 }), // duplicate
      makeInsight({ benefitId: "csr_stubhub", totalScore: 60 }),
    ];

    const result = applyDisplayRules(insights);
    const lyftInsights = result.filter((i) => i.benefitId === "csr_lyft");
    expect(lyftInsights.length).toBe(1);
  });

  it("allows multiple insights with null benefitId", () => {
    const insights = [
      makeInsight({ benefitId: null, category: "C2", totalScore: 80 }),
      makeInsight({ benefitId: null, category: "C0", totalScore: 70, state: "pending" }),
    ];

    const result = applyDisplayRules(insights);
    expect(result.length).toBe(2);
  });
});

describe("Display Rules: A1/P2 Mutual Exclusion", () => {
  it("filters out P2 when A1 exists for same merchant", () => {
    const insights = [
      makeInsight({
        category: "A1",
        totalScore: 80,
        templateVars: { merchant: "Uber", amount: 50 },
      }),
      makeInsight({
        category: "P2",
        totalScore: 70,
        templateVars: { merchant: "Uber", spend: 50 },
      }),
      makeInsight({
        category: "B1",
        totalScore: 60,
      }),
    ];

    const result = applyDisplayRules(insights);
    const p2 = result.filter((i) => i.category === "P2");
    expect(p2.length).toBe(0);
  });

  it("keeps P2 for different merchant than A1", () => {
    const insights = [
      makeInsight({
        category: "A1",
        totalScore: 80,
        templateVars: { merchant: "Uber" },
      }),
      makeInsight({
        category: "P2",
        totalScore: 70,
        templateVars: { merchant: "Hotels" },
      }),
    ];

    const result = applyDisplayRules(insights);
    const p2 = result.filter((i) => i.category === "P2");
    expect(p2.length).toBe(1);
  });
});

describe("Display Rules: Group A Outranks B", () => {
  it("ranks Group A above Group B when scores within 10 points", () => {
    const insights = [
      makeInsight({ category: "B1", totalScore: 75 }),
      makeInsight({ category: "A1", totalScore: 70 }),
      makeInsight({ category: "C1", totalScore: 65 }),
    ];

    const result = applyDisplayRules(insights);
    // A1 at 70 should rank above B1 at 75 (within 10 pts, Group A wins)
    const a1Index = result.findIndex((i) => i.category === "A1");
    const b1Index = result.findIndex((i) => i.category === "B1");
    expect(a1Index).toBeLessThan(b1Index);
  });

  it("respects score order when difference > 10", () => {
    const insights = [
      makeInsight({ category: "B1", totalScore: 90 }),
      makeInsight({ category: "A1", totalScore: 60 }),
      makeInsight({ category: "C1", totalScore: 50 }),
    ];

    const result = applyDisplayRules(insights);
    // B1 at 90 should rank above A1 at 60 (difference > 10)
    const a1Index = result.findIndex((i) => i.category === "A1");
    const b1Index = result.findIndex((i) => i.category === "B1");
    expect(b1Index).toBeLessThan(a1Index);
  });
});

describe("Display Rules: C0 Always First", () => {
  it("moves pending C0 to first position", () => {
    const insights = [
      makeInsight({ category: "A1", totalScore: 90 }),
      makeInsight({ category: "C0", totalScore: 40, state: "pending" }),
      makeInsight({ category: "B1", totalScore: 80 }),
    ];

    const result = applyDisplayRules(insights);
    expect(result[0].category).toBe("C0");
  });

  it("does not promote C0 in shown state", () => {
    const insights = [
      makeInsight({ category: "A1", totalScore: 90 }),
      makeInsight({ category: "C0", totalScore: 40, state: "shown" }),
      makeInsight({ category: "B1", totalScore: 80 }),
    ];

    const result = applyDisplayRules(insights);
    expect(result[0].category).not.toBe("C0");
  });
});

describe("Display Rules: Group C Reservation", () => {
  it("reserves at least 1 slot for Group C", () => {
    const insights = [
      makeInsight({ category: "A1", totalScore: 90 }),
      makeInsight({ category: "B1", totalScore: 85 }),
      makeInsight({ category: "B2", totalScore: 80 }),
      makeInsight({ category: "C1", totalScore: 50 }),
    ];

    const result = applyDisplayRules(insights, 3);
    const groupC = result.filter((i) => insightGroup(i.category) === "C");
    expect(groupC.length).toBeGreaterThanOrEqual(1);
  });

  it("fills all slots with non-C if no Group C available", () => {
    const insights = [
      makeInsight({ category: "A1", totalScore: 90 }),
      makeInsight({ category: "B1", totalScore: 85 }),
      makeInsight({ category: "B2", totalScore: 80 }),
    ];

    const result = applyDisplayRules(insights, 3);
    expect(result.length).toBe(3);
  });
});

describe("Display Rules: Max Output", () => {
  it("returns at most max insights", () => {
    const insights = Array.from({ length: 10 }, (_, i) =>
      makeInsight({ totalScore: 90 - i * 5 })
    );

    const result = applyDisplayRules(insights, 3);
    expect(result.length).toBe(3);
  });
});

describe("insightGroup mapping", () => {
  it("maps P2 to Group A", () => {
    expect(insightGroup("P2")).toBe("A");
  });

  it("maps P1 to Group C", () => {
    expect(insightGroup("P1")).toBe("C");
  });

  it("maps B4 to Group B", () => {
    expect(insightGroup("B4")).toBe("B");
  });

  it("maps standard categories correctly", () => {
    expect(insightGroup("A1")).toBe("A");
    expect(insightGroup("A2")).toBe("A");
    expect(insightGroup("B1")).toBe("B");
    expect(insightGroup("B2")).toBe("B");
    expect(insightGroup("B3")).toBe("B");
    expect(insightGroup("C0")).toBe("C");
    expect(insightGroup("C1")).toBe("C");
    expect(insightGroup("C2")).toBe("C");
  });
});
