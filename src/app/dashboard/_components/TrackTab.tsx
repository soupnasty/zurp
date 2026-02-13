"use client";

import { SummaryStrip } from "./SummaryStrip";
import { PointsSection } from "./PointsSection";
import { BenefitsSection } from "./BenefitsSection";
import { UpcomingResets } from "./UpcomingResets";
import type { CardSummary } from "@/lib/types";
import type {
  ClassifiedBenefitGroup,
  SerializedPointsSummary,
  UpcomingReset,
} from "./types";

interface TrackTabProps {
  cardSummary: CardSummary | null;
  benefitGroups: ClassifiedBenefitGroup[];
  annualBenefits: ClassifiedBenefitGroup[];
  quarterlyBenefits: ClassifiedBenefitGroup[];
  monthlyBenefits: ClassifiedBenefitGroup[];
  pointsSummary: SerializedPointsSummary | null;
  earnConfig: { conservativeCpp: number } | null;
  upcomingResets: UpcomingReset[];
  activeCardName: string;
  activeCardFee: number;
}

function fmt(n: number): string {
  const abs = Math.abs(Math.round(n));
  return n >= 0 ? `+$${abs.toLocaleString()}` : `-$${abs.toLocaleString()}`;
}

export function TrackTab({
  cardSummary,
  benefitGroups,
  annualBenefits,
  quarterlyBenefits,
  monthlyBenefits,
  pointsSummary,
  earnConfig,
  upcomingResets,
  activeCardName,
  activeCardFee,
}: TrackTabProps) {
  const pointsValue = cardSummary?.pointsValueConservative ?? 0;
  const benefitsUsed = cardSummary?.creditsUsed ?? 0;
  const benefitsTotal = cardSummary?.creditsAvailable ?? 0;
  const netValue = cardSummary?.netValue ?? 0;

  // Next reset from upcoming resets
  const nextReset = upcomingResets.length > 0 ? upcomingResets[0] : null;

  const summaryItems = [
    {
      label: "Points earned",
      value: `$${Math.round(pointsValue).toLocaleString()}`,
      valueColor: "var(--color-accent-blue)",
    },
    {
      label: "Benefits used",
      value: `$${Math.round(benefitsUsed).toLocaleString()}`,
      valueColor: "var(--color-accent-purple)",
      sub: benefitsTotal > 0 ? `of $${Math.round(benefitsTotal).toLocaleString()}` : undefined,
    },
    {
      label: "Net value",
      value: fmt(netValue),
      valueColor: netValue >= 0 ? "var(--color-success)" : "var(--color-danger)",
    },
    {
      label: "Next reset",
      value: nextReset ? `${nextReset.daysRemaining} days` : "--",
      valueColor: nextReset ? "var(--color-accent-amber)" : "var(--text-secondary)",
      sub: nextReset ? `$${Math.round(nextReset.totalRemaining)}` : undefined,
    },
  ];

  return (
    <div>
      <SummaryStrip items={summaryItems} />

      {/* Points section */}
      {pointsSummary && earnConfig && pointsSummary.totalPoints > 0 && (
        <div className="mt-8">
          <PointsSection
            pointsSummary={pointsSummary}
            conservativeCpp={earnConfig.conservativeCpp}
          />
        </div>
      )}

      {/* Benefits section */}
      <BenefitsSection
        benefitGroups={benefitGroups}
        annualBenefits={annualBenefits}
        quarterlyBenefits={quarterlyBenefits}
        monthlyBenefits={monthlyBenefits}
      />

      {/* Upcoming resets */}
      <UpcomingResets resets={upcomingResets} />
    </div>
  );
}
