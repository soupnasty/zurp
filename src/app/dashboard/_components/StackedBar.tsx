"use client";

interface StackedBarProps {
  points: number;
  benefits: number;
  fees: number;
  height?: number;
  radius?: number;
  dimmed?: boolean;
}

export function StackedBar({
  points,
  benefits,
  fees,
  height = 16,
  radius = 4,
  dimmed = false,
}: StackedBarProps) {
  const total = points + benefits + fees;
  if (total === 0) return <div style={{ height }} />;

  const pPct = (points / total) * 100;
  const bPct = (benefits / total) * 100;
  const fPct = (fees / total) * 100;

  return (
    <div
      className="flex overflow-hidden"
      style={{
        height,
        borderRadius: radius,
        opacity: dimmed ? 0.3 : 1,
      }}
    >
      {pPct > 0 && (
        <div
          className="bg-[var(--color-accent-blue)]"
          style={{ width: `${pPct}%` }}
        />
      )}
      {bPct > 0 && (
        <div
          className="bg-[var(--color-accent-purple)]"
          style={{ width: `${bPct}%` }}
        />
      )}
      {fPct > 0 && (
        <div
          className="bg-[var(--color-danger)]"
          style={{ width: `${fPct}%` }}
        />
      )}
    </div>
  );
}
