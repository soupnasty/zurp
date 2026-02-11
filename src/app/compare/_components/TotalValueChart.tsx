import type { CardSimulation } from "@/lib/points/types";

// Universal bar colors matching the homepage compare section
const POINTS_COLOR = "linear-gradient(90deg, #3b82f6, #2563eb)";
const BENEFITS_COLOR = "rgba(52, 211, 153, 0.5)";
const FEE_COLOR = "rgba(239, 68, 68, 0.25)";

// Legend dot colors
const POINTS_DOT = "#3b82f6";
const BENEFITS_DOT = "#34d399";
const FEE_DOT = "#ef4444";

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
  // Shared scale: max(points + benefits + annualFee) across all cards
  const maxScale = Math.max(
    ...cards.map((c) => {
      const benefits =
        c.isUsersCard && c.benefitsCaptured !== null
          ? c.benefitsCaptured
          : (c.benefitsSimulated ?? c.benefitsValue);
      return c.pointsValueConservative + benefits + c.annualFee;
    })
  );

  const periodLabel = monthCount >= 12 ? "yr" : `${monthCount} mo`;

  const userCards = cards.filter((c) => c.isUsersCard);
  const altCards = cards.filter((c) => !c.isUsersCard);

  function renderCard(card: CardSimulation) {
    const benefits =
      card.isUsersCard && card.benefitsCaptured !== null
        ? card.benefitsCaptured
        : (card.benefitsSimulated ?? card.benefitsValue);

    const ptsW =
      maxScale > 0
        ? (card.pointsValueConservative / maxScale) * 100
        : 0;
    const benW = maxScale > 0 ? (benefits / maxScale) * 100 : 0;
    const feeW = maxScale > 0 ? (card.annualFee / maxScale) * 100 : 0;

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

        {/* Stacked bar: Points | Benefits | Fee */}
        <div className="flex h-10 rounded-md overflow-hidden bg-[rgba(0,0,0,0.3)] mb-3">
          {ptsW > 0 && (
            <div
              className="flex items-center justify-center text-[13px] font-semibold text-white/90"
              style={{
                width: `${ptsW}%`,
                background: POINTS_COLOR,
                minWidth: ptsW > 10 ? undefined : 0,
              }}
            >
              {ptsW > 10 &&
                `Points ${formatDollars(card.pointsValueConservative)}`}
            </div>
          )}
          {benW > 0 && (
            <div
              className="flex items-center justify-center text-[13px] font-semibold text-white/90"
              style={{
                width: `${benW}%`,
                background: BENEFITS_COLOR,
                minWidth: benW > 10 ? undefined : 0,
              }}
            >
              {benW > 10 && `Benefits ${!card.isUsersCard && card.benefitsSimulated !== null ? "~" : ""}${formatDollars(benefits)}`}
            </div>
          )}
          {feeW > 0 && (
            <div
              className="flex items-center justify-center text-[13px] font-semibold text-white/70"
              style={{
                width: `${feeW}%`,
                background: FEE_COLOR,
                minWidth: feeW > 5 ? undefined : 0,
              }}
            >
              {feeW > 5 && `−${formatDollars(card.annualFee)}`}
            </div>
          )}
        </div>

        {/* Ledger */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--text-secondary)]">
          <span>
            Points:{" "}
            <span className="font-data font-semibold" style={{ color: POINTS_DOT }}>
              {formatDollars(card.pointsValueConservative)}
            </span>
          </span>
          <span>
            Benefits:{" "}
            {card.isUsersCard && card.benefitsCaptured !== null ? (
              <>
                <span className="font-data font-semibold" style={{ color: BENEFITS_DOT }}>
                  {formatDollars(card.benefitsCaptured)}
                </span>{" "}
                <span className="text-[var(--text-secondary)]">
                  of {formatDollars(card.benefitsValue)}
                </span>
              </>
            ) : card.benefitsSimulated !== null ? (
              <>
                <span className="font-data font-semibold" style={{ color: BENEFITS_DOT }}>
                  ~{formatDollars(card.benefitsSimulated)}
                </span>{" "}
                <span className="text-[11px] text-[var(--text-secondary)]">
                  of {formatDollars(card.benefitsValue)}
                </span>
              </>
            ) : (
              <>
                <span className="font-data font-semibold" style={{ color: BENEFITS_DOT }}>
                  {formatDollars(card.benefitsValue)}
                </span>{" "}
                <span className="text-[11px] text-[var(--text-secondary)]">
                  available
                </span>
              </>
            )}
          </span>
          <span>
            Fee:{" "}
            <span className="font-data font-semibold" style={{ color: FEE_DOT }}>
              −{formatDollars(card.annualFee)}
            </span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {userCards.map(renderCard)}

      {altCards.length > 0 && (
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 border-t border-[rgba(255,255,255,0.06)]" />
          <span className="text-[12px] text-[var(--text-secondary)]/60 whitespace-nowrap">
            Benefits simulated from your actual spending
          </span>
          <div className="flex-1 border-t border-[rgba(255,255,255,0.06)]" />
        </div>
      )}

      {altCards.map(renderCard)}
    </div>
  );
}
