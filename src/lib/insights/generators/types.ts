import type { BenefitUsageSummary } from "@/lib/types";
import type { CategorizedTransaction } from "@/lib/spending/types";
import type { InsightCandidate } from "../types";

/** Prior cycle usage data for a single benefit period. */
export interface PriorCycleUsage {
  benefitId: string;
  periodKey: string;
  cycle: string;
  creditAmount: number;
  amountUsed: number;
  isFullyUsed: boolean;
  cycleStart: Date;
  cycleEnd: Date;
}

/** Context passed to every generator. */
export interface GeneratorContext {
  userId: string;
  transactions: CategorizedTransaction[];
  benefitUsages: BenefitUsageSummary[];
  annualFee: number;
  cardType: string;
  /** DB-queried competitor map entries for this card type. */
  competitorEntries: CompetitorMapEntry[];
  /** Total benefits captured across all periods for ROI milestones. */
  totalBenefitsCaptured: number;
  /** Existing ROI milestone dedup keys that have already been generated. */
  existingMilestoneKeys: string[];
  /** Prior cycle benefit usage for pattern detection (B1/B3 repeat awareness). */
  priorCycleBenefitUsages: PriorCycleUsage[];
  /** Points earning data (null if no summary exists). */
  pointsData?: {
    totalPoints: number;
    valueConservative: number;
    conservativeCpp: number;
    cardId: string;
    baseRate: number;
    categories: Array<{
      category: string;
      spend: number;
      points: number;
      earnRate: number;
      valueConservative: number;
    }>;
  } | null;
}

export interface CompetitorMapEntry {
  benefitKey: string;
  benefitPartner: string;
  competitorMerchant: string;
  plaidMerchantPattern: string;
  category: string;
  insightType: string;
}

export type InsightGenerator = (ctx: GeneratorContext) => InsightCandidate[];
