/**
 * Trailing capture rate — the value-prop number.
 *
 * Over the trailing 365 days, how much of the credit value that EXPIRED
 * was actually captured? Only completed periods count: a period still in
 * flight isn't "left on the table" yet, so it contributes to neither side
 * of the ratio.
 *
 * Pure function over benefit-usage rows — no DB dependencies.
 */

export interface CaptureUsageRow {
  amountUsed: number;
  amountRemaining: number;
  cycleEnd: Date;
}

export interface CaptureRate {
  /** 0-100, captured / available over completed periods in the window. */
  pct: number;
  /** Dollars captured across completed periods. */
  captured: number;
  /** Dollars that were available across those periods. */
  available: number;
  /** available - captured: the "left on the table" number. */
  leftOnTable: number;
  /** How many benefit-periods the rate is based on. */
  completedPeriods: number;
}

const WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Compute the trailing capture rate from usage rows.
 * Returns null when no periods have completed in the window yet
 * (fresh accounts) — callers should render a "collecting data" state,
 * not 0%.
 */
export function computeCaptureRate(
  rows: CaptureUsageRow[],
  now: Date = new Date()
): CaptureRate | null {
  const windowStart = now.getTime() - WINDOW_MS;

  let captured = 0;
  let available = 0;
  let completedPeriods = 0;

  for (const row of rows) {
    const end = row.cycleEnd.getTime();
    // Completed within the trailing window only
    if (end >= now.getTime() || end < windowStart) continue;

    const rowAvailable = row.amountUsed + row.amountRemaining;
    if (rowAvailable <= 0) continue;

    captured += row.amountUsed;
    available += rowAvailable;
    completedPeriods += 1;
  }

  if (available <= 0) return null;

  const round2 = (n: number) => Math.round(n * 100) / 100;
  return {
    pct: Math.round((captured / available) * 100),
    captured: round2(captured),
    available: round2(available),
    leftOnTable: round2(available - captured),
    completedPeriods,
  };
}
