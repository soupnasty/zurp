"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
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
  biannualBenefits: ClassifiedBenefitGroup[];
  quarterlyBenefits: ClassifiedBenefitGroup[];
  monthlyBenefits: ClassifiedBenefitGroup[];
  subscriptionBenefits: ClassifiedBenefitGroup[];
  quadrennialBenefits: ClassifiedBenefitGroup[];
  pointsSummary: SerializedPointsSummary | null;
  earnConfig: { conservativeCpp: number } | null;
  upcomingResets: UpcomingReset[];
  activeCardName: string;
  activeCardFee: number;
  anniversaryDate: string | null;
}

export function TrackTab({
  cardSummary,
  benefitGroups,
  annualBenefits,
  biannualBenefits,
  quarterlyBenefits,
  monthlyBenefits,
  subscriptionBenefits,
  quadrennialBenefits,
  pointsSummary,
  earnConfig,
  upcomingResets,
  activeCardName,
  activeCardFee,
  anniversaryDate,
}: TrackTabProps) {
  const pointsValue = cardSummary?.pointsValueConservative ?? 0;

  // Compute current anniversary year bounds + renewal info
  const { cycleLabel, renewalLabel } = (() => {
    if (!anniversaryDate) {
      return {
        cycleLabel: activeCardFee > 0 ? `$${activeCardFee}/yr fee` : "$0 annual fee",
        renewalLabel: null,
      };
    }
    const anniv = new Date(anniversaryDate);
    const now = new Date();
    // UTC getters — anniversary dates are calendar dates stored at UTC midnight
    const annivMonth = anniv.getUTCMonth();
    const annivDay = anniv.getUTCDate();
    let yearStart = new Date(now.getFullYear(), annivMonth, annivDay);
    if (yearStart > now) {
      yearStart = new Date(now.getFullYear() - 1, annivMonth, annivDay);
    }
    const yearEnd = new Date(yearStart.getFullYear() + 1, annivMonth, annivDay - 1);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    // Next renewal date
    let nextRenewal = new Date(now.getFullYear(), annivMonth, annivDay);
    if (nextRenewal <= now) {
      nextRenewal = new Date(now.getFullYear() + 1, annivMonth, annivDay);
    }
    const daysUntil = Math.ceil((nextRenewal.getTime() - now.getTime()) / 86400000);
    const renewalStr = activeCardFee > 0
      ? `$${activeCardFee} fee renews ${fmt(nextRenewal)}`
      : null;

    return {
      cycleLabel: `${fmt(yearStart)} – ${fmt(yearEnd)}`,
      renewalLabel: renewalStr,
    };
  })();
  // Derive from benefit groups (same source as BenefitsSection) for consistency
  const benefitsUsed = benefitGroups.reduce((s, g) => s + g.totalUsed, 0);
  const benefitsTotal = benefitGroups.reduce((s, g) => s + g.totalCredit, 0);
  // Expiring soon: total value of benefits resetting within 14 days
  const expiringTotal = upcomingResets.reduce((s, r) => s + r.totalRemaining, 0);
  const soonestDays = upcomingResets.length > 0 ? upcomingResets[0].daysRemaining : null;

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
      label: "Expiring soon",
      value: expiringTotal > 0 ? `$${Math.round(expiringTotal).toLocaleString()}` : "$0",
      valueColor: expiringTotal > 0 ? "var(--color-accent-amber)" : "var(--text-secondary)",
      sub: soonestDays !== null ? `within ${soonestDays} days` : undefined,
    },
  ];

  return (
    <div>
      {/* Card header */}
      <div className="mb-5">
        <span
          className="text-[10px] font-bold uppercase tracking-[2.5px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Your card
        </span>
        <h1 className="mt-1 text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          {activeCardName}
        </h1>
        <span
          className="text-[10px] md:text-[12px] text-[var(--text-dim)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {cycleLabel}
          {renewalLabel && (
            <>
              <span className="hidden md:inline"> · {renewalLabel}</span>
              <span className="block md:hidden mt-0.5">{renewalLabel}</span>
            </>
          )}
        </span>
      </div>

      {/* Missing anniversary date banner */}
      {!anniversaryDate && (
        <Link
          href="/settings"
          className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:brightness-110"
          style={{
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.15)",
          }}
        >
          <Calendar className="h-4 w-4 shrink-0" style={{ color: "#fbbf24" }} />
          <span className="text-sm text-[var(--text-secondary)]">
            Set your card anniversary date for accurate benefit tracking
          </span>
          <span
            className="ml-auto shrink-0 text-xs font-medium"
            style={{ color: "#fbbf24" }}
          >
            Settings →
          </span>
        </Link>
      )}

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
      <div className="mt-8 mb-3 flex items-baseline justify-between">
        <h2
          className="text-[11px] font-bold uppercase tracking-[2.5px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Benefits used
        </h2>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-dim)",
            letterSpacing: "0.5px",
          }}
        >
          tap benefit for details
        </span>
      </div>
      <BenefitsSection
        benefitGroups={benefitGroups}
        annualBenefits={annualBenefits}
        biannualBenefits={biannualBenefits}
        quarterlyBenefits={quarterlyBenefits}
        monthlyBenefits={monthlyBenefits}
        subscriptionBenefits={subscriptionBenefits}
        quadrennialBenefits={quadrennialBenefits}
      />

      {/* Upcoming resets */}
      {upcomingResets.length > 0 && (
        <h2
          className="mt-8 mb-3 text-[11px] font-bold uppercase tracking-[2.5px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Expiring soon
        </h2>
      )}
      <UpcomingResets resets={upcomingResets} />
    </div>
  );
}
