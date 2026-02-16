"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Leaderboard } from "./Leaderboard";
import { ValuationToggle } from "./ValuationToggle";
import { BenefitAssumptionToggle } from "./BenefitAssumptionToggle";
import { saveLifestyleSelections } from "@/app/onboarding/actions";
import { computeLifestyleBenefits } from "@/lib/points/lifestyle-valuation";
import type { SerializedComparison } from "./types";
import type { ValuationMode, BenefitAssumptionMode, CardSimulation } from "@/lib/points/types";

interface CompareTabProps {
  comparison: SerializedComparison | null;
  activeCardType: string;
  activeCardName: string;
  activeCardFee: number;
  lifestyleKeys: string[];
}

/** Get the net value for a card at the given valuation + benefit assumption modes. */
export function getNetForModes(
  card: CardSimulation,
  vMode: ValuationMode,
  bMode: BenefitAssumptionMode
): number {
  return card.netByMode[vMode][bMode];
}

/** Get the points dollar value for a card at the given valuation mode. */
export function getPointsForMode(card: CardSimulation, mode: ValuationMode): number {
  switch (mode) {
    case "conservative":
      return card.pointsValueConservative;
    case "realistic":
      return card.pointsValueRealistic;
    case "upside":
      return card.pointsValueUpside;
  }
}

/** Get the benefits value for a card at the given benefit assumption mode. */
export function getBenefitsForMode(card: CardSimulation, bMode: BenefitAssumptionMode): number {
  return card.benefitsByMode[bMode];
}

function fmt(n: number): string {
  const abs = Math.abs(Math.round(n));
  return n >= 0 ? `+$${abs.toLocaleString()}` : `-$${abs.toLocaleString()}`;
}

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${SHORT_MONTHS[s.getMonth()]} ${s.getFullYear()} – ${SHORT_MONTHS[e.getMonth()]} ${e.getFullYear()}`;
}

export function CompareTab({
  comparison,
  activeCardType,
  activeCardName,
  activeCardFee,
  lifestyleKeys,
}: CompareTabProps) {
  const router = useRouter();
  const [vMode, setVMode] = useState<ValuationMode>("realistic");
  const [bMode, setBMode] = useState<BenefitAssumptionMode>("my_picks");
  const [localLifestyleKeys, setLocalLifestyleKeys] = useState(lifestyleKeys);

  const handleLifestyleChange = useCallback(
    async (keys: string[]) => {
      setLocalLifestyleKeys(keys);
      await saveLifestyleSelections(keys);
      router.refresh();
    },
    [router]
  );

  // Recompute my_picks client-side from local lifestyle keys so the UI
  // updates instantly when picks change (no server roundtrip needed).
  const cards = useMemo(() => {
    if (!comparison) return null;
    const selectedKeys = new Set(localLifestyleKeys);

    return comparison.cards.map((card) => {
      const myPicks = computeLifestyleBenefits(card.cardId, card.matchedPerBenefit, selectedKeys);

      const newBenefitsByMode = { ...card.benefitsByMode, my_picks: myPicks };
      const newNetByMode = {
        conservative: { ...card.netByMode.conservative, my_picks: Math.round((card.pointsValueConservative + myPicks - card.annualFee) * 100) / 100 },
        realistic: { ...card.netByMode.realistic, my_picks: Math.round((card.pointsValueRealistic + myPicks - card.annualFee) * 100) / 100 },
        upside: { ...card.netByMode.upside, my_picks: Math.round((card.pointsValueUpside + myPicks - card.annualFee) * 100) / 100 },
      } as CardSimulation["netByMode"];
      return { ...card, benefitsByMode: newBenefitsByMode, netByMode: newNetByMode };
    });
  }, [comparison, localLifestyleKeys]);

  if (!comparison || !cards) {
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

  // Re-sort + re-rank for the current valuation + benefit modes
  const sorted = [...cards].sort(
    (a, b) => getNetForModes(b, vMode, bMode) - getNetForModes(a, vMode, bMode)
  );
  sorted.forEach((card, i) => {
    card.rank = i + 1;
  });

  const userCard = sorted.find((c) => c.cardId === activeCardType);
  const bestCard = sorted[0];

  const userRank = userCard?.rank ?? 0;
  const userNet = userCard ? getNetForModes(userCard, vMode, bMode) : 0;
  const bestNet = bestCard ? getNetForModes(bestCard, vMode, bMode) : 0;
  const gap = bestCard && userCard ? bestNet - userNet : 0;

  // Breakdown for net value tooltip
  const userPoints = userCard ? getPointsForMode(userCard, vMode) : 0;
  const userBenefits = userCard ? getBenefitsForMode(userCard, bMode) : 0;

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
          {comparison.totalTransactions.toLocaleString()} transactions · {comparison.monthCount} {comparison.monthCount === 1 ? "month" : "months"} · {formatPeriod(comparison.analysisPeriod.start, comparison.analysisPeriod.end)}
        </span>
      </div>

      {/* Summary stats — Net hero, Rank, Gap */}
      <CompareSummary
        userNet={userNet}
        userPoints={userPoints}
        userBenefits={userBenefits}
        annualFee={activeCardFee}
        userRank={typeof userRank === "number" ? userRank : 0}
        totalCards={comparison.totalCards}
        gap={gap}
      />

      <div className="mt-6 mb-2 grid grid-cols-1 md:grid-cols-2 items-end gap-4">
        <ValuationToggle mode={vMode} onChange={setVMode} />
        <BenefitAssumptionToggle
          mode={bMode}
          onChange={setBMode}
          lifestyleKeys={localLifestyleKeys}
          onLifestyleChange={handleLifestyleChange}
        />
      </div>
      <Leaderboard cards={sorted} activeCardType={activeCardType} vMode={vMode} bMode={bMode} lifestyleKeys={localLifestyleKeys} />
    </div>
  );
}

// ── Compare Summary Card ──

function CompareSummary({
  userNet,
  userPoints,
  userBenefits,
  annualFee,
  userRank,
  totalCards,
  gap,
}: {
  userNet: number;
  userPoints: number;
  userBenefits: number;
  annualFee: number;
  userRank: number;
  totalCards: number;
  gap: number;
}) {
  const [showNetTip, setShowNetTip] = useState(false);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 1,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
      }}
    >
      {/* Net Value — hero */}
      <div style={{ background: "var(--bg-secondary)", padding: "20px 24px", borderRadius: "15px 0 0 0" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "var(--text-secondary)",
            display: "block",
          }}
        >
          Net
        </span>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 700,
              color: userNet >= 0 ? "var(--color-success)" : "var(--color-danger)",
              lineHeight: 1.2,
            }}
          >
            {fmt(userNet)}
          </span>
          <div
            className="relative"
            onMouseEnter={() => setShowNetTip(true)}
            onMouseLeave={() => setShowNetTip(false)}
          >
            <Info
              size={16}
              strokeWidth={2}
              className="cursor-help text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
            />
            {showNetTip && (
              <div
                className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2"
                style={{
                  width: 220,
                  borderRadius: 10,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-elevated)",
                  padding: "10px 14px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                <div className="absolute left-1/2 bottom-full -translate-x-1/2 border-4 border-transparent border-b-[var(--bg-elevated)]" />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="flex justify-between" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>
                    <span style={{ color: "var(--color-accent-blue)" }}>Points</span>
                    <span style={{ color: "var(--color-accent-blue)" }}>${Math.round(userPoints).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>
                    <span style={{ color: "var(--color-accent-purple)" }}>Benefits</span>
                    <span style={{ color: "var(--color-accent-purple)" }}>${Math.round(userBenefits).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>
                    <span style={{ color: "var(--color-danger)" }}>Fees</span>
                    <span style={{ color: "var(--color-danger)" }}>-${annualFee.toLocaleString()}</span>
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: 6,
                      marginTop: 2,
                    }}
                    className="flex justify-between"
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: userNet >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>Net</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: userNet >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>{fmt(userNet)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rank */}
      <div style={{ background: "var(--bg-secondary)", padding: "20px 24px" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "var(--text-secondary)",
            display: "block",
          }}
        >
          Rank
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(24px, 3vw, 32px)",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          <span style={{ color: "var(--color-accent-cyan)" }}>{userRank}</span>
          {" "}
          <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>/</span>{" "}
          <span style={{ color: "var(--text-secondary)" }}>{totalCards}</span>
        </span>
      </div>

      {/* Gap to #1 */}
      <div style={{ background: "var(--bg-secondary)", padding: "20px 24px", borderRadius: "0 15px 0 0" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "var(--text-secondary)",
            display: "block",
          }}
        >
          Gap to #1
        </span>
        {gap > 0 ? (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 700,
              color: "var(--color-danger)",
              lineHeight: 1.2,
            }}
          >
            -${Math.round(gap).toLocaleString()}
          </span>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 700,
              color: "var(--text-secondary)",
              lineHeight: 1.2,
            }}
          >
            $0
          </span>
        )}
        {gap === 0 && (
          <span style={{ display: "block", fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            You&apos;re #1
          </span>
        )}
      </div>

      {/* Methodology footnote — spans all 3 columns */}
      <div
        style={{
          gridColumn: "1 / -1",
          background: "var(--bg-secondary)",
          padding: "8px 24px 10px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          borderRadius: "0 0 15px 15px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-dim)",
          }}
        >
          ~ Values simulated from your transaction history. Points valued at 1cpp baseline.{" "}
          <a
            href="/methodology"
            style={{
              color: "var(--text-dim)",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            Methodology
          </a>
        </span>
      </div>
    </div>
  );
}
