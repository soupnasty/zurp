import type { BenefitDetails, BenefitUsageSummary } from "@/lib/types";
import type { BenefitTransaction } from "@/lib/queries";

export interface BenefitGroup {
  id: string;
  name: string;
  icon: string;
  totalCredit: number;
  totalUsed: number;
  totalRemaining: number;
  isFullyUsed: boolean;
  manualOverride: boolean;
  daysRemaining: number;
  cycle: string;
  requiresActivation: boolean;
  autoMatchable: boolean;
  sunsetDate: string | null;
  type: string;
  cycleStart: string;
  cycleEnd: string;
  details: BenefitDetails | null;
  benefits: BenefitUsageSummary[];
  ytdUsed?: number;
  benefitTransactions: BenefitTransaction[];
  isActivated?: boolean;
  activatedAt?: string | null;
  activeMonths?: number[];
  brandSlug?: string;
}

export function groupBenefits(
  benefits: BenefitUsageSummary[],
  allTxs: BenefitTransaction[] = []
): BenefitGroup[] {
  // Index transactions by benefitId
  const txByBenefit = new Map<string, BenefitTransaction[]>();
  for (const tx of allTxs) {
    const list = txByBenefit.get(tx.benefitId) ?? [];
    list.push(tx);
    txByBenefit.set(tx.benefitId, list);
  }

  const groups = new Map<string, BenefitGroup>();
  const ungrouped: BenefitGroup[] = [];

  for (const b of benefits) {
    const bTxs = txByBenefit.get(b.benefitId) ?? [];

    if (b.displayGroup) {
      const existing = groups.get(b.displayGroup);
      if (existing) {
        existing.totalCredit += b.creditAmount;
        existing.totalUsed += b.amountUsed;
        existing.totalRemaining += b.amountRemaining;
        existing.isFullyUsed = existing.isFullyUsed && b.isFullyUsed;
        existing.manualOverride = existing.manualOverride || b.manualOverride;
        existing.daysRemaining = Math.min(
          existing.daysRemaining,
          b.daysRemaining
        );
        if (b.ytdUsed != null) {
          existing.ytdUsed = (existing.ytdUsed ?? 0) + b.ytdUsed;
        }
        if (!existing.details && b.details) existing.details = b.details;
        existing.benefits.push(b);
        existing.benefitTransactions.push(...bTxs);
      } else {
        groups.set(b.displayGroup, {
          id: b.displayGroup,
          name: b.displayGroupName || b.benefitName,
          icon: b.displayGroupIcon || b.icon,
          totalCredit: b.creditAmount,
          totalUsed: b.amountUsed,
          totalRemaining: b.amountRemaining,
          isFullyUsed: b.isFullyUsed,
          manualOverride: b.manualOverride,
          daysRemaining: b.daysRemaining,
          cycle: b.cycle,
          requiresActivation: b.requiresActivation,
          autoMatchable: b.autoMatchable,
          sunsetDate: b.sunsetDate,
          type: b.type,
          cycleStart: b.cycleStart.toISOString(),
          cycleEnd: b.cycleEnd.toISOString(),
          details: b.details,
          benefits: [b],
          ytdUsed: b.ytdUsed,
          benefitTransactions: [...bTxs],
          isActivated: b.isActivated,
          activatedAt: b.activatedAt,
          brandSlug: b.brandSlug,
        });
      }
    } else {
      ungrouped.push({
        id: b.benefitId,
        name: b.benefitName,
        icon: b.icon,
        totalCredit: b.creditAmount,
        totalUsed: b.amountUsed,
        totalRemaining: b.amountRemaining,
        isFullyUsed: b.isFullyUsed,
        manualOverride: b.manualOverride,
        daysRemaining: b.daysRemaining,
        cycle: b.cycle,
        requiresActivation: b.requiresActivation,
        autoMatchable: b.autoMatchable,
        sunsetDate: b.sunsetDate,
        type: b.type,
        cycleStart: b.cycleStart.toISOString(),
        cycleEnd: b.cycleEnd.toISOString(),
        details: b.details,
        benefits: [b],
        ytdUsed: b.ytdUsed,
        benefitTransactions: bTxs,
        isActivated: b.isActivated,
        activatedAt: b.activatedAt,
        activeMonths: b.activeMonths,
        brandSlug: b.brandSlug,
      });
    }
  }

  return [...groups.values(), ...ungrouped];
}

export function sortByUrgency(a: BenefitGroup, b: BenefitGroup): number {
  const tierA = urgencyTier(a);
  const tierB = urgencyTier(b);
  if (tierA !== tierB) return tierA - tierB;
  return a.daysRemaining - b.daysRemaining;
}

function urgencyTier(g: BenefitGroup): number {
  if (g.isFullyUsed) return 3; // nothing to do
  if (g.totalUsed > 0) return 1; // partially used -- finish it
  return 2; // untouched -- start it
}
