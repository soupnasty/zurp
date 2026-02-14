"use client";

import type { CardSimulation, HeadlineVerdict } from "@/lib/points/types";

interface HeadToHeadProps {
  headline: HeadlineVerdict;
  cards: CardSimulation[];
  activeCardType: string;
}

function fmt(n: number): string {
  return `$${Math.abs(Math.round(n)).toLocaleString()}`;
}

interface RowData {
  label: string;
  leftVal: number;
  rightVal: number;
  color: string;
  isTotal?: boolean;
}

export function HeadToHead({ headline, cards, activeCardType }: HeadToHeadProps) {
  const sorted = [...cards].sort((a, b) => b.netActual - a.netActual);
  const bestCard = sorted[0];
  const userCard = cards.find((c) => c.cardId === activeCardType);

  if (!bestCard || !userCard || bestCard.cardId === userCard.cardId) return null;

  const userBenefits = userCard.benefitsSimulated ?? userCard.benefitsValue;
  const bestBenefits = bestCard.benefitsSimulated ?? bestCard.benefitsValue;

  const rows: RowData[] = [
    {
      label: "Points",
      leftVal: userCard.pointsValueConservative,
      rightVal: bestCard.pointsValueConservative,
      color: "var(--color-accent-blue)",
    },
    {
      label: "Benefits",
      leftVal: userBenefits,
      rightVal: bestBenefits,
      color: "var(--color-accent-purple)",
    },
    {
      label: "Fees",
      leftVal: userCard.annualFee,
      rightVal: bestCard.annualFee,
      color: "var(--color-danger)",
    },
    {
      label: "Total",
      leftVal: userCard.netActual,
      rightVal: bestCard.netActual,
      color: "var(--color-success)",
      isTotal: true,
    },
  ];

  return (
    <div className="mt-8">
      <h2
        className="mb-4 text-lg font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Head to head
      </h2>

      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        {/* Header */}
        <div
          className="h2h-row px-3 md:px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
        >
          <div className="text-left">
            <span
              className="inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[1px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-accent-cyan)",
                background: "rgba(34,211,238,0.08)",
              }}
            >
              #{userCard.rank} YOUR CARD
            </span>
            <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              {userCard.cardName}
            </div>
          </div>
          <div className="text-center text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            vs
          </div>
          <div className="text-right">
            <span
              className="inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[1px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-success)",
                background: "rgba(52,211,153,0.08)",
              }}
            >
              #1 BEST FIT
            </span>
            <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              {bestCard.cardName}
            </div>
          </div>
        </div>

        {/* Rows */}
        {rows.map((row) => {
          const leftWins = row.label === "Fees"
            ? row.leftVal < row.rightVal
            : row.leftVal > row.rightVal;
          const rightWins = !leftWins && row.leftVal !== row.rightVal;
          const winnerColor = row.color;

          return (
            <div
              key={row.label}
              className={`h2h-row px-3 md:px-4 py-3 ${
                row.isTotal
                  ? "border-t border-[var(--border-medium)] bg-[rgba(255,255,255,0.02)]"
                  : "border-t border-[var(--border-subtle)]"
              }`}
            >
              <span
                className="text-sm font-bold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: leftWins ? winnerColor : "var(--text-secondary)",
                }}
              >
                {row.label === "Fees" ? `-${fmt(row.leftVal)}` : fmt(row.leftVal)}
              </span>
              <span
                className="text-center text-xs font-medium text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {row.label}
              </span>
              <span
                className="text-right text-sm font-bold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: rightWins ? winnerColor : "var(--text-secondary)",
                }}
              >
                {row.label === "Fees" ? `-${fmt(row.rightVal)}` : fmt(row.rightVal)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
