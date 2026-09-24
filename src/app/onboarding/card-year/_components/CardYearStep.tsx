"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveCardYear } from "../../actions";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT = MONTHS.map((m) => m.slice(0, 3));
const mono = { fontFamily: "var(--font-mono)" } as const;

const label = "text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--text-secondary)]";
const primaryBtn =
  "inline-flex min-h-[48px] items-center rounded-[14px] px-7 text-[15px] font-semibold text-[var(--bg-primary)] disabled:opacity-60";
const ghostBtn =
  "min-h-[48px] rounded-[10px] border border-[var(--border-medium)] px-5 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
const gradient = { background: "linear-gradient(135deg, #22d3ee, #60a5fa)" };

function range(month: number, day: number): string {
  const end = new Date(Date.UTC(2027, month - 1, day - 1));
  return `${SHORT[month - 1]} ${day} → ${SHORT[end.getUTCMonth()]} ${end.getUTCDate()}`;
}

interface CardYearStepProps {
  cardProfileId: string;
  cardName: string;
  annualFee: number;
  /** ISO anniversary detected from the fee charge; null when not found. */
  detectedAt: string | null;
}

export function CardYearStep({ cardProfileId, cardName, annualFee, detectedAt }: CardYearStepProps) {
  const detected = detectedAt ? new Date(detectedAt) : null;
  const [step, setStep] = useState<"detected" | "ask" | "done">(detected ? "detected" : "ask");
  const [month, setMonth] = useState(detected ? detected.getUTCMonth() + 1 : 1);
  const [day, setDay] = useState(detected ? detected.getUTCDate() : 1);
  const [unsure, setUnsure] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const daysInMonth = new Date(Date.UTC(2027, month, 0)).getUTCDate();
  const fee = `$${annualFee.toLocaleString()}`;

  const save = () =>
    startTransition(async () => {
      try {
        setError(null);
        await saveCardYear(cardProfileId, month, day);
        setUnsure(false);
        setStep("done");
      } catch {
        setError("Couldn't save that. Try again.");
      }
    });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <span className="text-[20px] font-bold text-[var(--text-primary)]" style={mono}>zurp</span>
        <span className={label} style={mono}>Last step · card year</span>
      </div>

      {step === "detected" && detected && (
        <section className="flex flex-col gap-5 rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-7">
          <span className={label} style={mono}>We found your annual fee</span>
          <h1 className="text-[24px] font-bold leading-tight text-[var(--text-primary)]">
            Your {fee} fee posted on {SHORT[detected.getUTCMonth()]} {detected.getUTCDate()}, {detected.getUTCFullYear()}
          </h1>
          <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
            So your {cardName} card year runs{" "}
            <strong className="text-[var(--text-primary)]" style={mono}>{range(month, day)}</strong>. We use it to line up
            credits that reset on your anniversary and to set your renewal deadline.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/verdict" className={primaryBtn} style={gradient}>Looks right</Link>
            <button type="button" className={ghostBtn} onClick={() => setStep("ask")}>That&apos;s not it</button>
          </div>
        </section>
      )}

      {step === "ask" && (
        <section className="flex flex-col gap-5 rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-7">
          <span className={label} style={mono}>One last thing</span>
          <h1 className="text-[24px] font-bold leading-tight text-[var(--text-primary)]">When does your {fee} fee post?</h1>
          <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
            {detected ? "Pick the right date." : "We couldn't find it in your transactions yet."} Your card year decides when
            anniversary credits reset and when your renewal deadline falls.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-[13px] text-[var(--text-secondary)]">
              Month
              <select
                value={month}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setMonth(m);
                  setDay((d) => Math.min(d, new Date(Date.UTC(2027, m, 0)).getUTCDate()));
                }}
                className="min-h-[48px] rounded-[10px] border border-[var(--border-medium)] bg-[var(--bg-primary)] px-3.5 text-[15px] text-[var(--text-primary)]"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-[13px] text-[var(--text-secondary)]">
              Day
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="min-h-[48px] rounded-[10px] border border-[var(--border-medium)] bg-[var(--bg-primary)] px-3.5 text-[15px] text-[var(--text-primary)]"
              >
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Tip: it&apos;s usually the month you opened the card. Check the statement that shows the fee.
          </p>
          {error && <p className="text-[14px] text-[var(--color-danger)]">{error}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={primaryBtn} style={gradient} disabled={pending} onClick={save}>
              {pending ? "Saving…" : "Set card year"}
            </button>
            <button
              type="button"
              className={ghostBtn}
              disabled={pending}
              onClick={() => {
                setUnsure(true);
                setStep("done");
              }}
            >
              I&apos;m not sure
            </button>
          </div>
        </section>
      )}

      {step === "done" && (
        <section className="flex flex-col gap-4 rounded-[20px] border border-[var(--border-medium)] bg-[var(--bg-secondary)] p-7">
          <span className="text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--text-primary)]" style={mono}>
            {unsure ? "Card year" : "✓ Card year set"}
          </span>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">
            {unsure ? "Using the calendar year for now" : `Your card year: ${range(month, day)}`}
          </h1>
          <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
            {unsure
              ? "We'll switch to your real card year when we see the fee on a statement. You can also set it any time in Settings."
              : "Credits that reset on your anniversary will line up with your statements, and your renewal deadline is set."}
          </p>
          <div>
            <Link href="/dashboard/verdict" className={primaryBtn} style={gradient}>See your verdict →</Link>
          </div>
        </section>
      )}

      <p className="text-[13px] text-[var(--text-secondary)]">You can change this any time in Settings.</p>
    </div>
  );
}
