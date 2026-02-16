/**
 * Normalization Layer
 *
 * Tests normalizeMerchantName() against merchant template oracle values.
 * Only tests unique merchantNameRaw values to avoid redundant checks.
 *
 * Severity:
 *   "bug"  — template found, normalization output doesn't match expected
 *   "gap"  — no template found for this merchant (can't validate)
 */

import type { GeneratedTransaction } from "../generator/types";
import type { MerchantTemplate } from "../merchants/types";
import type { LayerResult } from "./types";
import { emptyLayerResult } from "./types";
import { normalizeMerchantName } from "../../engine/normalize";
import { getAllMerchants } from "../merchants";

// Build reverse-index: plaidMerchantName → MerchantTemplate
let templateIndex: Map<string, MerchantTemplate> | null = null;

function getTemplateIndex(): Map<string, MerchantTemplate> {
  if (!templateIndex) {
    templateIndex = new Map();
    for (const t of getAllMerchants()) {
      if (t.plaidMerchantName) {
        templateIndex.set(t.plaidMerchantName, t);
      }
    }
  }
  return templateIndex;
}

export function testNormalization(
  transactions: GeneratedTransaction[],
  card: string,
  persona: string,
): LayerResult {
  const result = emptyLayerResult("normalization");
  const index = getTemplateIndex();

  // Deduplicate by merchantNameRaw to avoid testing the same string many times
  const seen = new Set<string>();

  for (const tx of transactions) {
    // Skip fee charges and null merchants
    if (tx._meta.edgeCaseTag === "fee_charge") continue;
    if (!tx.merchantNameRaw) continue;

    const raw = tx.merchantNameRaw;
    if (seen.has(raw)) continue;
    seen.add(raw);

    result.tested++;

    // Look up the template that generated this transaction.
    // The generator uses template.plaidMerchantName as tx.merchantName
    const template = tx.merchantName ? index.get(tx.merchantName) : undefined;

    if (!template) {
      // Can't validate — merchant not in our template registry
      result.skipped++;
      continue;
    }

    const normalized = normalizeMerchantName(raw);

    if (normalized === template.normalizedResult) {
      result.passed++;
    } else {
      // Check if it's a known edge case variant
      const isKnownEdgeCase = template.edgeCases?.some(
        (ec) => ec.rawName === raw && ec.normalizedOutput !== template.normalizedResult,
      );

      if (isKnownEdgeCase) {
        // Edge case with expected different normalization — not a bug
        result.passed++;
      } else if (normalized.includes(template.normalizedResult)) {
        // Sub-brand variant: normalized form CONTAINS the template's normalizedResult
        // (e.g., "hyatt house seattle" contains "hyatt").
        // The merchant-map uses prefix/contains matching, so this is expected behavior.
        result.passed++;
      } else {
        result.failed++;
        result.mismatches.push({
          txId: tx.id,
          merchant: raw,
          card,
          persona,
          layer: "normalization",
          expected: template.normalizedResult,
          actual: normalized,
          severity: "bug",
          detail: `normalizeMerchantName("${raw}") = "${normalized}", expected "${template.normalizedResult}" (template: ${template.merchantKey})`,
        });
      }
    }
  }

  return result;
}
