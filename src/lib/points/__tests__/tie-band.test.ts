import { describe, it, expect } from "vitest";
import { isEffectivelyTied, tieThreshold } from "../tie-band";

describe("tie band", () => {
  it("uses a $100 floor for small nets", () => {
    expect(tieThreshold(200, 150)).toBe(100);
    expect(isEffectivelyTied(200, 150)).toBe(true);
    expect(isEffectivelyTied(200, 99)).toBe(false); // gap 101 ≥ 100
  });

  it("scales to 5% of the larger net for big nets", () => {
    // 5% of 4000 = 200 > $100 floor
    expect(tieThreshold(4000, 3900)).toBe(200);
    expect(isEffectivelyTied(4000, 3850)).toBe(true); // gap 150 < 200
    expect(isEffectivelyTied(4000, 3750)).toBe(false); // gap 250 ≥ 200
  });

  it("treats the screenshot case ($2,766 vs $2,691) as tied", () => {
    // Gap $75, threshold max(100, 138.3) — inside the band
    expect(isEffectivelyTied(2766, 2691)).toBe(true);
  });

  it("uses absolute values for negative nets", () => {
    expect(isEffectivelyTied(-50, 40)).toBe(true); // gap 90 < 100
    expect(isEffectivelyTied(-2000, 0)).toBe(false);
  });

  it("is symmetric", () => {
    expect(isEffectivelyTied(2691, 2766)).toBe(isEffectivelyTied(2766, 2691));
  });
});
