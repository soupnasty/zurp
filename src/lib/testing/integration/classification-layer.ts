/**
 * Classification Layer
 *
 * Tests classifyForPoints() against each transaction's _meta.intendedCategory oracle.
 * Severity:
 *   "bug"  — engine matched by merchant_name or plaid_category but returned wrong category
 *   "gap"  — engine fell back to "other" (merchant not in map, plaid category not mapped)
 */

import type { GeneratedTransaction } from "../generator/types";
import type { LayerResult, Mismatch } from "./types";
import { emptyLayerResult } from "./types";
import { classifyForPoints } from "../../points/categories";

export function testClassification(
  transactions: GeneratedTransaction[],
  card: string,
  persona: string,
): LayerResult {
  const result = emptyLayerResult("classification");

  for (const tx of transactions) {
    // Skip transactions where classification isn't meaningful
    if (tx._meta.intendedCategory === "other") {
      result.skipped++;
      continue;
    }
    if (tx._meta.edgeCaseTag === "fee_charge") {
      result.skipped++;
      continue;
    }

    result.tested++;

    const assignment = classifyForPoints(
      tx.merchantName,
      tx.plaidCategoryPrimary,
      tx.plaidCategoryDetailed,
    );

    if (assignment.category === tx._meta.intendedCategory) {
      result.passed++;
    } else {
      result.failed++;

      // Determine severity based on how the engine classified
      let severity: Mismatch["severity"];
      let detail: string;

      if (assignment.matchSource === "fallback") {
        // Engine couldn't find merchant in map OR Plaid category — this is a gap
        severity = "gap";
        detail = `Merchant "${tx.merchantName}" not in merchant-map, Plaid category "${tx.plaidCategoryDetailed}" not mapped`;
      } else if (assignment.matchSource === "merchant_name") {
        // Engine found merchant in map but mapped to wrong category
        severity = "bug";
        detail = `merchant-map maps "${assignment.matchedValue}" → "${assignment.category}", expected "${tx._meta.intendedCategory}"`;
      } else {
        // plaid_category match but wrong
        severity = "bug";
        detail = `PLAID_CATEGORY_MAP maps "${tx.plaidCategoryDetailed}" → "${assignment.category}", expected "${tx._meta.intendedCategory}"`;
      }

      result.mismatches.push({
        txId: tx.id,
        merchant: tx.merchantName,
        card,
        persona,
        layer: "classification",
        expected: tx._meta.intendedCategory,
        actual: assignment.category,
        severity,
        detail,
      });
    }
  }

  return result;
}
