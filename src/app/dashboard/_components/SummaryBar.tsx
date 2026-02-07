import type { CardSummary } from "@/lib/types";
import { Card } from "@/components/ui/Card";

interface SummaryBarProps {
  summary: CardSummary;
}

export function SummaryBar({ summary }: SummaryBarProps) {
  const stats = [
    {
      label: "Credits Used",
      value: summary.creditsUsed,
      format: "dollar",
      color: summary.creditsUsed > 0 ? "var(--color-success)" : "var(--text-primary)",
    },
    {
      label: "Effective Fee",
      value: summary.effectiveFee,
      format: "dollar",
      color: summary.effectiveFee <= 0 ? "var(--color-success)" : "var(--text-primary)",
    },
    {
      label: "ROI",
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
          <p className="label-caps">{stat.label}</p>
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
