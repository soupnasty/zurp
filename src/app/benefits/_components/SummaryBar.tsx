"use client";

import { useState, useEffect } from "react";
import type { CardSummary } from "@/lib/types";
import { Info } from "lucide-react";

function FlipCard({
  label,
  tooltip,
  color,
  subText,
  children,
}: {
  label: string;
  tooltip: string;
  color: string;
  subText?: string;
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
        <div
          className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-md)] shadow-sm [backface-visibility:hidden]"
          style={{ minHeight: "6.5rem" }}
        >
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
          <p
            className="mt-0.5 text-[var(--text-caption)] text-[var(--text-secondary)]"
            style={{ minHeight: "1.25rem" }}
          >
            {subText ?? "\u00A0"}
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
  capturedLabel: string;
}

export function SummaryBar({ summary, capturedLabel }: SummaryBarProps) {
  const hasPoints = summary.pointsEarned !== null && summary.pointsEarned > 0;
  const cppLabel = summary.conservativeCpp
    ? `${summary.conservativeCpp}¢ each`
    : "";

  const stats = [
    {
      label: "Points Earned",
      tooltip: hasPoints
        ? `${summary.pointsEarned!.toLocaleString()} points valued at ${cppLabel} (conservative). Transfer partners may yield more.`
        : "Connect your card and make purchases to start earning points",
      value: hasPoints
        ? `$${summary.pointsValueConservative!.toLocaleString()}`
        : "$0",
      subText: hasPoints
        ? `from ${summary.pointsEarned!.toLocaleString()} pts`
        : "no transactions yet",
      color: hasPoints ? "var(--accent)" : "var(--text-primary)",
    },
    {
      label: "Benefits Used",
      tooltip: `Credits captured ${capturedLabel}`,
      value: `$${Math.abs(summary.creditsUsed).toLocaleString()}`,
      subText: `of $${summary.creditsAvailable.toLocaleString()} available`,
      color:
        summary.creditsUsed > 0
          ? "var(--color-success)"
          : "var(--text-primary)",
    },
    {
      label: "Net Value",
      tooltip:
        "Credits + points value - annual fee. Green means your card is paying for itself.",
      value: `${
        summary.netValue !== null && summary.netValue >= 0 ? "+" : ""
      }$${Math.abs(
        summary.netValue ?? summary.creditsUsed - summary.annualFee
      ).toLocaleString()}`,
      subText: `against $${summary.annualFee.toLocaleString()} fee`,
      color:
        (summary.netValue ?? summary.creditsUsed - summary.annualFee) >= 0
          ? "var(--color-success)"
          : "var(--color-danger)",
    },
    {
      label: "Expiring Soon",
      tooltip:
        "Unused credits that reset within 14 days — use them or lose them",
      value: `$${Math.abs(summary.valueAtRisk).toLocaleString()}`,
      subText: "within 14 days",
      color:
        summary.valueAtRisk === 0
          ? "var(--text-secondary)"
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
          subText={stat.subText}
        >
          {stat.value}
        </FlipCard>
      ))}
    </div>
  );
}
