import type { PerkSection } from "@/lib/points/perk-matrix";

interface BenefitMatrixProps {
  sections: PerkSection[];
  usersCardId: string;
  cardOrder: string[];
  cardNames: Record<string, string>;
  cardFees?: Record<string, number>;
  cardBenefitsTotal?: Record<string, number>;
}

function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BenefitMatrix({
  sections,
  usersCardId,
  cardOrder,
  cardNames,
  cardFees,
  cardBenefitsTotal,
}: BenefitMatrixProps) {
  const colTemplate = `1fr repeat(${cardOrder.length}, minmax(100px, 1fr))`;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        {/* Header */}
        <div
          className="grid gap-2 px-3 pb-3 border-b border-[var(--border-default)]"
          style={{ gridTemplateColumns: colTemplate }}
        >
          <div />
          {cardOrder.map((cardId) => (
            <div key={cardId} className="text-center">
              <div
                className={`text-[12px] font-semibold ${
                  cardId === usersCardId
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {cardNames[cardId] ?? cardId}
              </div>
              {cardFees && (
                <div className="text-[11px] text-[var(--text-secondary)]/60">
                  {formatDollars(cardFees[cardId])}/yr
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.sectionId}>
            {/* Section header */}
            <div className="flex items-center gap-2 px-3 pt-4 pb-2">
              <span className="label-caps font-semibold text-[var(--text-secondary)]">
                {section.label}
              </span>
              {section.tracked && (
                <span className="inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]/70 border border-[var(--accent)]/20 bg-[var(--accent)]/5">
                  Tracked by Zurp
                </span>
              )}
            </div>

            {/* Rows */}
            {section.rows.map((row) => (
              <div
                key={row.label}
                className={`grid gap-2 px-3 py-2.5 border-b border-[rgba(255,255,255,0.02)] items-center hover:bg-[rgba(255,255,255,0.03)] transition-colors ${
                  row.isTotalRow
                    ? "border-t border-[var(--border-default)] font-semibold"
                    : ""
                }`}
                style={{ gridTemplateColumns: colTemplate }}
              >
                <div className="text-[13px] text-[var(--text-primary)]">
                  {row.label}
                </div>
                {cardOrder.map((cardId) => {
                  const cell = row.cards[cardId];
                  return (
                    <div key={cardId} className="text-center text-[13px]">
                      {cell?.value ? (
                        <div className="flex flex-col items-center">
                          <span
                            className={
                              cell.isBest
                                ? "font-data font-semibold text-[var(--accent)]"
                                : cell.value === "✓"
                                  ? "text-[var(--color-success)]"
                                  : "text-[var(--text-primary)]"
                            }
                          >
                            {cell.value}
                          </span>
                          {cell.detail && (
                            <span className="text-[10px] text-[var(--text-secondary)] max-w-[120px] text-center leading-tight">
                              {cell.detail}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--text-secondary)] opacity-20">
                          —
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        {/* Total benefits row */}
        {cardBenefitsTotal && (
          <div
            className="grid gap-2 px-3 pt-4 border-t border-[rgba(255,255,255,0.08)] mt-1 items-center"
            style={{ gridTemplateColumns: colTemplate }}
          >
            <div className="text-[14px] font-semibold text-[var(--text-primary)]">
              Total benefits
            </div>
            {cardOrder.map((cardId) => (
              <div
                key={cardId}
                className="font-data text-center text-[15px] font-bold text-[var(--text-primary)]"
              >
                {formatDollars(cardBenefitsTotal[cardId])}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
