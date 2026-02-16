"use client";

import { useState } from "react";
import { StackedBar } from "./StackedBar";
import { getNetForModes, getPointsForMode, getBenefitsForMode } from "./CompareTab";
import { getCardDefinition } from "@/lib/cards";
import type { CardSimulation, ValuationMode, BenefitAssumptionMode, CategoryEarnSummary } from "@/lib/points/types";
import type { BenefitCycle } from "@/lib/types";

interface LeaderboardProps {
  cards: CardSimulation[];
  activeCardType: string;
  vMode: ValuationMode;
  bMode: BenefitAssumptionMode;
  lifestyleKeys: string[];
}

function fmt(n: number): string {
  if (n >= 0) return `+$${Math.round(n).toLocaleString()}`;
  return `-$${Math.abs(Math.round(n)).toLocaleString()}`;
}

function fmtPlain(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

// ── Helpers ──

function getCycleMultiplier(cycle: BenefitCycle): number {
  switch (cycle) {
    case "monthly": return 12;
    case "biannual_h1":
    case "biannual_h2": return 1;
    case "quarterly_q1":
    case "quarterly_q2":
    case "quarterly_q3":
    case "quarterly_q4": return 1;
    case "annual_calendar":
    case "annual_anniversary": return 1;
    case "quadrennial": return 0.25;
    case "subscription": return 12;
    default: return 1;
  }
}

interface BenefitItem {
  name: string;
  annual: number;
}

/**
 * Get benefits for a card filtered by benefit assumption mode.
 *
 * - proven: only benefits with matched transactions (use matched amount)
 * - my_picks: matched benefits + lifestyle-selected benefits (use max of matched vs annualized)
 * - all_credits: all benefits at full annualized value
 */
function getCardBenefits(
  cardId: string,
  bMode: BenefitAssumptionMode,
  matchedPerBenefit: Record<string, number>,
  lifestyleKeys: Set<string>
): BenefitItem[] {
  const def = getCardDefinition(cardId);
  if (!def) return [];

  // Group by displayGroup to avoid listing 3 separate DoorDash lines
  const grouped = new Map<string, { name: string; annual: number }>();
  for (const b of def.benefits) {
    if (b.creditAmount <= 0) continue;

    const annualized = b.creditAmount * getCycleMultiplier(b.cycle as BenefitCycle);
    const matched = matchedPerBenefit[b.id] ?? 0;

    let value: number;
    if (bMode === "all_credits") {
      value = annualized;
    } else if (bMode === "my_picks") {
      // Lifestyle-selected benefits get max(matched, annualized); others get matched only
      if (b.lifestyleKey && lifestyleKeys.has(b.lifestyleKey)) {
        value = Math.max(matched, annualized);
      } else {
        value = matched;
      }
    } else {
      // proven: only matched transaction amounts
      value = matched;
    }

    if (value <= 0) continue;

    const key = b.displayGroup ?? b.id;
    const label = b.displayGroupName ?? b.name;
    const existing = grouped.get(key);
    if (existing) {
      existing.annual += value;
    } else {
      grouped.set(key, { name: label, annual: value });
    }
  }
  return Array.from(grouped.values())
    .filter((b) => b.annual > 0)
    .sort((a, b) => b.annual - a.annual);
}

/** Scale a category's conservative value to the selected valuation mode. */
function scaleCatValue(
  cat: CategoryEarnSummary,
  card: CardSimulation,
  vMode: ValuationMode
): number {
  if (vMode === "conservative" || card.pointsValueConservative === 0)
    return cat.valueConservative;
  const ratio = getPointsForMode(card, vMode) / card.pointsValueConservative;
  return Math.round(cat.valueConservative * ratio * 100) / 100;
}

// ── Expanded Row Comparison ──

function RowComparison({
  comparedCard,
  userCard,
  vMode,
  bMode,
  lifestyleKeys,
}: {
  comparedCard: CardSimulation;
  userCard: CardSimulation;
  vMode: ValuationMode;
  bMode: BenefitAssumptionMode;
  lifestyleKeys: Set<string>;
}) {
  // Collect all categories across both cards
  const allCats = new Map<string, { label: string; user: number; comp: number }>();
  for (const cat of userCard.categories) {
    allCats.set(cat.category, {
      label: cat.label,
      user: scaleCatValue(cat, userCard, vMode),
      comp: 0,
    });
  }
  for (const cat of comparedCard.categories) {
    const existing = allCats.get(cat.category);
    if (existing) {
      existing.comp = scaleCatValue(cat, comparedCard, vMode);
    } else {
      allCats.set(cat.category, {
        label: cat.label,
        user: 0,
        comp: scaleCatValue(cat, comparedCard, vMode),
      });
    }
  }

  // Sort by total value descending
  const catRows = Array.from(allCats.values())
    .filter((r) => r.user > 0 || r.comp > 0)
    .sort((a, b) => (b.user + b.comp) - (a.user + a.comp));

  const maxCatVal = Math.max(...catRows.map((r) => Math.max(r.user, r.comp)), 1);

  // Benefits
  const userBenefits = getCardBenefits(userCard.cardId, bMode, userCard.matchedPerBenefit, lifestyleKeys);
  const compBenefits = getCardBenefits(comparedCard.cardId, bMode, comparedCard.matchedPerBenefit, lifestyleKeys);
  const userBenTotal = userBenefits.reduce((s, b) => s + b.annual, 0);
  const compBenTotal = compBenefits.reduce((s, b) => s + b.annual, 0);
  const maxBenRows = Math.max(userBenefits.length, compBenefits.length);

  // Fees
  const userFee = userCard.annualFee;
  const compFee = comparedCard.annualFee;

  const sectionLabel = {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 700 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "2px",
    color: "var(--text-dim)",
  };

  const vsStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--text-dim)",
    textAlign: "center" as const,
  };

  return (
    <div
      style={{
        padding: "20px 24px 24px",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {/* Column headers: Your Card vs {Card Name} */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 40px 1fr",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ ...sectionLabel, color: "var(--text-secondary)" }}>Your Card</span>
        </div>
        <span style={vsStyle}>vs</span>
        <div>
          <span style={{ ...sectionLabel, color: "var(--text-secondary)" }}>{comparedCard.cardName}</span>
        </div>
      </div>

      {/* ── Points by Category ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ ...sectionLabel, marginBottom: 12, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
          Points by Category
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {catRows.map((row) => {
            const userWins = row.user >= row.comp;
            return (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 40px 1fr",
                  alignItems: "center",
                  gap: 0,
                }}
              >
                {/* User side — right-aligned */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.label}
                  </span>
                  <div style={{ width: 80, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.03)", overflow: "hidden", display: "flex", justifyContent: "flex-end" }}>
                    <div
                      style={{
                        width: `${(row.user / maxCatVal) * 100}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: userWins ? "var(--color-accent-blue)" : "var(--text-dim)",
                        opacity: userWins ? 1 : 0.3,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: userWins ? "var(--color-accent-blue)" : "var(--text-dim)",
                      minWidth: 44,
                      textAlign: "right",
                    }}
                  >
                    {fmtPlain(row.user)}
                  </span>
                </div>

                {/* vs */}
                <span style={vsStyle}>vs</span>

                {/* Compared card side — left-aligned */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: !userWins ? "var(--color-accent-blue)" : "var(--text-dim)",
                      minWidth: 44,
                    }}
                  >
                    {fmtPlain(row.comp)}
                  </span>
                  <div style={{ width: 80, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${(row.comp / maxCatVal) * 100}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: !userWins ? "var(--color-accent-blue)" : "var(--text-dim)",
                        opacity: !userWins ? 1 : 0.3,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Totals */}
          {(() => {
            const userPtsTotal = catRows.reduce((s, r) => s + r.user, 0);
            const compPtsTotal = catRows.reduce((s, r) => s + r.comp, 0);
            return (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 40px 1fr",
                  alignItems: "center",
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: userPtsTotal >= compPtsTotal ? "var(--color-accent-blue)" : "var(--text-dim)",
                    }}
                  >
                    {fmtPlain(userPtsTotal)}
                  </span>
                </div>
                <span />
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: compPtsTotal >= userPtsTotal ? "var(--color-accent-blue)" : "var(--text-dim)",
                    }}
                  >
                    {fmtPlain(compPtsTotal)}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Benefits ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ ...sectionLabel, marginBottom: 12, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
          Benefits
        </div>

        {/* Itemized rows */}
        {maxBenRows > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: maxBenRows }).map((_, i) => {
              const uBen = userBenefits[i];
              const cBen = compBenefits[i];
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 40px 1fr",
                    alignItems: "center",
                  }}
                >
                  {/* User benefit */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, alignItems: "baseline" }}>
                    {uBen ? (
                      <>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--text-secondary)", textAlign: "right" }}>
                          {uBen.name}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--color-accent-purple)" }}>
                          {fmtPlain(uBen.annual)}
                        </span>
                      </>
                    ) : <span />}
                  </div>
                  <span style={vsStyle}>{i === 0 ? "vs" : ""}</span>
                  {/* Compared benefit */}
                  <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                    {cBen ? (
                      <>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--color-accent-purple)" }}>
                          {fmtPlain(cBen.annual)}
                        </span>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--text-secondary)" }}>
                          {cBen.name}
                        </span>
                      </>
                    ) : <span />}
                  </div>
                </div>
              );
            })}

            {/* Totals */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 40px 1fr",
                alignItems: "center",
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: userBenTotal >= compBenTotal ? "var(--color-accent-purple)" : "var(--text-dim)",
                  }}
                >
                  {fmtPlain(userBenTotal)}
                </span>
              </div>
              <span />
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: compBenTotal >= userBenTotal ? "var(--color-accent-purple)" : "var(--text-dim)",
                  }}
                >
                  {fmtPlain(compBenTotal)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", textAlign: "center", padding: "8px 0" }}>
            No statement credits on either card
          </div>
        )}
      </div>

      {/* ── Annual Fee ── */}
      <div>
        <div style={{ ...sectionLabel, marginBottom: 12, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
          Annual Fee
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 40px 1fr",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 700,
                color: userFee >= compFee ? "var(--color-danger)" : "var(--text-dim)",
              }}
            >
              -${userFee.toLocaleString()}
            </span>
          </div>
          <span style={vsStyle}>vs</span>
          <div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 700,
                color: compFee >= userFee ? "var(--color-danger)" : "var(--text-dim)",
              }}
            >
              -${compFee.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard ──

export function Leaderboard({ cards, activeCardType, vMode, bMode, lifestyleKeys }: LeaderboardProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const lifestyleSet = new Set(lifestyleKeys);
  const sorted = cards;
  const userCard = sorted.find((c) => c.cardId === activeCardType);

  // Compute maxGross for proportional bar scaling
  const maxGross = Math.max(
    ...sorted.map((c) => getPointsForMode(c, vMode) + getBenefitsForMode(c, bMode) + c.annualFee)
  );

  // Max net for net mini-bar scaling
  const maxNet = Math.max(...sorted.map((c) => getNetForModes(c, vMode, bMode)));

  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between mb-4">
        <h2
          className="text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Leaderboard
        </h2>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-dim)",
            letterSpacing: "0.5px",
          }}
        >
          {sorted.length} cards ranked by net value
        </span>
      </div>

      {/* Legend — outside container */}
      <div
        className="px-1 mb-3"
        style={{ display: "flex", alignItems: "center", gap: 16 }}
      >
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
            <span
              className="text-[10px] text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        {/* Column headers */}
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

        {sorted.map((card, i) => {
          const rank = card.rank;
          const isFirst = rank === 1;
          const isUser = card.cardId === activeCardType;
          const isDimmed = rank > 5 && !isUser;
          const benefitsVal = getBenefitsForMode(card, bMode);
          const pointsVal = getPointsForMode(card, vMode);
          const netVal = getNetForModes(card, vMode, bMode);
          const isExpanded = expandedCardId === card.cardId;

          // Net mini-bar width (relative to #1's net)
          const netBarPct = maxNet > 0 ? Math.max(0, (netVal / maxNet) * 100) : 0;

          return (
            <div key={card.cardId}>
              <div
                className={`leaderboard-row px-3 md:px-4 py-2.5 md:py-3 transition-colors hover:bg-[var(--bg-card-hover)] ${
                  i < sorted.length - 1 && !isExpanded ? "border-b border-[var(--border-subtle)]" : ""
                }`}
                style={{
                  background: isExpanded
                    ? "rgba(96,165,250,0.03)"
                    : isFirst
                    ? "rgba(52,211,153,0.02)"
                    : isUser
                    ? "rgba(255,255,255,0.02)"
                    : undefined,
                  borderLeft: isUser
                    ? "3px solid var(--text-dim)"
                    : isFirst
                    ? "3px solid var(--color-success)"
                    : "3px solid transparent",
                  cursor: isUser ? "default" : "pointer",
                }}
                onClick={() => {
                  if (isUser) return;
                  setExpandedCardId(isExpanded ? null : card.cardId);
                }}
              >
                {/* Rank */}
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: isFirst
                      ? "var(--color-success)"
                      : "var(--text-secondary)",
                  }}
                >
                  {rank}
                </span>

                {/* Card name + inline stats */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="truncate text-sm font-semibold text-[var(--text-primary)]"
                      style={{ opacity: isDimmed ? 0.5 : 1 }}
                    >
                      {card.cardName}
                    </span>
                    {isFirst && (
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.5px",
                          color: "var(--color-success)",
                          background: "rgba(52,211,153,0.08)",
                          border: "1px solid rgba(52,211,153,0.12)",
                        }}
                      >
                        Best Fit
                      </span>
                    )}
                    {isUser && (
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-secondary)",
                          background: "rgba(255,255,255,0.06)",
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-0.5 flex items-center gap-3"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      opacity: isDimmed ? 0.4 : 0.85,
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent-blue)]" />
                      <span style={{ color: "var(--color-accent-blue)" }}>
                        {fmtPlain(pointsVal)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent-purple)]" />
                      <span style={{ color: "var(--color-accent-purple)" }}>
                        {fmtPlain(benefitsVal)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" />
                      <span style={{ color: "var(--color-danger)" }}>
                        {fmtPlain(card.annualFee)}
                      </span>
                    </span>
                  </div>
                  {/* Mobile mini bar */}
                  <div className="mt-1.5 md:hidden">
                    <StackedBar
                      points={pointsVal}
                      benefits={benefitsVal}
                      fees={card.annualFee}
                      height={6}
                      radius={3}
                      dimmed={isDimmed}
                      maxGross={maxGross}
                    />
                  </div>
                </div>

                {/* Desktop stacked bar — proportionally scaled */}
                <div className="hidden md:block">
                  <StackedBar
                    points={pointsVal}
                    benefits={benefitsVal}
                    fees={card.annualFee}
                    dimmed={isDimmed}
                    maxGross={maxGross}
                  />
                </div>

                {/* Net value + mini-bar */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-sm font-bold"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: isFirst
                        ? "var(--color-success)"
                        : "var(--text-secondary)",
                      opacity: isDimmed ? 0.4 : 1,
                    }}
                  >
                    {fmt(netVal)}
                  </span>
                  {/* Net mini-bar */}
                  <div
                    style={{
                      width: 60,
                      height: 3,
                      borderRadius: 1.5,
                      background: "rgba(255,255,255,0.04)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 1.5,
                        width: `${Math.max(0, netBarPct)}%`,
                        background: isFirst
                          ? "var(--color-success)"
                          : "var(--text-dim)",
                        opacity: isDimmed ? 0.3 : 0.6,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded comparison */}
              {isExpanded && userCard && (
                <RowComparison
                  comparedCard={card}
                  userCard={userCard}
                  vMode={vMode}
                  bMode={bMode}
                  lifestyleKeys={lifestyleSet}
                />
              )}

              {/* Border after expanded section */}
              {isExpanded && i < sorted.length - 1 && (
                <div style={{ borderBottom: "1px solid var(--border-subtle)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
