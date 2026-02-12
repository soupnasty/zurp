import type { BenefitUsageSummary } from "@/lib/types";
import type { CategorizedTransaction } from "@/lib/spending/types";
import type { InsightCandidate } from "../types";

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
