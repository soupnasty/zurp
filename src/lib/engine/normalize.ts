/**
 * Normalize a merchant name for matching purposes.
 *
 * - Lowercases
 * - Strips POS terminal prefixes (SQ *, TST*, PP*, etc.)
 * - Strips order numbers, suffixes like *ORDER, #1234
 * - Trims whitespace
 */
export function normalizeMerchantName(raw: string | null): string {
  if (!raw) return "";

  return raw
    .toLowerCase()
    .replace(/^(sq|tst|pp|cke|sp|wf|ck|par)\s*\*\s*/i, "") // Strip POS terminal prefixes
    .replace(/[*#]\s*\d+/g, "") // Remove *12345 or #12345
    .replace(/\s*\*\s*/g, " ") // Clean up asterisks
    .replace(/\s*-\s*order\s*$/i, "") // Remove trailing " - ORDER"
    .replace(/\s+\d{3,}$/g, "") // Remove trailing numeric IDs (3+ digits)
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Check if a normalized merchant name matches any of the given patterns.
 * Uses substring matching (pattern is contained in the name).
 */
export function matchesMerchantPattern(
  normalizedName: string,
  patterns: string[]
): boolean {
  if (!normalizedName || patterns.length === 0) return false;

  return patterns.some((pattern) => normalizedName.includes(pattern.toLowerCase()));
}
