import type { CardSimulation } from "@/lib/points/types";

const CARD_COLORS: Record<string, { accent: string; accentLight: string }> = {
  chase_sapphire_reserve: {
    accent: "#2d6bc4",
    accentLight: "rgba(45, 107, 196, 0.53)",
  },
  chase_sapphire_preferred: {
    accent: "#2e86c1",
    accentLight: "rgba(46, 134, 193, 0.53)",
  },
  amex_gold: {
    accent: "#C4972A",
    accentLight: "rgba(196, 151, 42, 0.53)",
  },
};

function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface TotalValueChartProps {
  cards: CardSimulation[];
  bestCardId: string;
  monthCount: number;
}

export function TotalValueChart({
  cards,
  bestCardId,
  monthCount,
}: TotalValueChartProps) {
  // Scale bars proportionally to the largest gross value (points + benefits)
  const grossMax = Math.max(
    ...cards.map((c) => {
      const benefits =
        c.isUsersCard && c.benefitsCaptured !== null
          ? c.benefitsCaptured
          : c.benefitsValue;
      return c.pointsValueConservative + benefits;
    })
  );

  const periodLabel = monthCount >= 12 ? "yr" : `${monthCount} mo`;

  return (
    <div className="flex flex-col gap-4">
      {cards.map((card) => {
        const colors = CARD_COLORS[card.cardId] ?? {
          accent: "#58A6FF",
          accentLight: "rgba(88, 166, 255, 0.53)",
        };
        const benefits =
          card.isUsersCard && card.benefitsCaptured !== null
            ? card.benefitsCaptured
            : card.benefitsValue;
        const ptsW =
          grossMax > 0
            ? (card.pointsValueConservative / grossMax) * 100
            : 0;
        const benW = grossMax > 0 ? (benefits / grossMax) * 100 : 0;

        return (
          <div
            key={card.cardId}
            className={`rounded-xl p-5 ${
              card.isUsersCard
                ? "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)]"
                : "bg-[rgba(255,255,255,0.015)] border border-[rgba(255,255,255,0.04)]"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[16px] font-semibold text-[var(--text-primary)]">
                    {card.cardName}
                  </span>
                  {card.isUsersCard && (
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#34D399] bg-[rgba(52,211,153,0.1)]">
                      Your card
                    </span>
                  )}
                  {card.cardId === bestCardId && (
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FBBF24] bg-[rgba(251,191,36,0.1)]">
                      Best value
                    </span>
                  )}
                </div>
                <span className="text-[13px] text-[var(--text-secondary)]">
                  {formatDollars(card.annualFee)}/yr annual fee
                </span>
              </div>
              <div className="text-right">
                <div
                  className="font-data font-bold leading-none"
                  style={{
                    fontSize: 24,
                    color: card.netActual > 0 ? "#34D399" : "#F87171",
                  }}
                >
                  {formatDollars(card.netActual)}
                </div>
                <div className="text-[12px] text-[var(--text-secondary)]">
                  net value / {periodLabel}
                </div>
              </div>
            </div>

            {/* Stacked bar */}
            <div className="flex h-10 rounded-md overflow-hidden bg-[rgba(0,0,0,0.3)] mb-3">
              {ptsW > 0 && (
                <div
                  className="flex items-center justify-center text-[13px] font-semibold text-white"
                  style={{
                    width: `${ptsW}%`,
                    backgroundColor: colors.accent,
                    minWidth: ptsW > 12 ? undefined : 0,
                  }}
                >
                  {ptsW > 12 &&
                    `Points ${formatDollars(card.pointsValueConservative)}`}
                </div>
              )}
              {benW > 0 && (
                <div
                  className="flex items-center justify-center text-[13px] font-semibold text-white"
                  style={{
                    width: `${benW}%`,
                    backgroundColor: colors.accentLight,
                    minWidth: benW > 12 ? undefined : 0,
                  }}
                >
                  {benW > 12 && `Benefits ${formatDollars(benefits)}`}
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--text-secondary)]">
              <span>
                Points:{" "}
                <span className="font-data text-[var(--text-primary)]">
                  {formatDollars(card.pointsValueConservative)}
                </span>
              </span>
              <span className="text-[var(--border-default)]">|</span>
              <span>
                Benefits:{" "}
                <span className="font-data text-[var(--text-primary)]">
                  {card.isUsersCard && card.benefitsCaptured !== null ? (
                    <>
                      {formatDollars(card.benefitsCaptured)}{" "}
                      <span className="text-[var(--text-secondary)]">
                        of {formatDollars(card.benefitsValue)}
                      </span>
                    </>
                  ) : (
                    <>
                      {formatDollars(card.benefitsValue)}{" "}
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        available
                      </span>
                    </>
                  )}
                </span>
              </span>
              <span className="text-[var(--border-default)]">|</span>
              <span>
                Fee:{" "}
                <span className="font-data text-[#F87171]">
                  −{formatDollars(card.annualFee)}
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
