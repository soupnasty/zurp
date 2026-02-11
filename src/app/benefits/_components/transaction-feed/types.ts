import type { TransactionWithMatch, BenefitUsageSummary } from "@/lib/types";

export type SortKey = "date" | "amount";
export type SortDir = "asc" | "desc";

export const REMOVE_REASONS = [
  "Doesn't qualify",
  "Duplicate",
  "Other",
] as const;

export const PAGE_SIZE = 50;

export interface TransactionFeedProps {
  transactions: TransactionWithMatch[];
  benefits: BenefitUsageSummary[];
  connectionId?: string;
}

export interface FilterOption {
  id: string;
  name: string;
  benefitIds: string[];
}

export interface TransactionRowContext {
  pendingRemoves: Set<string>;
  pendingAdds: Map<string, string>;
  pendingSkips: Set<string>;
  openRemoveId: string | null;
  openAddId: string | null;
  openReviewId: string | null;
  openHelpId: string | null;
  setOpenRemoveId: (id: string | null) => void;
  setOpenAddId: (id: string | null) => void;
  setOpenReviewId: (id: string | null) => void;
  setOpenHelpId: (id: string | null) => void;
  handleRemove: (tx: TransactionWithMatch, reason: string) => void;
  handleAdd: (tx: TransactionWithMatch, benefit: BenefitUsageSummary) => void;
  handleSkip: (tx: TransactionWithMatch) => void;
  getEligibleBenefits: (txDate: Date) => BenefitUsageSummary[];
  getAmbiguousCandidates: (tx: TransactionWithMatch) => BenefitUsageSummary[];
  confidenceBadge: (tx: TransactionWithMatch) => React.ReactNode;
}
