"use client";

interface StackedBarProps {
  points: number;
  benefits: number;
  fees: number;
  height?: number;
  radius?: number;
  dimmed?: boolean;
  /** When provided, renders a faint ghost extension showing upside point value potential. */
  pointsUpside?: number;
  /** When provided, scales the filled bar width relative to this max gross value. */
  maxGross?: number;
}

export function StackedBar({
  points,
  benefits,
  fees,
  height = 16,
  radius = 4,
  dimmed = false,
  pointsUpside,
  maxGross,
}: StackedBarProps) {
  const gross = points + benefits + fees;
  if (gross === 0) return <div style={{ height }} />;

  // Proportional fill: how wide is this bar relative to maxGross?
  const fillPct = maxGross && maxGross > 0 ? Math.min((gross / maxGross) * 100, 100) : 100;

  const pPct = (points / gross) * 100;
  const bPct = (benefits / gross) * 100;
  const fPct = (fees / gross) * 100;

  // Ghost: extra upside points beyond the current mode's value
  const ghostExtra = pointsUpside && pointsUpside > points ? pointsUpside - points : 0;
  const totalWithGhost = gross + ghostExtra;
  const ghostPct = ghostExtra > 0 ? (ghostExtra / totalWithGhost) * 100 : 0;

  // Rescale actual segments if ghost is present
  const scale = ghostExtra > 0 ? gross / totalWithGhost : 1;
  const pPctScaled = pPct * scale;
  const bPctScaled = bPct * scale;
  const fPctScaled = fPct * scale;

  return (
    <div
      style={{
        height,
        borderRadius: radius,
        background: "rgba(255,255,255,0.03)",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        className="flex overflow-hidden"
        style={{
          height,
          borderRadius: radius,
          opacity: dimmed ? 0.3 : 1,
          width: `${fillPct}%`,
        }}
      >
        {pPctScaled > 0 && (
          <div
            className="bg-[var(--color-accent-blue)]"
            style={{ width: `${pPctScaled}%` }}
          />
        )}
        {ghostPct > 0 && (
          <div
            style={{
              width: `${ghostPct}%`,
              background: "rgba(96,165,250,0.15)",
            }}
          />
        )}
        {bPctScaled > 0 && (
          <div
            className="bg-[var(--color-accent-purple)]"
            style={{ width: `${bPctScaled}%` }}
          />
        )}
        {fPctScaled > 0 && (
          <div
            className="bg-[var(--color-danger)]"
            style={{ width: `${fPctScaled}%` }}
          />
        )}
      </div>
    </div>
  );
}
