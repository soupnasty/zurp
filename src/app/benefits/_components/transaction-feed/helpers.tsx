import { Badge } from "@/components/ui/Badge";
import type { TransactionWithMatch, BenefitUsageSummary } from "@/lib/types";
import { normalizeMerchantName, matchesMerchantPattern } from "@/lib/engine/normalize";
import type { SortKey, SortDir, FilterOption } from "./types";

export function confidenceBadge(tx: TransactionWithMatch) {
  if (tx.matchMethod === "manual") {
    return <Badge variant="info">manual</Badge>;
  }
  if (!tx.matchConfidence) return null;
  const variant =
    tx.matchConfidence === "high"
      ? "success"
      : tx.matchConfidence === "medium"
        ? "warning"
        : "danger";
  return <Badge variant={variant as any}>{tx.matchConfidence}</Badge>;
}

export function sortTransactions(
  filtered: TransactionWithMatch[],
  sortKey: SortKey,
  sortDir: SortDir
): TransactionWithMatch[] {
  return [...filtered].sort((a, b) => {
    let cmp: number;
    if (sortKey === "date") {
      cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      cmp = a.amount - b.amount;
    }
    return sortDir === "desc" ? -cmp : cmp;
  });
}

export function sortIndicator(sortKey: SortKey, sortDir: SortDir, key: SortKey): string {
  if (sortKey !== key) return "";
  return sortDir === "desc" ? " \u2193" : " \u2191";
}

export function getEligibleBenefits(
  benefits: BenefitUsageSummary[],
  txDate: Date
): BenefitUsageSummary[] {
  const d = new Date(txDate);
  return benefits.filter(
    (b) =>
      b.type === "credit" &&
      b.amountRemaining > 0 &&
      d >= new Date(b.cycleStart) &&
      d <= new Date(b.cycleEnd)
  );
}

export function getAmbiguousCandidates(
  benefits: BenefitUsageSummary[],
  tx: TransactionWithMatch
): BenefitUsageSummary[] {
  const d = new Date(tx.date);
  const normalized = normalizeMerchantName(tx.merchantName);
  return benefits.filter((b) => {
    if (b.type !== "credit" || b.autoMatchable) return false;
    if (b.amountRemaining <= 0) return false;
    if (d < new Date(b.cycleStart) || d > new Date(b.cycleEnd)) return false;
    const merchantMatch = matchesMerchantPattern(normalized, b.merchantPatterns);
    const categoryMatch =
      b.plaidCategories.length > 0 &&
      b.plaidCategories.some(
        (cat) =>
          tx.plaidCategoryPrimary?.includes(cat) ||
          tx.plaidCategoryDetailed?.includes(cat)
      );
    return merchantMatch || categoryMatch;
  });
}

export function buildFilterOptions(benefits: BenefitUsageSummary[]): FilterOption[] {
  const seen = new Set<string>();
  const options: FilterOption[] = [];

  for (const b of benefits) {
    if (b.type !== "credit") continue;
    const key = b.displayGroup || b.benefitId;
    if (seen.has(key)) {
      const existing = options.find((o) => o.id === key);
      if (existing) existing.benefitIds.push(b.benefitId);
      continue;
    }
    seen.add(key);
    options.push({
      id: key,
      name: b.displayGroupName || b.benefitName,
      benefitIds: [b.benefitId],
    });
  }
  return options;
}

export function computeFilterCounts(
  allTransactions: TransactionWithMatch[],
  filterOptions: FilterOption[]
): Record<string, number> {
  const counts: Record<string, number> = { all: allTransactions.length };
  for (const opt of filterOptions) {
    counts[opt.id] = allTransactions.filter((tx) =>
      opt.benefitIds.includes(tx.benefitId ?? "")
    ).length;
  }
  counts["unmatched"] = allTransactions.filter(
    (tx) => tx.matchedStatus === "unmatched"
  ).length;
  counts["ambiguous"] = allTransactions.filter(
    (tx) => tx.matchedStatus === "ambiguous"
  ).length;
  return counts;
}

export function applyFilter(
  allTransactions: TransactionWithMatch[],
  filterBenefitId: string | null,
  filterOptions: FilterOption[]
): TransactionWithMatch[] {
  if (filterBenefitId === null) return allTransactions;
  if (filterBenefitId === "unmatched") {
    return allTransactions.filter((tx) => tx.matchedStatus === "unmatched");
  }
  if (filterBenefitId === "ambiguous") {
    return allTransactions.filter((tx) => tx.matchedStatus === "ambiguous");
  }
  const option = filterOptions.find((o) => o.id === filterBenefitId);
  if (option) {
    return allTransactions.filter((tx) => option.benefitIds.includes(tx.benefitId ?? ""));
  }
  return allTransactions.filter((tx) => tx.benefitId === filterBenefitId);
}
