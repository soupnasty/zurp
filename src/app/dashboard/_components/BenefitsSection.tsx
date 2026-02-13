"use client";

import { BenefitRow } from "./BenefitRow";
import type { ClassifiedBenefitGroup } from "./types";

interface BenefitsSectionProps {
  benefitGroups: ClassifiedBenefitGroup[];
  annualBenefits: ClassifiedBenefitGroup[];
  biannualBenefits: ClassifiedBenefitGroup[];
  quarterlyBenefits: ClassifiedBenefitGroup[];
  monthlyBenefits: ClassifiedBenefitGroup[];
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
}: BenefitsSectionProps) {
  const totalBenefits = benefitGroups.length;
  const totalUsed = benefitGroups.reduce((s, g) => s + g.totalUsed, 0);
  const totalCredit = benefitGroups.reduce((s, g) => s + g.totalCredit, 0);
  const counts = countByStatus(benefitGroups);
  const capturedPct = totalBenefits > 0 ? (counts.captured / totalBenefits) * 100 : 0;

  if (totalBenefits === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-8 text-center">
        <p className="text-sm text-[var(--text-secondary)]">No trackable benefits for this card</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden"
        style={{ position: "relative" }}
      >
        {/* Top edge glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.2), transparent)",
          }}
        />

        {/* Header summary */}
        <div className="p-4 md:p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-baseline gap-2 md:gap-3 mb-3">
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

          {/* Progress bar */}
          <div
            className="mb-3 overflow-hidden rounded-full"
            style={{ height: 10, background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${capturedPct}%`,
                background: "linear-gradient(90deg, var(--color-accent-purple), var(--color-accent-blue))",
              }}
            />
          </div>

          {/* Status dots */}
          <div className="flex items-center gap-4">
            {counts.captured > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                <span className="text-[11px] text-[var(--text-secondary)]">{counts.captured} captured</span>
              </div>
            )}
            {counts.expiring > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent-amber)]" />
                <span className="text-[11px] text-[var(--text-secondary)]">{counts.expiring} expiring</span>
              </div>
            )}
            {(counts.partial + counts.unused) > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--text-dim)]" />
                <span className="text-[11px] text-[var(--text-secondary)]">{counts.partial + counts.unused} remaining</span>
              </div>
            )}
          </div>
        </div>

        {/* Cadence groups */}
        <CadenceGroup label="Annual" benefits={annualBenefits} />
        <CadenceGroup label="Biannual" benefits={biannualBenefits} />
        <CadenceGroup label="Quarterly" benefits={quarterlyBenefits} />
        <CadenceGroup label="Monthly" benefits={monthlyBenefits} />
      </div>
    </div>
  );
}
