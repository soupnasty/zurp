"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import type { RewardsView, RewardsCredit } from "@/lib/rewards/queries";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

const mono = { fontFamily: "var(--font-mono)" } as const;
const labelClass = "text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--text-secondary)]";
const panel = "rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]";
const secondaryBtn =
  "min-h-[44px] whitespace-nowrap rounded-[10px] border border-[rgba(34,211,238,0.35)] bg-[rgba(34,211,238,0.1)] px-3.5 text-[14px] font-medium text-[var(--color-accent-cyan)] transition-colors hover:bg-[rgba(34,211,238,0.16)] disabled:opacity-50";
const ghostBtn =
  "min-h-[44px] whitespace-nowrap rounded-[10px] border border-[var(--border-medium)] px-3 text-[14px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50";

/** POST/DELETE JSON, then refresh server data. */
function useAction() {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();

  async function run(requests: { url: string; method: "POST" | "DELETE"; body: unknown }[], toast?: { message: string; undo?: () => void }) {
    try {
      for (const r of requests) {
        const res = await fetch(r.url, {
          method: r.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(r.body),
        });
        if (!res.ok) throw new Error(`${r.url} ${res.status}`);
      }
      if (toast) addToast(toast.message, toast.undo);
    } catch (e) {
      console.error(e);
      addToast("Couldn't save that. Try again.");
    }
    startTransition(() => router.refresh());
  }
  return { run, pending };
}

interface RewardsTabProps {
  view: RewardsView;
  cardName: string;
  annualFee: number;
}

export function RewardsTab({ view, cardName, annualFee }: RewardsTabProps) {
  const { run, pending } = useAction();
  const setPrefs = (benefitIds: string[], fields: Record<string, unknown>) => ({
    url: "/api/benefits/preferences",
    method: "POST" as const,
    body: { benefitIds, ...fields },
  });

  const hide = (c: { name: string; benefitIds: string[] }) =>
    run([setPrefs(c.benefitIds, { hidden: true, reminderMode: "off" })], {
      message: `${c.name} hidden`,
      undo: () => run([setPrefs(c.benefitIds, { hidden: false, reminderMode: "auto" })]),
    });

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1.5 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <span className={labelClass} style={mono}>
            Rewards · card year {fmtDate(view.cardYear.start)} → {fmtDate(view.cardYear.end)}
          </span>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-[28px]">{cardName}</h1>
        </div>
        <span className="text-[13px] text-[var(--text-secondary)]" style={mono}>
          Day {view.cardYear.day} of {view.cardYear.days}
        </span>
      </header>

      {view.cardYear.estimated && (
        <Link
          href="/settings"
          className="-mt-6 rounded-xl border border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.06)] px-4 py-3 text-[14px] text-[var(--text-secondary)]"
        >
          Using the calendar year until we know your card anniversary.{" "}
          <span className="text-[var(--color-accent-cyan)]">Set it in Settings →</span>
        </Link>
      )}

      <EarnedSection view={view} annualFee={annualFee} />

      <section aria-labelledby="unused-h" className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
          <h2 id="unused-h" className="text-xl font-semibold text-[var(--text-primary)]">Not using yet</h2>
          <span className="text-[14px] text-[var(--text-secondary)]">
            Up to <strong className="text-[var(--color-accent-purple)]" style={mono}>{money(view.notUsingTotal)}</strong> more before{" "}
            {fmtDate(view.cardYear.end)}
            {view.soonTotal > 0 && (
              <>
                {" "}· <strong className="text-[var(--color-accent-amber)]" style={mono}>{money(view.soonTotal)}</strong> resets in the next 2 weeks
              </>
            )}
          </span>
        </div>

        <div className={`${panel} overflow-hidden`}>
          <div
            className="hidden gap-5 border-b border-[var(--border-medium)] px-6 py-3.5 md:grid"
            style={{ gridTemplateColumns: "minmax(0,1fr) 170px 120px 260px" }}
          >
            {["Credits to use", "This cycle", `Left to ${fmtDate(view.cardYear.end)}`, ""].map((h, i) => (
              <span key={i} className={`${labelClass} ${i === 2 ? "text-right" : ""}`} style={mono}>
                {h}
              </span>
            ))}
          </div>
          {view.credits.length === 0 && (
            <p className="px-6 py-6 text-[14px] text-[var(--text-secondary)]">
              Nothing left to use this card year. Everything available is captured or hidden.
            </p>
          )}
          {view.credits.map((c) => (
            <CreditRow
              key={c.key}
              credit={c}
              cardYearEnd={view.cardYear.end}
              pending={pending}
              onUsed={() =>
                run(c.currentBenefitIds.map((id) => ({ url: "/api/benefits/redeem", method: "POST", body: { benefitId: id } })))
              }
              onUndo={() =>
                run(c.redeemedBenefitIds.map((id) => ({ url: "/api/benefits/redeem", method: "DELETE", body: { benefitId: id } })))
              }
              onHide={() => hide(c)}
              onReminder={(mode, leadDays) => run([setPrefs(c.benefitIds, { reminderMode: mode, reminderLeadDays: leadDays })])}
            />
          ))}
          {view.hidden.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 px-6 py-3.5 text-[13px] text-[var(--text-secondary)]">
              <span>Hidden, and not counted against you:</span>
              {view.hidden.map((h) => (
                <button
                  key={h.key}
                  type="button"
                  disabled={pending}
                  onClick={() => run([setPrefs(h.benefitIds, { hidden: false, reminderMode: "auto" })])}
                  className="min-h-[36px] rounded-full border border-[rgba(34,211,238,0.35)] px-3 text-[13px] text-[var(--color-accent-cyan)]"
                >
                  {h.name} · restore
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {view.turnOn.length > 0 && (
            <TurnOnCard
              items={view.turnOn}
              cardYearEnd={view.cardYear.end}
              pending={pending}
              onToggle={(t, on) => {
                const now = new Date();
                const month = `${String(now.getUTCMonth() + 1).padStart(2, "0")}-${now.getUTCFullYear()}`;
                if (t.kind === "subscription") {
                  run([{ url: "/api/benefits/activate", method: on ? "POST" : "DELETE", body: on ? { benefitId: t.benefitIds[0], activatedMonth: month } : { benefitId: t.benefitIds[0] } }]);
                } else {
                  run([setPrefs(t.benefitIds, { activated: on })]);
                }
              }}
            />
          )}
          {view.pointTips.length > 0 && (
            <div className={`${panel} overflow-hidden`}>
              <div className="flex items-baseline justify-between border-b border-[var(--border-medium)] px-6 py-4">
                <span className={labelClass} style={mono}>Earn more on the same spending</span>
              </div>
              {view.pointTips.map((t) => (
                <div key={t.id} className="flex flex-col gap-2 border-b border-[var(--border-subtle)] px-6 py-4 last:border-b-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[16px] font-semibold text-[var(--text-primary)]">{t.title}</span>
                    <span className="whitespace-nowrap text-[14px] font-bold text-[var(--color-accent-blue)]" style={mono}>
                      +{t.extraPoints.toLocaleString()} pts
                    </span>
                  </div>
                  <span className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{t.body}</span>
                  <span className="text-[12px] text-[var(--text-secondary)]" style={mono}>≈ {money(t.extraValue)} missed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {view.expired.total > 0 && <ExpiredPanel expired={view.expired} />}

      <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
        Credits count when we match them to a transaction or you tell us you used them.
        {view.earned.points && <> Points are valued at about {view.earned.points.cpp.toFixed(1)}¢ each, a typical redemption.</>}
      </p>
    </div>
  );
}

function EarnedSection({ view, annualFee }: { view: RewardsView; annualFee: number }) {
  const { earned } = view;
  const pointsValue = earned.points?.value ?? 0;
  const pct = (n: number) => (earned.total > 0 ? `${(n / earned.total) * 100}%` : "0%");

  return (
    <section aria-labelledby="earned-h" className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
        <h2 id="earned-h" className="text-xl font-semibold text-[var(--text-primary)]">Earned so far</h2>
        {annualFee > 0 && (
          <Link href="/dashboard/verdict" className="text-[14px] text-[var(--color-accent-cyan)]">
            Is it worth {money(annualFee)} next year? See the verdict →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-[var(--border-subtle)] bg-[var(--border-subtle)] md:grid-cols-[0.8fr_1fr_1fr]">
        <div className="flex flex-col gap-3.5 bg-[var(--bg-secondary)] p-6 md:p-7">
          <span className={labelClass} style={mono}>This card year</span>
          <span className="text-[40px] font-bold leading-none text-[var(--text-primary)] md:text-[48px]" style={mono}>
            {money(earned.total)}
          </span>
          <div className="flex h-2.5 overflow-hidden rounded-[5px] bg-[rgba(255,255,255,0.05)]">
            <div style={{ width: pct(earned.creditsTotal), background: "var(--color-accent-purple)" }} />
            <div style={{ width: pct(pointsValue), background: "var(--color-accent-blue)" }} />
          </div>
          <div className="flex flex-col gap-1.5 text-[14px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-accent-purple)]" />
              Credits used
              <strong className="ml-auto text-[var(--color-accent-purple)]" style={mono}>{money(earned.creditsTotal)}</strong>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-accent-blue)]" />
              Points earned
              <strong className="ml-auto text-[var(--color-accent-blue)]" style={mono}>{money(pointsValue)}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 bg-[var(--bg-secondary)] p-6 md:p-7">
          <div className="flex items-baseline justify-between">
            <span className={labelClass} style={mono}>Credits used</span>
            <span className="text-[17px] font-bold text-[var(--color-accent-purple)]" style={mono}>{money(earned.creditsTotal)}</span>
          </div>
          {view.expired.capture && (
            <span className="text-[13px] text-[var(--text-secondary)]">
              {view.expired.capture.pct}% of the {money(view.expired.capture.available)} in credits that have come due so far
            </span>
          )}
          <div className="flex flex-col">
            {earned.credits.length === 0 && (
              <span className="py-2 text-[14px] text-[var(--text-secondary)]">No credits used yet this card year.</span>
            )}
            {earned.credits.map((c) => (
              <div key={c.key} className="flex items-baseline gap-2.5 border-t border-[var(--border-subtle)] py-2 text-[14px]">
                <span className="font-medium text-[var(--text-primary)]">{c.name}</span>
                <span className="ml-auto font-bold text-[var(--color-accent-purple)]" style={mono}>{money(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3.5 bg-[var(--bg-secondary)] p-6 md:p-7">
          <div className="flex items-baseline justify-between">
            <span className={labelClass} style={mono}>Points earned</span>
            <span className="text-[17px] font-bold text-[var(--color-accent-blue)]" style={mono}>
              {(earned.points?.total ?? 0).toLocaleString()} pts
            </span>
          </div>
          {earned.points ? (
            <>
              <span className="text-[13px] text-[var(--text-secondary)]">
                Worth about {money(earned.points.value)} at {earned.points.cpp.toFixed(1)}¢ each
              </span>
              <div className="flex flex-col">
                {earned.points.categories.slice(0, 5).map((p) => (
                  <div
                    key={p.label}
                    className="grid items-baseline gap-2 border-t border-[var(--border-subtle)] py-2 text-[14px]"
                    style={{ gridTemplateColumns: "minmax(0,1fr) 40px 76px 76px" }}
                  >
                    <span className="truncate font-medium text-[var(--text-primary)]">{p.label}</span>
                    <span className="text-[12px] text-[var(--text-secondary)]" style={mono}>{p.rate}x</span>
                    <span className="text-right text-[12px] text-[var(--text-secondary)]" style={mono}>{money(p.spend)}</span>
                    <span className="text-right font-bold text-[var(--color-accent-blue)]" style={mono}>{p.points.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <span className="text-[13px] text-[var(--text-secondary)]">Points appear after your first sync.</span>
          )}
        </div>
      </div>
    </section>
  );
}

const REMINDER_OPTIONS: { value: string; label: string; mode: "auto" | "custom" | "off"; leadDays: number | null }[] = [
  { value: "auto", label: "Remind me: auto", mode: "auto", leadDays: null },
  { value: "3", label: "3 days before", mode: "custom", leadDays: 3 },
  { value: "7", label: "7 days before", mode: "custom", leadDays: 7 },
  { value: "14", label: "14 days before", mode: "custom", leadDays: 14 },
  { value: "off", label: "No reminders", mode: "off", leadDays: null },
];

function CreditRow({
  credit: c,
  cardYearEnd,
  pending,
  onUsed,
  onUndo,
  onHide,
  onReminder,
}: {
  credit: RewardsCredit;
  cardYearEnd: string;
  pending: boolean;
  onUsed: () => void;
  onUndo: () => void;
  onHide: () => void;
  onReminder: (mode: "auto" | "custom" | "off", leadDays: number | null) => void;
}) {
  const used = c.redeemedBenefitIds.length > 0;
  const urgent = c.daysLeft !== null && c.daysLeft <= 14 && c.thisCycle > 0;
  const resetLabel = c.thisCycleEnd
    ? `Resets ${fmtDate(c.thisCycleEnd)}${c.daysLeft !== null && c.daysLeft <= 30 ? ` · ${c.daysLeft} days` : ""}`
    : "Starts later this card year";
  const reminderValue =
    c.reminder.mode === "custom" ? String(c.reminder.leadDays ?? "auto") : c.reminder.mode;
  // A custom lead time outside the presets still shows as its own option.
  const options = REMINDER_OPTIONS.some((o) => o.value === reminderValue)
    ? REMINDER_OPTIONS
    : [...REMINDER_OPTIONS, { value: reminderValue, label: `${reminderValue} days before`, mode: "custom" as const, leadDays: Number(reminderValue) }];

  return (
    <div
      className={`grid grid-cols-1 gap-3 border-b border-[var(--border-subtle)] px-5 py-4 md:gap-5 md:px-6 ${c.alerted ? "bg-[rgba(251,191,36,0.03)]" : ""}`}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_170px_120px_260px] md:items-center md:gap-5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[16px] font-semibold text-[var(--text-primary)]">{c.name}</span>
          {c.fromSpending && (
            <div className="flex items-start gap-2 text-[14px] leading-relaxed text-[var(--text-secondary)]">
              <span className="mt-0.5 shrink-0 rounded-[5px] border border-[var(--border-medium)] bg-[rgba(255,255,255,0.06)] px-2 text-[11px] font-semibold text-[var(--text-primary)]">
                From your spending
              </span>
              <span>{c.fromSpending}</span>
            </div>
          )}
          {!c.fromSpending && c.howTo && (
            <span className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{c.howTo}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-start">
          {used ? (
            <span className="text-[14px] font-semibold text-[var(--text-primary)]">✓ Used this cycle</span>
          ) : c.thisCycle > 0 ? (
            <span className="text-[15px] font-bold text-[var(--color-accent-purple)]" style={mono}>
              {money(c.thisCycle)} left
            </span>
          ) : null}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[12px] ${
              urgent
                ? "border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.08)] font-bold text-[var(--color-accent-amber)]"
                : "border-[var(--border-medium)] text-[var(--text-secondary)]"
            }`}
            style={mono}
          >
            {resetLabel}
          </span>
        </div>

        <span className="text-[17px] font-bold text-[var(--text-primary)] md:text-right" style={mono}>
          {money(c.restOfYear)}
          <span className="ml-1.5 text-[12px] font-normal text-[var(--text-secondary)] md:hidden">left to {fmtDate(cardYearEnd)}</span>
        </span>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {used ? (
            <button type="button" className={ghostBtn} disabled={pending} onClick={onUndo}>
              Undo
            </button>
          ) : !c.autoMatchable && c.currentBenefitIds.length > 0 ? (
            <button type="button" className={secondaryBtn} disabled={pending} onClick={onUsed}>
              I used it
            </button>
          ) : (
            <span className="text-[13px] text-[var(--text-secondary)]">Tracked automatically</span>
          )}
          <button type="button" className={ghostBtn} disabled={pending} onClick={onHide}>
            Not for me
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] md:justify-end">
        <span className="sr-only">Reminder for {c.name}</span>
        {c.alerted && <span className="text-[var(--color-accent-amber)]">Reminder active ·</span>}
        <select
          value={reminderValue}
          disabled={pending}
          onChange={(e) => {
            const o = options.find((x) => x.value === e.target.value)!;
            onReminder(o.mode, o.leadDays);
          }}
          className="min-h-[36px] rounded-lg border border-[var(--border-medium)] bg-[var(--bg-primary)] px-2 text-[13px] text-[var(--text-primary)]"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function TurnOnCard({
  items,
  cardYearEnd,
  pending,
  onToggle,
}: {
  items: RewardsView["turnOn"];
  cardYearEnd: string;
  pending: boolean;
  onToggle: (item: RewardsView["turnOn"][number], on: boolean) => void;
}) {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className="flex items-baseline justify-between border-b border-[var(--border-medium)] px-6 py-4">
        <span className={labelClass} style={mono}>Turn on once</span>
        <span className="text-[13px] text-[var(--text-secondary)]">One-time setup</span>
      </div>
      {items.map((t) => (
        <div key={t.key} className="flex flex-col gap-2.5 border-b border-[var(--border-subtle)] px-6 py-4 last:border-b-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[16px] font-semibold text-[var(--text-primary)]">{t.name}</span>
            <span className="whitespace-nowrap text-[14px] font-bold text-[var(--color-accent-purple)]" style={mono}>
              {t.kind === "subscription" ? `~${money(t.value)} to ${fmtDate(cardYearEnd)}` : `unlocks ${money(t.value)}`}
            </span>
          </div>
          {t.howTo && <span className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{t.howTo}</span>}
          {t.on ? (
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                ✓ On{t.monthly ? ` · counting ${money(t.monthly)} a month` : ""}
              </span>
              <button type="button" className={ghostBtn} disabled={pending} onClick={() => onToggle(t, false)}>
                Undo
              </button>
            </div>
          ) : (
            <div>
              <button type="button" className={secondaryBtn} disabled={pending} onClick={() => onToggle(t, true)}>
                I turned it on
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExpiredPanel({ expired }: { expired: RewardsView["expired"] }) {
  const [open, setOpen] = useState(false);
  return (
    <section className={`${panel} overflow-hidden`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-[64px] w-full items-center gap-3 px-6 text-left"
      >
        <span className="flex-1 text-[16px] font-semibold text-[var(--text-primary)]">Credits that expired unused</span>
        <span className="text-[16px] font-bold text-[var(--text-primary)]" style={mono}>{money(expired.total)}</span>
        <span className="w-11 text-right text-[14px] text-[var(--color-accent-cyan)]">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="border-t border-[var(--border-subtle)] pb-3">
          {expired.credits.map((c) => (
            <div key={c.key} className="flex items-baseline gap-3 px-6 py-2.5 text-[14px]">
              <span className="font-medium text-[var(--text-primary)]">{c.name}</span>
              <span className="ml-auto font-bold text-[var(--text-secondary)]" style={mono}>{money(c.amount)}</span>
            </div>
          ))}
          {expired.beforeJoined > 0 && (
            <p className="px-6 pt-2 text-[13px] text-[var(--text-secondary)]">
              Includes {money(expired.beforeJoined)} from before you joined zurp.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
