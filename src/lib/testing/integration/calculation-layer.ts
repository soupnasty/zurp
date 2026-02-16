/**
 * Calculation Layer
 *
 * Tests calculatePointsForTransaction() for crash safety and basic sanity.
 * Processes transactions in date order so cap state accumulates realistically.
 *
 * Severity:
 *   "bug"  — calculator threw an error or returned negative points/rate
 */

import type { GeneratedTransaction } from "../generator/types";
import type { LayerResult } from "./types";
import { emptyLayerResult } from "./types";
import { classifyForPoints } from "../../points/categories";
import { calculatePointsForTransaction } from "../../points/calculator";
import { toCalculatorTx, buildCapState } from "./adapters";
import type { EarnConfig, CapState } from "../../points/types";

export function testCalculation(
  transactions: GeneratedTransaction[],
  earnConfig: EarnConfig | undefined,
  card: string,
  persona: string,
): LayerResult {
  const result = emptyLayerResult("calculation");

  if (!earnConfig) {
    // No earn config for this card — skip entirely
    result.skipped = transactions.length;
    return result;
  }

  // Sort by date for realistic cap accumulation
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const capState: CapState = buildCapState(earnConfig);

  for (const tx of sorted) {
    // Skip fee charges and non-positive amounts
    if (tx._meta.edgeCaseTag === "fee_charge") {
      result.skipped++;
      continue;
    }
    if (tx.amount <= 0) {
      result.skipped++;
      continue;
    }

    result.tested++;

    try {
      // Classify first
      const assignment = classifyForPoints(
        tx.merchantName,
        tx.plaidCategoryPrimary,
        tx.plaidCategoryDetailed,
      );

      // Build calculator input
      const calcTx = toCalculatorTx(tx, assignment);

      // Calculate points
      const earnResult = calculatePointsForTransaction(
        calcTx,
        earnConfig,
        capState,
      );

      // Sanity checks
      if (earnResult.points < 0) {
        result.failed++;
        result.mismatches.push({
          txId: tx.id,
          merchant: tx.merchantName,
          card,
          persona,
          layer: "calculation",
          expected: "points >= 0",
          actual: `points = ${earnResult.points}`,
          severity: "bug",
          detail: `Negative points for "${tx.merchantName}" $${tx.amount} (category: ${assignment.category}, rate: ${earnResult.earnRate}x)`,
        });
      } else if (earnResult.earnRate < 0) {
        result.failed++;
        result.mismatches.push({
          txId: tx.id,
          merchant: tx.merchantName,
          card,
          persona,
          layer: "calculation",
          expected: "earnRate >= 0",
          actual: `earnRate = ${earnResult.earnRate}`,
          severity: "bug",
          detail: `Negative earn rate for "${tx.merchantName}" $${tx.amount}`,
        });
      } else {
        result.passed++;
      }
    } catch (err) {
      result.failed++;
      result.mismatches.push({
        txId: tx.id,
        merchant: tx.merchantName,
        card,
        persona,
        layer: "calculation",
        expected: "no error",
        actual: `ERROR: ${err instanceof Error ? err.message : String(err)}`,
        severity: "bug",
        detail: `Calculator crashed on "${tx.merchantName}" $${tx.amount} (${card}/${persona})`,
      });
    }
  }

  return result;
}
