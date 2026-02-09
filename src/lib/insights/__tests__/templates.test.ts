import { describe, it, expect } from "vitest";
import { renderTemplate, getTemplateKeys } from "../templates";

describe("renderTemplate", () => {
  it("renders a1_standard with all vars", () => {
    const result = renderTemplate("a1_standard", {
      amount: 95,
      merchant: "Ticketmaster",
      benefit: "StubHub Credit",
      remaining: 150,
      action: "buy there next time",
    });
    expect(result.title).toBe("You spent $95 on Ticketmaster");
    expect(result.body).toBe(
      "Your StubHub Credit has $150 left — buy there next time."
    );
  });

  it("renders a1_with_count", () => {
    const result = renderTemplate("a1_with_count", {
      count: 3,
      merchant: "Ticketmaster",
      amount: 285,
      remaining: 150,
      benefit: "StubHub",
    });
    expect(result.title).toBe("3 purchases at Ticketmaster totaling $285");
    expect(result.body).toBe("Your $150 StubHub credit could cover that.");
  });

  it("renders b1_standard", () => {
    const result = renderTemplate("b1_standard", {
      benefit: "Exclusive Tables",
      date: "Jul 1",
      remaining: 150,
      time_left: "2 months",
    });
    expect(result.title).toBe("Your Exclusive Tables resets Jul 1");
    expect(result.body).toBe("You have $150 unused with 2 months left.");
  });

  it("renders b1_urgent", () => {
    const result = renderTemplate("b1_urgent", {
      remaining: 150,
      benefit: "StubHub",
      days: 5,
    });
    expect(result.title).toBe("$150 in StubHub credit expires soon");
    expect(result.body).toBe("Only 5 days left to use it. Book now.");
  });

  it("renders b2_standard", () => {
    const result = renderTemplate("b2_standard", {
      used: 200,
      max: 300,
      benefit: "Edit Hotel",
      remaining: 100,
      action_type: "booking",
    });
    expect(result.title).toBe(
      "You've used $200 of your $300 Edit Hotel credit"
    );
    expect(result.body).toBe(
      "$100 left — one more booking and you've maxed it."
    );
  });

  it("renders c0_standard", () => {
    const result = renderTemplate("c0_standard", {
      total: 430,
      pct_of_fee: 54,
    });
    expect(result.title).toBe("You've already captured $430 in benefits");
    expect(result.body).toBe(
      "That's 54% of your annual fee — let's get the rest."
    );
  });

  it("renders c1_standard", () => {
    const result = renderTemplate("c1_standard", {
      benefit: "Lyft Credit",
      value: 10,
      period: "month",
    });
    expect(result.title).toBe("Nice — you maxed your Lyft Credit");
    expect(result.body).toBe("$10 captured this month.");
  });

  it("renders c2_break_even", () => {
    const result = renderTemplate("c2_break_even", {
      total: 795,
      fee: 795,
    });
    expect(result.title).toBe("Your card just paid for itself");
    expect(result.body).toBe(
      "$795 in benefits captured against your $795 annual fee."
    );
  });

  it("renders a2_free", () => {
    const result = renderTemplate("a2_free", {
      amount: 15,
      service: "Spotify",
      partner: "Apple Music",
      annual: 180,
    });
    expect(result.title).toBe("You're paying $15/mo for Spotify");
    expect(result.body).toBe(
      "Your card includes free Apple Music — that's $180/yr."
    );
  });

  it("preserves unmatched vars as placeholders", () => {
    const result = renderTemplate("a1_standard", {
      amount: 95,
      merchant: "Ticketmaster",
    });
    expect(result.body).toContain("${remaining}");
  });

  it("returns fallback for unknown template", () => {
    const result = renderTemplate("nonexistent", {});
    expect(result.title).toBe("Insight");
    expect(result.body).toBe("");
  });
});

describe("getTemplateKeys", () => {
  it("returns all known keys", () => {
    const keys = getTemplateKeys();
    expect(keys).toContain("a1_standard");
    expect(keys).toContain("a2_free");
    expect(keys).toContain("b1_standard");
    expect(keys).toContain("b2_standard");
    expect(keys).toContain("b3_standard");
    expect(keys).toContain("c0_standard");
    expect(keys).toContain("c1_standard");
    expect(keys).toContain("c2_break_even");
    expect(keys.length).toBeGreaterThanOrEqual(17);
  });
});
