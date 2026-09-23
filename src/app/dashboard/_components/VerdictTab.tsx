"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Leaderboard } from "./Leaderboard";
import { ValuationToggle } from "./ValuationToggle";
import { BenefitAssumptionToggle } from "./BenefitAssumptionToggle";
import { saveLifestyleSelections } from "@/app/onboarding/actions";
import { computeLifestyleBenefits } from "@/lib/points/lifestyle-valuation";
import { UnclassifiedSpendPanel } from "./UnclassifiedSpendPanel";
import { VerdictSummary } from "./VerdictSummary";
import type { IssuerPolicy } from "@/lib/cards/issuer-policies";
import type { SerializedComparison } from "./types";
import type { ValuationMode, BenefitAssumptionMode, CardSimulation } from "@/lib/points/types";
import type { UnclassifiedMerchant } from "@/lib/points/overrides";

interface VerdictTabProps {
  comparison: SerializedComparison | null;
  activeCardType: string;
  activeCardName: string;
  lifestyleKeys: string[];
  syncStatus: "pending" | "initial" | "complete";
  unclassifiedMerchants?: UnclassifiedMerchant[];
  yourPointsCurrency: string | null;
  issuerPolicy: IssuerPolicy | null;
  /** ISO date the next annual fee posts; null without an anniversary. */
  feePostsAt: string | null;
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

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${SHORT_MONTHS[s.getMonth()]} ${s.getFullYear()} – ${SHORT_MONTHS[e.getMonth()]} ${e.getFullYear()}`;
}

export function VerdictTab({
  comparison,
  activeCardType,
  activeCardName,
  lifestyleKeys,
  syncStatus,
  unclassifiedMerchants,
  yourPointsCurrency,
  issuerPolicy,
  feePostsAt,
}: VerdictTabProps) {
  const router = useRouter();
  const [vMode, setVMode] = useState<ValuationMode>("realistic");
  // Default to "proven" — the only benefits mode grounded in matched
  // transactions. "My Lifestyle" depends on picks a first-run user may
  // never have curated, and it shouldn't be the first number they see.
  const [bMode, setBMode] = useState<BenefitAssumptionMode>("proven");
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

  // Show processing animation when historical sync isn't complete
  if (syncStatus !== "complete") {
    return <CompareSyncProcessing />;
  }

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

  return (
    <div>
      {/* Card header */}
      <div className="mb-5">
        <span
          className="text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Verdict · for your next card year
        </span>
        <h1 className="mt-1 text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          Is the {activeCardName} still your best card?
        </h1>
        <span
          className="text-[12px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {comparison.totalTransactions.toLocaleString()} transactions | {comparison.monthCount}mo | {formatPeriod(comparison.analysisPeriod.start, comparison.analysisPeriod.end)}
          {comparison.classifiedSpendPct !== null && (
            <> | {comparison.classifiedSpendPct}% of spend classified</>
          )}
          {comparison.lowConfidenceSpendPct !== null &&
            comparison.lowConfidenceSpendPct >= 1 && (
              <> ({comparison.lowConfidenceSpendPct}% low confidence)</>
            )}
        </span>
      </div>

      <VerdictSummary
        cards={cards}
        activeCardType={activeCardType}
        vMode={vMode}
        bMode={bMode}
        monthCount={comparison.monthCount}
        yourPointsCurrency={yourPointsCurrency}
        issuerPolicy={issuerPolicy}
        feePostsAt={feePostsAt}
      />

      <h2
        className="mt-8 mb-2 text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--text-secondary)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Assumptions and all {comparison.totalCards} cards
      </h2>
      <div className="mt-3 mb-1 md:mt-6 md:mb-2 grid grid-cols-1 md:grid-cols-2 items-end gap-1.5 md:gap-4">
        <ValuationToggle mode={vMode} onChange={setVMode} />
        <BenefitAssumptionToggle
          mode={bMode}
          onChange={setBMode}
          lifestyleKeys={localLifestyleKeys}
          onLifestyleChange={handleLifestyleChange}
        />
      </div>
      <Leaderboard cards={sorted} activeCardType={activeCardType} vMode={vMode} bMode={bMode} lifestyleKeys={localLifestyleKeys} />

      {unclassifiedMerchants && (
        <UnclassifiedSpendPanel merchants={unclassifiedMerchants} />
      )}

      {/* Methodology footnote — always present */}
      <p
        className="mt-4 md:mt-5"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          lineHeight: 1.6,
          color: "var(--text-dim)",
        }}
      >
        ~ All values are simulated from your last {comparison.monthCount} months
        of transactions ({comparison.totalTransactions.toLocaleString()} transactions
        {comparison.classifiedSpendPct !== null && (
          <>, {comparison.classifiedSpendPct}% of spend auto-classified</>
        )}
        {comparison.lowConfidenceSpendPct !== null &&
          comparison.lowConfidenceSpendPct >= 1 && (
            <>
              {" "}of which {comparison.lowConfidenceSpendPct}% at low
              confidence from coarse category data
            </>
          )}
        ). Points valued at {VMODE_FOOTNOTE[vMode]}; benefits {BMODE_FOOTNOTE[bMode]}.
        Sign-up bonuses and switching costs are not modeled.
      </p>
    </div>
  );
}

const VMODE_FOOTNOTE: Record<ValuationMode, string> = {
  conservative: "cash value (face value)",
  realistic: "average redemption",
  upside: "best transfer-partner rates",
};

const BMODE_FOOTNOTE: Record<BenefitAssumptionMode, string> = {
  proven: "counted only when matched to your transactions",
  my_picks: "from your lifestyle picks plus matched transactions",
  all_credits: "assuming every credit is fully used",
};

// ── Sync Processing Animation ──

const PROCESSING_STEPS = [
  "Syncing your transaction history for 1 year...",
  "This usually takes 1–2 minutes",
];

function CompareSyncProcessing() {
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Rotate step text
  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((i) => (i + 1) % PROCESSING_STEPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Poll sync status every 3 seconds
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/plaid/sync-status");
        const data = await res.json();
        if (data.syncStatus === "complete") {
          if (pollRef.current) clearInterval(pollRef.current);
          router.refresh();
        }
      } catch {
        // Silently retry on next interval
      }
    }

    pollRef.current = setInterval(checkStatus, 3000);
    // Also check immediately
    checkStatus();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div
        className="flex flex-col items-center gap-6"
        style={{ maxWidth: 400 }}
      >
        {/* Animated card logo */}
        <svg
          width="64"
          height="48"
          viewBox="0 0 46 36"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="42"
            height="30"
            rx="5"
            fill="#0a0e17"
            stroke="#22d3ee"
            strokeWidth="1.5"
          />
          <clipPath id="cs-t">
            <rect x="8" y="9" width="30" height="6" rx="3" />
          </clipPath>
          <g clipPath="url(#cs-t)">
            <rect
              x="8"
              y="9"
              width="18"
              height="6"
              fill="#60a5fa"
              style={{ animation: "z-fill 2.4s ease-in-out infinite" }}
            />
            <rect
              x="26"
              y="9"
              width="6.5"
              height="6"
              fill="#a78bfa"
              style={{
                animation: "z-fill 2.4s ease-in-out infinite",
                animationDelay: "0.24s",
              }}
            />
            <rect
              x="32.5"
              y="9"
              width="5.5"
              height="6"
              fill="#f87171"
              style={{
                animation: "z-fill 2.4s ease-in-out infinite",
                animationDelay: "0.48s",
              }}
            />
          </g>
          <clipPath id="cs-b">
            <rect x="8" y="19" width="30" height="6" rx="3" />
          </clipPath>
          <g clipPath="url(#cs-b)">
            <rect
              x="8"
              y="19"
              width="5.5"
              height="6"
              fill="#f87171"
              opacity="0.5"
              style={{
                animation: "z-fill-dim 2.4s ease-in-out infinite",
                animationDelay: "0.72s",
              }}
            />
            <rect
              x="13.5"
              y="19"
              width="6.5"
              height="6"
              fill="#a78bfa"
              opacity="0.5"
              style={{
                animation: "z-fill-dim 2.4s ease-in-out infinite",
                animationDelay: "0.96s",
              }}
            />
            <rect
              x="20"
              y="19"
              width="18"
              height="6"
              fill="#60a5fa"
              opacity="0.5"
              style={{
                animation: "z-fill-dim 2.4s ease-in-out infinite",
                animationDelay: "1.2s",
              }}
            />
          </g>
        </svg>

        {/* Spinner */}
        <div
          style={{
            width: 20,
            height: 20,
            border: "2px solid var(--border-subtle)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />

        {/* Rotating status text */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--text-secondary)",
            textAlign: "center",
            transition: "opacity 0.3s ease",
            minHeight: 40,
          }}
        >
          {PROCESSING_STEPS[stepIndex]}
        </p>

        {/* Subtle indicator */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-dim)",
            textAlign: "center",
          }}
        >
          Results will appear automatically
        </p>
      </div>
    </div>
  );
}
