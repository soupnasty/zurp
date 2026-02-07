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
