"use client";

import { BenefitRow } from "./BenefitRow";
import type { ClassifiedBenefitGroup } from "./types";

interface BenefitsSectionProps {
  benefitGroups: ClassifiedBenefitGroup[];
  annualBenefits: ClassifiedBenefitGroup[];
  biannualBenefits: ClassifiedBenefitGroup[];
  quarterlyBenefits: ClassifiedBenefitGroup[];
  monthlyBenefits: ClassifiedBenefitGroup[];
  subscriptionBenefits: ClassifiedBenefitGroup[];
  quadrennialBenefits: ClassifiedBenefitGroup[];
}

function countByStatus(groups: ClassifiedBenefitGroup[]) {
  let captured = 0, partial = 0, expiring = 0, unused = 0;
  for (const g of groups) {
    if (g.status === "captured") captured++;
    else if (g.status === "partial") partial++;
    else if (g.status === "expiring") expiring++;
    else unused++;
  }
  return { captured, partial, expiring, unused };
}

interface CadenceGroupProps {
  label: string;
  benefits: ClassifiedBenefitGroup[];
}

function CadenceGroup({ label, benefits }: CadenceGroupProps) {
  if (benefits.length === 0) return null;

  return (
    <div className="mt-4 first:mt-0">
      <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 border-b border-[var(--border-subtle)]">
        <span
          className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
        <span
          className="text-[10px] font-bold text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {benefits.length}
        </span>
      </div>
      {benefits.map((g) => (
        <BenefitRow key={g.id} group={g} />
      ))}
    </div>
  );
}

export function BenefitsSection({
  benefitGroups,
  annualBenefits,
  biannualBenefits,
  quarterlyBenefits,
  monthlyBenefits,
  subscriptionBenefits,
  quadrennialBenefits,
}: BenefitsSectionProps) {
  const totalBenefits = benefitGroups.length;
  const totalUsed = benefitGroups.reduce((s, g) => s + g.totalUsed, 0);
  const totalCredit = benefitGroups.reduce((s, g) => s + g.totalCredit, 0);
  const counts = countByStatus(benefitGroups);
  const capturedPct = totalBenefits > 0 ? (counts.captured / totalBenefits) * 100 : 0;

  if (totalBenefits === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-8 text-center">
        <p className="text-sm text-[var(--text-secondary)]">No trackable benefits for this card</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden"
      >
        {/* Header summary */}
        <div className="p-4 md:p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-baseline gap-2 md:gap-3">
            <span
              className="text-[22px] md:text-[28px] font-bold text-[var(--color-accent-purple)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ${Math.round(totalUsed).toLocaleString()}
            </span>
            <span className="text-xs md:text-sm text-[var(--text-secondary)]">
              of ${Math.round(totalCredit).toLocaleString()} captured
            </span>
          </div>
        </div>

        {/* Cadence groups */}
        <CadenceGroup label="Annual" benefits={annualBenefits} />
        <CadenceGroup label="Biannual" benefits={biannualBenefits} />
        <CadenceGroup label="Quarterly" benefits={quarterlyBenefits} />
        <CadenceGroup label="Monthly" benefits={monthlyBenefits} />
        <CadenceGroup label="Subscriptions" benefits={subscriptionBenefits} />
        <CadenceGroup label="Multi-year" benefits={quadrennialBenefits} />
      </div>
    </div>
  );
}
