import { cardRegistry } from "@/lib/cards";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate a string is a well-formed UUID v4.
 */
export function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

/**
 * Validate a card type string exists in the card registry.
 * Returns false for any string not matching a known card ID.
 */
export function isValidCardType(cardType: string): boolean {
  return cardRegistry.some((card) => card.id === cardType);
}

/**
 * Safely parse JSON with a fallback value.
 * Returns the fallback if parsing fails (corrupted data, invalid JSON, etc.)
 */
export function safeJsonParse<T>(
  json: string | null | undefined,
  fallback: T
): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    console.error("Failed to parse JSON:", json?.slice(0, 100));
    return fallback;
  }
}
