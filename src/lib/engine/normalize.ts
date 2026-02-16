/**
 * Well-known merchant aliases: raw variant → canonical normalized name.
 * Applied BEFORE general normalization to handle brand-specific patterns
 * that generic rules can't catch (e.g. "AMZN MKTP US" → "amazon").
 */
const MERCHANT_ALIASES: [RegExp, string][] = [
  // Amazon variants
  [/^amzn\s+mktp\s+us/i, "amazon"],
  [/^amazon\.com/i, "amazon"],
  [/^amazon\s+prime/i, "amazon"],
  [/^amazon\s+fresh/i, "amazon fresh"],

  // Airline ticket number variants (DELTA AIR 0062399, UNITED AIR LINES INC, etc.)
  [/^united\s+air\s*lines?\b/i, "united airlines"],
  [/^delta\s+air\b(?!\s*lines)/i, "delta air lines"],
  [/^american\s+air\b(?!\s*lines)/i, "american airlines"],
  [/^southwest\s+air\b(?!\s*lines)/i, "southwest airlines"],
  [/^jetblue\s+air\b(?!\s*ways)/i, "jetblue"],

  // Uber variants
  [/^uber\s+bv\s+trip\b/i, "uber"],
  [/^uber\s+eats\s+help\.uber\.com/i, "uber eats"],

  // Disney
  [/^walt\s+disney\s*\*?\s*disney\s*plus/i, "disney plus"],

  // TheEdit
  [/^the\s+edit/i, "the edit"],
  [/^theedit/i, "the edit"],

  // Walmart variants (handles walmart.com, walmart+, walmart etc.)
  [/^walmart[\.\+]?\b/i, "walmart"],

  // CLEAR variants
  [/^clearme\.com/i, "clear"],
  [/^clear\s+(me\s+)?inc/i, "clear"],

  // Dunkin variants
  [/^dunkin\s+donuts/i, "dunkin"],

  // ExxonMobil variants (handles both compound and separated forms)
  [/^exxon\s*mobil\b/i, "exxon"],
  [/^exxonmobil\b/i, "exxon"],

  // Best Buy variants (no space after domain strip)
  [/^bestbuy\b/i, "best buy"],

  // Travel portal variants (no space in POS form)
  [/^cititravel\b/i, "citi travel"],
  [/^capitalonetrave\b/i, "capital one travel"],
  [/^ultimate\s+rewards?\s+travel/i, "chase travel"],
  [/^chase\s+ultimate\s+rewards/i, "chase travel"],

  // NYTimes
  [/^nytimes\b/i, "new york times"],

  // Saks variants
  [/^saks\s+fifth\s+ave\b/i, "saks fifth avenue"],
  [/^saks\s+direct\b/i, "saks fifth avenue"],
  [/^saks\.com\b/i, "saks fifth avenue"],

  // IHG brand aliases
  [/^intercontinental\b/i, "ihg"],
  [/^holiday\s+inn\b/i, "ihg"],

  // Amex Travel
  [/^amextravel\b/i, "amex travel"],
];

/**
 * Normalize a merchant name for matching purposes.
 *
 * Pipeline:
 *   1. Lowercase
 *   2. Strip POS terminal prefixes (SQ *, TST*, PP*, etc.)
 *   3. Apply brand-specific aliases (AMZN → amazon, etc.)
 *   4. Strip order numbers, product suffixes (*ORDER, #1234)
 *   5. Strip corporate/location suffixes (INC, LLC, STORE, etc.)
 *   6. Strip .com/.com/bill domain suffixes
 *   7. Strip leading "THE "
 *   8. Normalize whitespace
 */
export function normalizeMerchantName(raw: string | null): string {
  if (!raw) return "";

  let s = raw
    .toLowerCase()
    .replace(/^(sq|tst|pp|cke|sp|wf|ck|par)\s*\*\s*/i, "") // Strip POS terminal prefixes
    .trim();

  // Apply brand-specific aliases early (before stripping suffixes)
  // This allows aliases to override the generic "the " stripping rule
  for (const [pattern, replacement] of MERCHANT_ALIASES) {
    if (pattern.test(s)) {
      s = replacement;
      break; // Only one alias applies
    }
  }

  s = s
    .replace(/[*#]\s*\d+/g, "") // Remove *12345 or #12345
    .replace(/\s*\*\s*/g, " ") // Clean up asterisks
    .replace(/\s*-\s*order\s*$/i, "") // Remove trailing " - ORDER"
    .replace(/\s+\d{3,}$/g, "") // Remove trailing numeric IDs (3+ digits)

    // Strip domain suffixes (.com, .com/bill, etc.)
    .replace(/\.com\b\S*/gi, "")

    // Strip corporate suffixes (including intl for international subsidiaries)
    .replace(/\s*,?\s*\b(inc|llc|ltd|corp|co|intl)\b\.?\s*$/i, "")

    // Strip brand-specific descriptive suffixes
    .replace(
      /\s+(store|hotels?|service\s+station|station|marketplace|interactive|membership|subscription|fitness|premium|computers|delivery|airways|air\s+lines?\s+inc|athletica|creative\s+cloud|car\s+rental|grocery|donuts|w\+)\s*$/i,
      "",
    )

    // Strip product sub-labels (RIDE, TRIP, ORDER, TV, MUSIC, etc.)
    // Note: "eats order" removed — regex greedily matches from "eats" position,
    // stripping both "eats" and "order" from "uber eats order" → "uber" (wrong).
    // Plain "order" suffix stripping correctly produces "uber eats".
    .replace(/\s+(ride|trip|order|tv|music)\s*$/i, "")

    // Strip leading "THE " only if it's not part of a known brand name
    // (known "the " brands are handled via aliases, so if they reach here, preserve them)
    // This avoids accidentally stripping "the " from brands like "the edit"
    .replace(/^the\s+(?!edit\b|athletic\b|onion\b|economist\b)/i, "") // Strip "the " except for known brands

    // Strip /PHARMACY suffix
    .replace(/\/pharmacy\b/i, "")

    // Normalize abbreviations
    .replace(/\bmkt\b/gi, "market")
    .replace(/\bwhse\b/gi, "warehouse")

    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();

  // Remove empty result from over-stripping
  return s || "";
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
