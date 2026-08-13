/**
 * Extract the headline dollar value from an insight's template vars.
 * Mirrors the per-category logic in InsightCardV2 so Home's action queue
 * and the insights feed always show the same number for the same insight.
 */
export function insightDollarValue(
  category: string,
  templateVars: Record<string, string | number>
): number {
  const vars = templateVars;
  switch (category) {
    case "A1":
    case "A2":
    case "B1":
    case "B2":
    case "B3":
      return Number(vars.remaining ?? vars.annual ?? 0);
    default:
      return Number(vars.amount ?? vars.dollarAmount ?? vars.total ?? 0);
  }
}
