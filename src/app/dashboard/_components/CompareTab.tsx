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
      label: "Rank",
      value: `#${userRank} of ${comparison.totalCards}`,
      valueColor: "var(--color-accent-cyan)",
    },
    {
      label: "Net",
      value: fmt(userNet),
      valueColor: userNet >= 0 ? "var(--color-success)" : "var(--color-danger)",
    },
    {
      label: "Gap to #1",
      value: gap > 0 ? fmt(gap) : "$0",
      valueColor: gap > 0 ? "var(--color-success)" : "var(--text-secondary)",
      sub: gap === 0 ? "You're #1" : undefined,
    },
  ];

  return (
    <div>
      {/* Card header */}
      <div className="mb-5">
        <span
          className="text-[10px] font-bold uppercase tracking-[2.5px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Your card
        </span>
        <h1 className="mt-1 text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          {activeCardName}
        </h1>
        <span
          className="text-[12px] text-[var(--text-dim)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {comparison.monthCount} {comparison.monthCount === 1 ? "month" : "months"} of data · {comparison.totalTransactions.toLocaleString()} transactions
        </span>
      </div>

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
