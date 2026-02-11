import type { CategoryWinner, CardSimulation } from "@/lib/points/types";
import { BenefitIcon } from "@/components/ui/BenefitIcon";

function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

interface CategoryBreakdownProps {
  categories: CategoryWinner[];
  cards: CardSimulation[];
}

export function CategoryBreakdown({
  categories,
  cards,
}: CategoryBreakdownProps) {
  const visibleCategories = categories.filter((c) => c.totalSpend >= 50);

  const interestingCats = visibleCategories.filter((c) => {
    const rates = c.cards.map((card) => card.earnRate);
    return new Set(rates).size > 1;
  });
  const boringCats = visibleCategories.filter((c) => {
    const rates = c.cards.map((card) => card.earnRate);
    return new Set(rates).size <= 1;
  });
  const boringSpend = boringCats.reduce((s, c) => s + c.totalSpend, 0);

  const colTemplate = `1fr repeat(${cards.length}, minmax(120px, 1fr))`;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Header */}
        <div
          className="grid gap-2 px-3 pb-3 border-b border-[var(--border-default)]"
          style={{ gridTemplateColumns: colTemplate }}
        >
          <div className="label-caps text-[var(--text-secondary)]">
            Category
          </div>
          {cards.map((card) => (
            <div
              key={card.cardId}
              className="text-right label-caps text-[var(--text-secondary)]"
            >
              {card.cardName}
            </div>
          ))}
        </div>

        {/* Interesting categories */}
        {[...interestingCats]
          .sort((a, b) => b.totalSpend - a.totalSpend)
          .map((cat) => {
            const maxValue = Math.max(...cat.cards.map((c) => c.value));

            return (
              <div
                key={cat.category}
                className="grid gap-2 px-3 py-3.5 border-b border-[rgba(255,255,255,0.03)] items-center hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                style={{ gridTemplateColumns: colTemplate }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <BenefitIcon
                      icon={cat.icon}
                      className="w-4 h-4 text-[var(--text-secondary)]"
                    />
                    <span className="text-[14px] font-medium text-[var(--text-primary)]">
                      {cat.label}
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--text-secondary)]/60 mt-0.5 pl-[22px]">
                    {formatDollars(cat.totalSpend)} · {cat.transactionCount} txns
                  </div>
                  {cat.cards.some((c) => c.capNote) && (
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 pl-[22px] italic">
                      {cat.cards.find((c) => c.capNote)?.capNote}
                    </div>
                  )}
                </div>
                {cat.cards.map((cardEntry) => {
                  const isWinner =
                    cardEntry.isWinner &&
                    cat.cards.filter((c) => c.value === maxValue).length === 1;
                  return (
                    <div key={cardEntry.cardId} className="text-right">
                      <span
                        className={`font-data text-[14px] font-semibold ${
                          isWinner
                            ? "text-[var(--color-success)]"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        {formatDollars(cardEntry.value)}
                      </span>
                      <div className="font-data text-[11px] text-[var(--text-secondary)]">
                        {cardEntry.earnRate}x ·{" "}
                        {formatNumber(cardEntry.points)} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

        {/* Boring categories */}
        {boringCats.length > 0 && (
          <div
            className="grid gap-2 px-3 py-3.5 border-b border-[rgba(255,255,255,0.03)] items-center"
            style={{ gridTemplateColumns: colTemplate }}
          >
            <div>
              <div className="text-[14px] font-medium text-[var(--text-secondary)]">
                Other spending (all 1x)
              </div>
              <div className="text-[12px] text-[var(--text-secondary)]/60 mt-0.5">
                {formatDollars(boringSpend)} · gas, shopping, bills, etc.
              </div>
            </div>
            {cards.map((card) => {
              const totalValue = boringCats.reduce((sum, cat) => {
                const entry = cat.cards.find(
                  (c) => c.cardId === card.cardId
                );
                return sum + (entry?.value ?? 0);
              }, 0);
              const totalPoints = boringCats.reduce((sum, cat) => {
                const entry = cat.cards.find(
                  (c) => c.cardId === card.cardId
                );
                return sum + (entry?.points ?? 0);
              }, 0);
              return (
                <div key={card.cardId} className="text-right">
                  <div className="font-data text-[14px] font-semibold text-[var(--text-secondary)]">
                    {formatDollars(totalValue)}
                  </div>
                  <div className="font-data text-[11px] text-[var(--text-secondary)]/60">
                    1x · {formatNumber(totalPoints)} pts
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Total row */}
        <div
          className="grid gap-2 px-3 pt-4 border-t border-[rgba(255,255,255,0.08)] mt-1 items-center"
          style={{ gridTemplateColumns: colTemplate }}
        >
          <div className="text-[14px] font-semibold text-[var(--text-primary)]">
            Total points value
          </div>
          {(() => {
            const maxValue = Math.max(
              ...cards.map((c) => c.pointsValueConservative)
            );
            return cards.map((card) => {
              const isWinner =
                card.pointsValueConservative === maxValue &&
                cards.filter((c) => c.pointsValueConservative === maxValue)
                  .length === 1;
              return (
                <div key={card.cardId} className="text-right">
                  <span
                    className={`font-data text-[16px] font-bold ${
                      isWinner
                        ? "text-[var(--color-success)]"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {formatDollars(card.pointsValueConservative)}
                  </span>
                  <div className="font-data text-[11px] text-[var(--text-secondary)]">
                    {formatNumber(card.totalPoints)} pts
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
