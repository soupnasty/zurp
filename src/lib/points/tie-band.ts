/**
 * Tie band for net-value comparisons.
 *
 * Point valuations and benefit assumptions carry enough uncertainty that
 * small net-value gaps are noise, not signal. Two cards are "effectively
 * tied" when the gap is under $100 or under 5% of the larger net,
 * whichever is greater — a relative band, unlike the old fixed $50.
 *
 * Pure module: safe to import from both server code and client components.
 */

export function tieThreshold(a: number, b: number): number {
  return Math.max(100, 0.05 * Math.max(Math.abs(a), Math.abs(b)));
}

export function isEffectivelyTied(a: number, b: number): boolean {
  return Math.abs(a - b) < tieThreshold(a, b);
}
