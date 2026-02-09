import { getAllCardDefinitions } from "./index";

export interface DetectionResult {
  cardId: string;
  confidence: "high" | "low";
}

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
    const productName = nameParts.replace(issuer, "").trim();

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
  // Plaid may return "Chase", "Chase Bank", "JPMorgan Chase", etc.
  if (!institutionName) return null;
  const normalized = institutionName.toLowerCase();
  const allCards = getAllCardDefinitions();
  const issuerCards = allCards.filter((c) => normalized.includes(c.issuer.toLowerCase()));
  if (issuerCards.length === 0) return null;

  // Pick the card with the highest annual fee (premium heuristic)
  const best = issuerCards.reduce((a, b) =>
    b.annualFee > a.annualFee ? b : a
  );

  return { cardId: best.id, confidence: "low" };
}
