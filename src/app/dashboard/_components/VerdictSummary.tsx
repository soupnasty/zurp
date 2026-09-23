"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { decideVerdict, type VerdictCard, type VerdictState } from "@/lib/verdict/decide";
import { verdictReasons, type Reason } from "@/lib/verdict/reasons";
import { verdictRobustness, type Robustness } from "@/lib/verdict/robustness";
import { buildNextSteps } from "@/lib/verdict/next-steps";
import type { IssuerPolicy } from "@/lib/cards/issuer-policies";
import type { BenefitAssumptionMode, CardSimulation, ValuationMode } from "@/lib/points/types";

const mono = { fontFamily: "var(--font-mono)" } as const;
const money = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString()}`;
const signed = (n: number) => `${n >= 0 ? "+" : "−"}${money(n)}`;
const labelClass = "text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--text-secondary)]";

const STATE_LABEL: Record<VerdictState | "not_yet", string> = {
  keep: "KEEP",
  switch: "SWITCH",
  toss_up: "TOSS-UP",
  not_yet: "NOT YET",
};
const V_LABEL: Record<ValuationMode, string> = {
  conservative: "cash value",
  realistic: "a typical redemption",
  upside: "best transfer rates",
};
const B_LABEL: Record<BenefitAssumptionMode, string> = {
  proven: "only the credits you use",
  my_picks: "your lifestyle picks",
  all_credits: "every credit fully used",
};

export interface VerdictSummaryProps {
  cards: CardSimulation[];
  activeCardType: string;
  vMode: ValuationMode;
  bMode: BenefitAssumptionMode;
  monthCount: number;
  yourPointsCurrency: string | null;
  issuerPolicy: IssuerPolicy | null;
  /** ISO date the next annual fee posts; null without an anniversary. */
  feePostsAt: string | null;
}

function reasonText(r: Reason, compareTo: VerdictCard, bMode: BenefitAssumptionMode): string {
  switch (r.kind) {
    case "points":
      return `Earns ~${money(r.amount)} more in points on your spending`;
    case "category":
      return `${r.theirRate > r.yourRate ? r.theirRate : r.yourRate}x on ${r.label === "Other" ? "everything else" : r.label} (vs ${
        r.theirRate > r.yourRate ? r.yourRate : r.theirRate
      }x), where you spent ${money(r.spend)}`;
    case "benefits":
      return r.favors === "yours" && bMode === "proven"
        ? `~${money(r.amount)} more a year from credits you actually use`
        : `~${money(r.amount)} more a year from its credits`;
    case "fee":
      return r.favors === "alternative" && compareTo.annualFee === 0
        ? `No annual fee`
        : `Annual fee is ${money(r.amount)} lower`;
  }
}

function robustnessText(r: Robustness): string {
  if (r.flips.length === 0) return "Holds under every assumption setting.";
  const first = r.flips[0];
  const flipsTo = STATE_LABEL[first.state];
  const sameB = r.flips.every((f) => f.bMode === first.bMode);
  const sameV = r.flips.every((f) => f.vMode === first.vMode);
  const when = sameB
    ? `if you count ${B_LABEL[first.bMode]}`
    : sameV
      ? `if points are worth ${V_LABEL[first.vMode]}`
      : `with points at ${V_LABEL[first.vMode]} and ${B_LABEL[first.bMode]}`;
  return `Holds under ${r.holds} of ${r.total} assumption settings. Becomes ${flipsTo} ${when}.`;
}

export function VerdictSummary(props: VerdictSummaryProps) {
  const { cards, activeCardType, vMode, bMode, monthCount, issuerPolicy } = props;
  const verdict = decideVerdict(cards, activeCardType, vMode, bMode, monthCount);
  const robustness = verdictRobustness(cards, activeCardType, vMode, bMode, monthCount);
  if (!verdict || !robustness) return null;

  const { state, yours, compareTo, gap } = verdict;
  const sim = (id: string) => cards.find((c) => c.cardId === id)!;
  const reasons = verdictReasons(yours, compareTo, sim(yours.cardId), sim(compareTo.cardId));
  const forAlt = reasons.filter((r) => r.favors === "alternative");
  const forYou = reasons.filter((r) => r.favors === "yours");
  const others = verdict.tied.filter((c) => c.cardId !== compareTo.cardId);

  const readyAt = new Date();
  readyAt.setUTCMonth(readyAt.getUTCMonth() + Math.max(0, 6 - monthCount));
  const next = buildNextSteps(
    {
      state,
      yours: { cardId: yours.cardId, cardName: yours.cardName, annualFee: yours.annualFee, pointsCurrency: props.yourPointsCurrency },
      compareTo: { cardId: compareTo.cardId, cardName: compareTo.cardName, annualFee: compareTo.annualFee },
      gap,
      feePostsAt: props.feePostsAt ? new Date(props.feePostsAt) : null,
      verdictReadyAt: readyAt,
    },
    issuerPolicy
  );

  // Green is reserved for the recommended card.
  const winnerId = state === "keep" ? yours.cardId : state === "switch" ? compareTo.cardId : null;
  const netColor = (c: VerdictCard) =>
    c.cardId === winnerId ? "var(--color-success)" : "var(--text-primary)";
  const leanTo =
    verdict.raw === "keep" ? `keeping the ${yours.cardName}` : verdict.raw === "switch" ? `the ${compareTo.cardName}` : "a toss-up";

  const rows: { label: string; you: string; them: string; color: string }[] = [
    { label: "Points", you: money(yours.points), them: money(compareTo.points), color: "var(--color-accent-blue)" },
    {
      label: bMode === "all_credits" ? "Credits, if all used" : "Credits",
      you: money(yours.benefits),
      them: money(compareTo.benefits),
      color: "var(--color-accent-purple)",
    },
    {
      label: "Annual fee",
      you: yours.annualFee ? `−${money(yours.annualFee)}` : "$0",
      them: compareTo.annualFee ? `−${money(compareTo.annualFee)}` : "$0",
      color: "var(--color-danger)",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Verdict"
        className="grid grid-cols-1 gap-8 rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 md:grid-cols-2 md:gap-10 md:p-8"
      >
        <div className="flex flex-col gap-4">
          <span
            className="text-[44px] font-bold leading-none md:text-[56px]"
            style={{
              ...mono,
              color:
                state === "keep"
                  ? "var(--color-success)"
                  : state === "switch"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
            }}
          >
            {STATE_LABEL[state]}
          </span>
          <p className="text-[18px] leading-relaxed text-[var(--text-secondary)] md:text-[19px]">
            {state === "keep" && (
              <>
                Your {yours.cardName} nets{" "}
                <strong className="text-[var(--color-success)]" style={mono}>~{money(gap)}/yr more</strong> than the best
                alternative, <span className="text-[var(--text-primary)]">{compareTo.cardName}</span>.
              </>
            )}
            {state === "switch" && (
              <>
                <span className="text-[var(--text-primary)]">{compareTo.cardName}</span> would net you{" "}
                <strong className="text-[var(--color-success)]" style={mono}>~{money(gap)}/yr more</strong>
                {compareTo.annualFee === 0 ? ", with no annual fee" : ""}.
              </>
            )}
            {state === "toss_up" && (
              <>
                Your {yours.cardName} and <span className="text-[var(--text-primary)]">{compareTo.cardName}</span> are within{" "}
                <strong className="text-[var(--text-primary)]" style={mono}>~{money(gap)}/yr</strong>, closer than our
                margin of error.
              </>
            )}
            {state === "not_yet" && (
              <>
                Too early to call. With {monthCount} month{monthCount === 1 ? "" : "s"} of spending you&apos;re leaning
                toward <span className="text-[var(--text-primary)]">{leanTo}</span>. The verdict needs 6 months.
              </>
            )}
          </p>
          {state === "switch" && others.length > 0 && (
            <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
              {others[0].cardName} ({signed(others[0].net - yours.net)}/yr)
              {others.length > 1 ? ` and ${others.length - 1} other card${others.length > 2 ? "s" : ""} are` : " is"} effectively
              tied. We picked {compareTo.cardName} because its fee is lower.
            </p>
          )}
          <span className="text-[13px] leading-relaxed text-[var(--text-secondary)]" style={mono}>
            {robustnessText(robustness)}
          </span>
          <div className="flex items-start gap-3 rounded-xl border border-[rgba(251,191,36,0.15)] bg-[rgba(251,191,36,0.06)] px-4 py-3.5 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            <CalendarClock size={18} className="mt-0.5 shrink-0 text-[var(--color-accent-amber)]" />
            <span>
              {next.deadline}
              {!props.feePostsAt && (
                <>
                  {" "}
                  <Link href="/settings" className="text-[var(--color-accent-cyan)]">Settings →</Link>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div
            className="grid gap-3 border-b border-[var(--border-medium)] pb-2.5 text-[12px] font-bold uppercase tracking-[1px] text-[var(--text-secondary)]"
            style={{ ...mono, gridTemplateColumns: "minmax(0,1fr) 110px 110px" }}
          >
            <span>Per year</span>
            <span className="truncate text-right text-[var(--text-primary)]">{yours.cardName}</span>
            <span className="truncate text-right text-[var(--text-primary)]">{compareTo.cardName}</span>
          </div>
          {rows.map((r) => (
            <div key={r.label} className="grid gap-3 text-[15px] text-[var(--text-secondary)]" style={{ gridTemplateColumns: "minmax(0,1fr) 110px 110px" }}>
              <span>{r.label}</span>
              <span className="text-right font-bold" style={{ ...mono, color: r.color }}>{r.you}</span>
              <span className="text-right font-bold" style={{ ...mono, color: r.color }}>{r.them}</span>
            </div>
          ))}
          <div
            className="grid gap-3 border-t border-[var(--border-medium)] pt-3 text-[15px] font-semibold text-[var(--text-primary)]"
            style={{ gridTemplateColumns: "minmax(0,1fr) 110px 110px" }}
          >
            <span>Net per year</span>
            <span className="text-right text-[17px] font-bold" style={{ ...mono, color: netColor(yours) }}>~{signed(yours.net)}</span>
            <span className="text-right text-[17px] font-bold" style={{ ...mono, color: netColor(compareTo) }}>~{signed(compareTo.net)}</span>
          </div>
          <span className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
            Annualized from {monthCount} month{monthCount === 1 ? "" : "s"} of your spending.
            {bMode === "proven" && ` ${compareTo.cardName} credits are the ones your spending would likely trigger.`}
          </span>

          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { title: `In ${compareTo.cardName}'s favor`, items: forAlt },
              { title: `In the ${yours.cardName}'s favor`, items: forYou },
            ].map((col) => (
              <div key={col.title} className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-[var(--text-primary)]">{col.title}</span>
                {col.items.length === 0 ? (
                  <span className="text-[14px] text-[var(--text-secondary)]">Nothing significant.</span>
                ) : (
                  col.items.map((r, i) => (
                    <span key={i} className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
                      {reasonText(r, compareTo, bMode)}
                    </span>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 items-start gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {state === "not_yet" ? "While we learn your spending" : "What to do next"}
          </h2>
          <ol className="flex flex-col gap-3.5">
            {next.steps.map((s, i) => (
              <li key={i} className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-medium)] text-[13px] font-bold text-[var(--text-primary)]" style={mono}>
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] font-semibold text-[var(--text-primary)]">{s.title}</span>
                  <span className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{s.body}</span>
                </div>
              </li>
            ))}
          </ol>
          {next.caveat && <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">Note: {next.caveat}</p>}
          {(state === "keep" || state === "not_yet") && (
            <Link href="/dashboard" className="text-[15px] text-[var(--color-accent-cyan)]">Go to Rewards →</Link>
          )}
        </div>
        {next.giveUp.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">What you&apos;d give up</h2>
            {next.giveUp.map((g, i) => (
              <span key={i} className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{g}</span>
            ))}
          </div>
        )}
      </section>

      <span className={labelClass} style={mono}>
        zurp isn&apos;t paid by card issuers for these rankings.
      </span>
    </div>
  );
}
