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

  it("renders c2_break_even_with_points", () => {
    const result = renderTemplate("c2_break_even_with_points", {
      credits: 300,
      points_value: 250,
      total: 550,
      fee: 550,
    });
    expect(result.title).toBe("Your card just paid for itself");
    expect(result.body).toContain("$300 in credits");
    expect(result.body).toContain("$250 in points");
  });

  it("renders c0_points_dominant", () => {
    const result = renderTemplate("c0_points_dominant", {
      points_value: 400,
      credits: 50,
      total: 450,
      pct_of_fee: 82,
    });
    expect(result.title).toBe("Your points are doing the heavy lifting");
    expect(result.body).toContain("$400 in points value");
  });

  it("renders p1_standard", () => {
    const result = renderTemplate("p1_standard", {
      category: "dining",
      spend: 2000,
      extra_value: 80,
      earn_rate: 3,
      base_rate: 1,
    });
    expect(result.title).toContain("dining spending earned $80 extra");
    expect(result.body).toContain("3x earn rate");
  });

  it("renders p2_rideshare", () => {
    const result = renderTemplate("p2_rideshare", {
      spend: 150,
      merchant: "Uber",
      redirect_to: "Lyft",
      bonus_rate: 10,
      current_rate: 3,
      extra_value: 45,
    });
    expect(result.title).toBe("You spent $150 on Uber");
    expect(result.body).toContain("Lyft");
  });

  it("renders b4_renewing", () => {
    const result = renderTemplate("b4_renewing", {
      credit: 200,
      benefit: "Hotel Credit",
      days: 5,
      used: 150,
    });
    expect(result.title).toBe("Your $200 Hotel Credit credit renews in 5 days");
    expect(result.body).toContain("You used $150 this period");
  });

  it("renders b4_maxed_renewing", () => {
    const result = renderTemplate("b4_maxed_renewing", {
      benefit: "Hotel Credit",
      days: 3,
      credit: 200,
    });
    expect(result.title).toBe("Nice — you maxed Hotel Credit. It renews in 3 days");
    expect(result.body).toContain("Another $200 incoming");
  });

  it("renders p2_portal", () => {
    const result = renderTemplate("p2_portal", {
      spend: 500,
      merchant: "hotels",
      redirect_to: "Chase Travel Portal",
      bonus_rate: 10,
      current_rate: 3,
      extra_value: 70,
    });
    expect(result.title).toBe("$500 in hotels booked direct");
    expect(result.body).toContain("Chase Travel Portal");
  });
});

describe("getTemplateKeys", () => {
  it("returns all known keys including new points templates", () => {
    const keys = getTemplateKeys();
    expect(keys).toContain("a1_standard");
    expect(keys).toContain("a2_free");
    expect(keys).toContain("b1_standard");
    expect(keys).toContain("b2_standard");
    expect(keys).toContain("b3_standard");
    expect(keys).toContain("c0_standard");
    expect(keys).toContain("c1_standard");
    expect(keys).toContain("c2_break_even");
    // New points templates
    expect(keys).toContain("c2_break_even_with_points");
    expect(keys).toContain("c2_profitable_with_points");
    expect(keys).toContain("c0_standard_with_points");
    expect(keys).toContain("c0_points_dominant");
    expect(keys).toContain("p1_standard");
    expect(keys).toContain("p1_high_value");
    expect(keys).toContain("p2_rideshare");
    expect(keys).toContain("p2_portal");
    // B4 templates
    expect(keys).toContain("b4_renewing");
    expect(keys).toContain("b4_maxed_renewing");
    expect(keys.length).toBeGreaterThanOrEqual(29);
  });
});
