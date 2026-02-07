import { describe, it, expect } from "vitest";
import { detectAnniversary } from "../anniversary-detector";
import type { MatcherTransaction } from "@/lib/types";

function makeTx(
  overrides: Partial<MatcherTransaction> = {}
): MatcherTransaction {
  return {
    id: "tx_1",
    date: new Date(2026, 0, 15),
    merchantName: null,
    merchantNameRaw: null,
    amount: 0,
    plaidCategoryPrimary: null,
    plaidCategoryDetailed: null,
    pending: false,
    matchedStatus: "unmatched",
    ...overrides,
  };
}

describe("detectAnniversary", () => {
  it("detects annual fee transaction", () => {
    const transactions: MatcherTransaction[] = [
      makeTx({
        id: "fee_tx",
        amount: 795,
        merchantName: "ANNUAL MEMBERSHIP FEE",
        date: new Date(2025, 8, 15), // Sep 15, 2025
      }),
      makeTx({
        id: "normal_tx",
        amount: 42.5,
        merchantName: "DOORDASH",
      }),
    ];

    const result = detectAnniversary(
      transactions,
      795,
      "annual membership fee"
    );

    expect(result.detected).toBe(true);
    expect(result.transactionId).toBe("fee_tx");
    expect(result.anniversaryDate).toEqual(new Date(2025, 8, 15));
  });

  it("handles amount within 5% tolerance", () => {
    const transactions: MatcherTransaction[] = [
      makeTx({
        id: "fee_tx",
        amount: 780, // Within 5% of 795
        merchantName: "Annual Membership Fee",
      }),
    ];

    const result = detectAnniversary(
      transactions,
      795,
      "annual membership fee"
    );

    expect(result.detected).toBe(true);
  });

  it("rejects amount outside 5% tolerance", () => {
    const transactions: MatcherTransaction[] = [
      makeTx({
        id: "fee_tx",
        amount: 700, // Outside 5% of 795
        merchantName: "Annual Membership Fee",
      }),
    ];

    const result = detectAnniversary(
      transactions,
      795,
      "annual membership fee"
    );

    expect(result.detected).toBe(false);
  });

  it("picks the most recent transaction when multiple match", () => {
    const transactions: MatcherTransaction[] = [
      makeTx({
        id: "old_fee",
        amount: 795,
        merchantName: "Annual Membership Fee",
        date: new Date(2024, 8, 15),
      }),
      makeTx({
        id: "new_fee",
        amount: 795,
        merchantName: "Annual Membership Fee",
        date: new Date(2025, 8, 15),
      }),
    ];

    const result = detectAnniversary(
      transactions,
      795,
      "annual membership fee"
    );

    expect(result.detected).toBe(true);
    expect(result.transactionId).toBe("new_fee");
    expect(result.anniversaryDate).toEqual(new Date(2025, 8, 15));
  });

  it("returns high confidence when BANK_FEES category matches", () => {
    const transactions: MatcherTransaction[] = [
      makeTx({
        id: "fee_tx",
        amount: 795,
        merchantName: "Annual Membership Fee",
        plaidCategoryPrimary: "BANK_FEES_AND_CHARGES",
      }),
    ];

    const result = detectAnniversary(
      transactions,
      795,
      "annual membership fee"
    );

    expect(result.confidence).toBe("high");
  });

  it("returns medium confidence without category match", () => {
    const transactions: MatcherTransaction[] = [
      makeTx({
        id: "fee_tx",
        amount: 795,
        merchantName: "Annual Membership Fee",
        plaidCategoryPrimary: null,
      }),
    ];

    const result = detectAnniversary(
      transactions,
      795,
      "annual membership fee"
    );

    expect(result.confidence).toBe("medium");
  });

  it("returns no detection when no matching transactions", () => {
    const transactions: MatcherTransaction[] = [
      makeTx({
        id: "normal_tx",
        amount: 42.5,
        merchantName: "DOORDASH",
      }),
    ];

    const result = detectAnniversary(
      transactions,
      795,
      "annual membership fee"
    );

    expect(result.detected).toBe(false);
    expect(result.transactionId).toBeNull();
    expect(result.anniversaryDate).toBeNull();
    expect(result.confidence).toBe("low");
  });
});
