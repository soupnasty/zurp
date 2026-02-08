interface SpendingHeadlineProps {
  total: number;
}

export function SpendingHeadline({ total }: SpendingHeadlineProps) {
  const formattedTotal = total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-lg)] text-center">
      <p className="label-caps mb-[var(--space-xs)] text-[var(--text-secondary)]">
        Total Spending
      </p>
      <p className="font-data text-display font-bold tracking-tight text-[var(--text-primary)]">
        {formattedTotal}
      </p>
    </div>
  );
}
