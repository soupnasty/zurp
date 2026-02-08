import { describe, it, expect } from "vitest";
import { classifyTransaction } from "../categories";

describe("classifyTransaction", () => {
  // Dining
  it("FOOD_AND_DRINK + restaurant detailed → dining", () => {
    expect(classifyTransaction("FOOD_AND_DRINK", "FOOD_AND_DRINK_RESTAURANT")).toBe("dining");
  });

  it("FOOD_AND_DRINK + coffee shop → dining", () => {
    expect(classifyTransaction("FOOD_AND_DRINK", "FOOD_AND_DRINK_COFFEE")).toBe("dining");
  });

  it("FOOD_AND_DRINK + bar → dining", () => {
    expect(classifyTransaction("FOOD_AND_DRINK", "FOOD_AND_DRINK_BAR")).toBe("dining");
  });

  it("FOOD_AND_DRINK + no detailed → dining (default for primary)", () => {
    expect(classifyTransaction("FOOD_AND_DRINK", null)).toBe("dining");
  });

  // Groceries
  it("FOOD_AND_DRINK + groceries detailed → groceries", () => {
    expect(classifyTransaction("FOOD_AND_DRINK", "FOOD_AND_DRINK_GROCERIES")).toBe("groceries");
  });

  it("FOOD_AND_DRINK + supercenter → groceries", () => {
    expect(classifyTransaction("FOOD_AND_DRINK", "FOOD_AND_DRINK_SUPERCENTER")).toBe("groceries");
  });

  it("GENERAL_MERCHANDISE + superstores → groceries", () => {
    expect(classifyTransaction("GENERAL_MERCHANDISE", "GENERAL_MERCHANDISE_SUPERSTORES")).toBe("groceries");
  });

  // Travel
  it("TRAVEL → travel", () => {
    expect(classifyTransaction("TRAVEL", "TRAVEL_FLIGHTS")).toBe("travel");
  });

  it("TRAVEL + no detailed → travel", () => {
    expect(classifyTransaction("TRAVEL", null)).toBe("travel");
  });

  // Transportation
  it("TRANSPORTATION → transportation", () => {
    expect(classifyTransaction("TRANSPORTATION", "TRANSPORTATION_RIDESHARE")).toBe("transportation");
  });

  // Entertainment
  it("ENTERTAINMENT → entertainment", () => {
    expect(classifyTransaction("ENTERTAINMENT", "ENTERTAINMENT_MUSIC")).toBe("entertainment");
  });

  it("RECREATION → entertainment", () => {
    expect(classifyTransaction("RECREATION", "RECREATION_SPORTS")).toBe("entertainment");
  });

  // Subscriptions
  it("GENERAL_MERCHANDISE + streaming → subscriptions", () => {
    expect(classifyTransaction("GENERAL_MERCHANDISE", "GENERAL_MERCHANDISE_STREAMING")).toBe("subscriptions");
  });

  it("GENERAL_SERVICES + subscription → subscriptions", () => {
    expect(classifyTransaction("GENERAL_SERVICES", "GENERAL_SERVICES_SUBSCRIPTION")).toBe("subscriptions");
  });

  // Shopping
  it("GENERAL_MERCHANDISE + clothing → shopping", () => {
    expect(classifyTransaction("GENERAL_MERCHANDISE", "GENERAL_MERCHANDISE_CLOTHING")).toBe("shopping");
  });

  it("GENERAL_SERVICES + other → shopping", () => {
    expect(classifyTransaction("GENERAL_SERVICES", "GENERAL_SERVICES_OTHER")).toBe("shopping");
  });

  // Other / edge cases
  it("null primary → other", () => {
    expect(classifyTransaction(null, null)).toBe("other");
  });

  it("unknown primary → other", () => {
    expect(classifyTransaction("BANK_FEES", "BANK_FEES_ATM")).toBe("other");
  });

  it("LOAN_PAYMENTS → other", () => {
    expect(classifyTransaction("LOAN_PAYMENTS", null)).toBe("other");
  });

  // Detailed override takes precedence over primary exclusion
  it("detailed include wins over primary exclusion", () => {
    // GENERAL_MERCHANDISE_SUPERSTORES is in groceries include,
    // and GENERAL_MERCHANDISE would normally go to shopping
    expect(classifyTransaction("GENERAL_MERCHANDISE", "GENERAL_MERCHANDISE_SUPERSTORES")).toBe("groceries");
  });
});
