"use client";

import { SummaryStrip } from "./SummaryStrip";
import { Leaderboard } from "./Leaderboard";
import { HeadToHead } from "./HeadToHead";
import type { SerializedComparison } from "./types";

interface CompareTabProps {
  comparison: SerializedComparison | null;
  activeCardType: string;
  activeCardName: string;
  activeCardFee: number;
}

function fmt(n: number): string {
  const abs = Math.abs(Math.round(n));
  return n >= 0 ? `+$${abs.toLocaleString()}` : `-$${abs.toLocaleString()}`;
}

export function CompareTab({
  comparison,
  activeCardType,
  activeCardName,
  activeCardFee,
}: CompareTabProps) {
  if (!comparison) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-8 py-10 text-center max-w-md">
          <p className="text-[var(--text-secondary)] text-sm">
            Connect your card for at least a month to see rankings
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...comparison.cards].sort((a, b) => b.netActual - a.netActual);
  const userCard = comparison.cards.find((c) => c.cardId === activeCardType);
  const bestCard = sorted[0];

  const userRank = userCard?.rank ?? "-";
  const userNet = userCard?.netActual ?? 0;
  const gap = bestCard && userCard ? bestCard.netActual - userCard.netActual : 0;

  const summaryItems = [
    {
      label: "Your card",
      value: activeCardName,
      valueColor: "var(--text-primary)",
      sub: activeCardFee > 0 ? `$${activeCardFee}/yr fee` : "$0 fee",
    },
    {
      label: "Your rank",
      value: `#${userRank} of ${comparison.totalCards}`,
      valueColor: "var(--color-accent-cyan)",
    },
    {
      label: "Your net value",
      value: fmt(userNet),
      valueColor: userNet >= 0 ? "var(--color-success)" : "var(--color-danger)",
    },
    {
      label: "Gap to #1",
      value: gap > 0 ? fmt(gap) : "$0",
      valueColor: gap > 0 ? "var(--color-success)" : "var(--text-secondary)",
      sub: gap > 0 ? bestCard?.cardName : "You're #1",
    },
  ];

  return (
    <div>
      <SummaryStrip items={summaryItems} />
      <Leaderboard cards={comparison.cards} activeCardType={activeCardType} />
      <HeadToHead
        headline={comparison.headline}
        cards={comparison.cards}
        activeCardType={activeCardType}
      />
    </div>
  );
}
