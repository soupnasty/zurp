"use client";

import { useState, useEffect } from "react";
import type { CardSummary } from "@/lib/types";
import { Info } from "lucide-react";

function FlipCard({
  label,
  tooltip,
  color,
  children,
}: {
  label: string;
  tooltip: string;
  color: string;
  children: React.ReactNode;
}) {
  const [flipped, setFlipped] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  return (
    <div
      className="cursor-pointer [perspective:600px]"
      onMouseEnter={canHover ? () => setFlipped(true) : undefined}
      onMouseLeave={canHover ? () => setFlipped(false) : undefined}
      onClick={!canHover ? () => setFlipped((v) => !v) : undefined}
    >
      <div
        className="relative transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Front */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-md)] shadow-sm [backface-visibility:hidden]">
          <p className="label-caps flex items-center gap-1.5">
            {label}
            <Info size={14} className="text-[var(--text-secondary)]" />
          </p>
          <p
            className="mt-2 font-data text-h3 md:text-h2 font-semibold"
            style={{ color }}
          >
            {children}
          </p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex items-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-md)] shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-[var(--text-body)] leading-relaxed text-[var(--text-primary)]">
            {tooltip}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * ROI color based on pace: compare ROI% against how far through the card year we are.
 * Green = on track or ahead, Warning = falling behind, Danger = significantly behind.
 */
function getRoiColor(roiPct: number, yearProgressPct: number): string {
  if (roiPct >= 100) return "var(--color-success)";

  // Expected ROI at this point in the year (linear pace to break even)
  const expectedPct = yearProgressPct;

  if (roiPct >= expectedPct * 0.5) return "var(--color-success)";
  if (roiPct >= expectedPct * 0.25) return "var(--color-warning)";
  return "var(--color-danger)";
}

interface SummaryBarProps {
  summary: CardSummary;
  capturedLabel: string;
}

export function SummaryBar({ summary, capturedLabel }: SummaryBarProps) {
  const stats = [
    {
      label: "Credits Used",
      tooltip: `Credits captured ${capturedLabel}`,
      value: summary.creditsUsed,
      format: "dollar" as const,
      color: summary.creditsUsed > 0 ? "var(--color-success)" : "var(--text-primary)",
    },
    {
      label: "Net Cost",
      tooltip: "Your annual fee after benefits. Green means it's paid off.",
      value: summary.effectiveFee,
      format: "dollar" as const,
      color: summary.effectiveFee <= 0 ? "var(--color-success)" : "var(--color-danger)",
    },
    {
      label: "ROI",
      tooltip: "Percentage of the annual fee recovered",
      value: summary.roiPercent,
      format: "percent" as const,
      color: getRoiColor(summary.roiPercent, summary.yearProgressPct),
    },
    {
      label: "Expiring Soon",
      tooltip: "Unused credits that reset within 14 days — use them or lose them",
      value: summary.valueAtRisk,
      format: "dollar" as const,
      color:
        summary.valueAtRisk === 0
          ? "var(--color-success)"
          : summary.valueAtRisk >= 50
            ? "var(--color-danger)"
            : "var(--color-warning)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-[var(--space-md)] lg:grid-cols-4">
      {stats.map((stat) => (
        <FlipCard
          key={stat.label}
          label={stat.label}
          tooltip={stat.tooltip}
          color={stat.color}
        >
          {stat.format === "dollar"
            ? `$${Math.abs(stat.value).toLocaleString()}`
            : `${stat.value}%`}
        </FlipCard>
      ))}
    </div>
  );
}
