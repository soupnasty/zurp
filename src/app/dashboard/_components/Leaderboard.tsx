"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { StackedBar } from "./StackedBar";
import type { CardSimulation } from "@/lib/points/types";

interface LeaderboardProps {
  cards: CardSimulation[];
  activeCardType: string;
}

function fmt(n: number): string {
  if (n >= 0) return `+$${Math.round(n).toLocaleString()}`;
  return `-$${Math.abs(Math.round(n)).toLocaleString()}`;
}

export function Leaderboard({ cards, activeCardType }: LeaderboardProps) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...cards].sort((a, b) => b.netActual - a.netActual);

  const INITIAL_SHOW = 5;
  const visible = expanded ? sorted : sorted.slice(0, INITIAL_SHOW);
  const hiddenCount = sorted.length - INITIAL_SHOW;

  return (
    <div className="mt-8">
      <h2
        className="mb-4 text-lg font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Leaderboard
      </h2>

      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        {/* Header */}
        <div
          className="leaderboard-row px-3 md:px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "1.5px",
            color: "var(--text-secondary)",
          }}
        >
          <span>#</span>
          <span>Card</span>
          <span className="hidden md:block">Points / Benefits / Fees</span>
          <span className="text-right">Net</span>
        </div>

        {visible.map((card, i) => {
          const rank = card.rank;
          const isFirst = rank === 1;
          const isUser = card.cardId === activeCardType;
          const isDimmed = rank > 5;
          const benefitsVal = card.isUsersCard
            ? (card.benefitsCaptured ?? 0)
            : (card.benefitsSimulated ?? card.benefitsValue);

          return (
            <div
              key={card.cardId}
              className={`leaderboard-row px-3 md:px-4 py-2.5 md:py-3 transition-colors hover:bg-[var(--bg-card-hover)] ${
                i < visible.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
              }`}
              style={{
                background: isFirst
                  ? "rgba(52,211,153,0.02)"
                  : undefined,
                borderLeft: isUser ? "3px solid var(--color-accent-cyan)" : undefined,
              }}
            >
              {/* Rank */}
              <span
                className="text-sm font-bold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: isFirst
                    ? "var(--color-success)"
                    : isUser
                    ? "var(--color-accent-cyan)"
                    : "var(--text-secondary)",
                }}
              >
                {rank}
              </span>

              {/* Card name + mobile mini bar */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="truncate text-sm font-semibold text-[var(--text-primary)]"
                    style={{ opacity: isDimmed ? 0.5 : 1 }}
                  >
                    {card.cardName}
                  </span>
                  {isUser && (
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-accent-cyan)",
                        background: "rgba(34,211,238,0.08)",
                      }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <span
                  className="text-[11px] text-[var(--text-secondary)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {card.annualFee > 0 ? `$${card.annualFee}/yr` : "$0 fee"}
                </span>
                {/* Mobile mini bar */}
                <div className="mt-1.5 md:hidden">
                  <StackedBar
                    points={card.pointsValueConservative}
                    benefits={benefitsVal}
                    fees={card.annualFee}
                    height={6}
                    radius={3}
                    dimmed={isDimmed}
                  />
                </div>
              </div>

              {/* Desktop stacked bar */}
              <div className="hidden md:block">
                <StackedBar
                  points={card.pointsValueConservative}
                  benefits={benefitsVal}
                  fees={card.annualFee}
                  dimmed={isDimmed}
                />
              </div>

              {/* Net value */}
              <span
                className="text-right text-sm font-bold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: isFirst
                    ? "var(--color-success)"
                    : isUser
                    ? "var(--color-accent-cyan)"
                    : "var(--text-secondary)",
                  opacity: isDimmed ? 0.4 : 1,
                }}
              >
                {fmt(card.netActual)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Show more / show less toggle */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Show less" : `Show ${hiddenCount} more cards`}
        </button>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-5">
        {[
          { color: "var(--color-accent-blue)", label: "Points" },
          { color: "var(--color-accent-purple)", label: "Benefits" },
          { color: "var(--color-danger)", label: "Fees" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-[11px] text-[var(--text-secondary)]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
