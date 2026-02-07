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

interface SummaryBarProps {
  summary: CardSummary;
}

export function SummaryBar({ summary }: SummaryBarProps) {
  const stats = [
    {
      label: "Credits Used",
      tooltip: "Total card benefits redeemed this period",
      value: summary.creditsUsed,
      format: "dollar" as const,
      color: summary.creditsUsed > 0 ? "var(--color-success)" : "var(--text-primary)",
    },
    {
      label: "Effective Fee",
      tooltip: "Annual fee minus credits used",
      value: summary.effectiveFee,
      format: "dollar" as const,
      color: summary.effectiveFee <= 0 ? "var(--color-success)" : "var(--text-primary)",
    },
    {
      label: "ROI",
      tooltip: "Percentage of the annual fee recovered",
      value: summary.roiPercent,
      format: "percent" as const,
      color:
        summary.roiPercent >= 100
          ? "var(--color-success)"
          : summary.roiPercent >= 50
            ? "var(--color-warning)"
            : "var(--text-primary)",
    },
    {
      label: "Value at Risk",
      tooltip: "Unused credits expiring within 14 days",
      value: summary.valueAtRisk,
      format: "dollar" as const,
      color:
        summary.valueAtRisk > 0 ? "var(--color-danger)" : "var(--text-secondary)",
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
