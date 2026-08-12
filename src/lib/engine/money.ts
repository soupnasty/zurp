/**
 * Round a dollar amount to whole cents.
 *
 * Usage amounts are accumulated as floats; rounding at every accumulation
 * keeps values on the cent grid so threshold comparisons like
 * `amountUsed >= creditAmount` can't miss by 1e-15.
 */
export function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}
