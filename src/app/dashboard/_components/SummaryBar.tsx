"use client";

import { useState } from "react";
import type { CardSummary } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Info } from "lucide-react";

function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      <Info size={14} className="cursor-help text-[var(--text-secondary)]" />
      {open && (
        <span className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-[var(--radius-md)] bg-[var(--surface)] px-3 py-2 text-[var(--text-caption)] normal-case tracking-normal font-normal leading-snug text-[var(--text-primary)] shadow-[var(--shadow-glow)] ring-1 ring-[var(--border)]">
          {text}
        </span>
      )}
    </span>
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
      format: "dollar",
      color: summary.creditsUsed > 0 ? "var(--color-success)" : "var(--text-primary)",
    },
    {
      label: "Effective Fee",
      tooltip: "Annual fee minus credits used — negative means you're ahead",
      value: summary.effectiveFee,
      format: "dollar",
      color: summary.effectiveFee <= 0 ? "var(--color-success)" : "var(--text-primary)",
    },
    {
      label: "ROI",
      tooltip: "Percentage of the annual fee recovered through benefits",
      value: summary.roiPercent,
      format: "percent",
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
      format: "dollar",
      color:
        summary.valueAtRisk > 0 ? "var(--color-danger)" : "var(--text-secondary)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-[var(--space-md)] lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <p className="label-caps flex items-center gap-1.5">
            {stat.label}
            <Tooltip text={stat.tooltip} />
          </p>
          <p
            className="mt-2 font-data text-h2 font-semibold"
            style={{ color: stat.color }}
          >
            {stat.format === "dollar"
              ? `$${Math.abs(stat.value).toLocaleString()}`
              : `${stat.value}%`}
          </p>
        </Card>
      ))}
    </div>
  );
}
