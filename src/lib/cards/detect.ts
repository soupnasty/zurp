import { getAllCardDefinitions } from "./index";

export interface DetectionResult {
  cardId: string;
  confidence: "high" | "low";
}

/**
 * Issuer aliases for Plaid institution name matching.
 * Maps card issuer IDs (which use underscores) to possible institution name
 * fragments that Plaid may return (which use spaces, abbreviations, etc.).
 */
const ISSUER_ALIASES: Record<string, string[]> = {
  wells_fargo: ["wells fargo", "wellsfargo"],
  us_bank: ["us bank", "u.s. bank", "usbank"],
  capital_one: ["capital one", "capitalone"],
  // Apple Card transitioned from Goldman Sachs to Chase in Jan 2026; detect both
  chase: ["apple card", "goldman sachs", "goldman", "gs bank"],
};

/**
 * Detect a card product from Plaid account name / official name strings.
 * Returns null if no match found.
 */
export function detectCard(
  name: string | null | undefined,
  officialName: string | null | undefined
): DetectionResult | null {
  const combined = [name, officialName]
    .filter(Boolean)
    .map((s) => s!.toLowerCase().trim())
    .join(" ");

  if (!combined) return null;

  const cards = getAllCardDefinitions();

  for (const card of cards) {
    // Build match patterns from card name parts
    // e.g. "Chase Sapphire Reserve®" → check for "sapphire reserve"
    const nameParts = card.name
      .replace(/[®™©]/g, "")
      .toLowerCase()
      .trim();

    // High confidence: the distinctive product name appears in account metadata
    // For "Chase Sapphire Reserve" we match on "sapphire reserve"
    const issuer = card.issuer.toLowerCase();
    // Also strip space-separated issuer name (e.g. "wells fargo" from "wells fargo active cash")
    const issuerSpaced = issuer.replace(/_/g, " ");
    const productName = nameParts.replace(issuerSpaced, "").replace(issuer, "").trim();

    if (productName && combined.includes(productName)) {
      return { cardId: card.id, confidence: "high" };
    }

    // Low confidence: full card name matches
    if (combined.includes(nameParts)) {
      return { cardId: card.id, confidence: "high" };
    }
  }

  return null;
}

/**
 * Detect a card with issuer fallback.
 * 1. Try exact detection via detectCard()
 * 2. Fall back to issuer name match (pick highest annualFee)
 * Returns null if no match at all.
 */
export function detectCardWithFallback(
  accountName: string | null | undefined,
  officialName: string | null | undefined,
  institutionName: string | null | undefined
): DetectionResult | null {
  // Try exact detection first
  const exact = detectCard(accountName, officialName);
  if (exact) return exact;

  // Issuer fallback: fuzzy match institution name against card issuers
  // Plaid may return "Chase", "Chase Bank", "JPMorgan Chase", "Wells Fargo", etc.
  if (!institutionName) return null;
  const normalized = institutionName.toLowerCase();
  const allCards = getAllCardDefinitions();
  const issuerCards = allCards.filter((c) => {
    const issuer = c.issuer.toLowerCase();
    // Direct match (works for single-word issuers like "chase", "amex", "citi")
    if (normalized.includes(issuer)) return true;
    // Alias match (for multi-word issuers like "wells_fargo" → "wells fargo")
    const aliases = ISSUER_ALIASES[issuer];
    return aliases?.some((alias) => normalized.includes(alias)) ?? false;
  });
  if (issuerCards.length === 0) return null;

  // Pick the card with the highest annual fee (premium heuristic)
  const best = issuerCards.reduce((a, b) =>
    b.annualFee > a.annualFee ? b : a
  );

  return { cardId: best.id, confidence: "low" };
}
