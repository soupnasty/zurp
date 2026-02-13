"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  MinusCircle,
  Clock,
  XCircle,
  ChevronDown,
  ExternalLink,
  Plane,
  ConciergeBell,
  UtensilsCrossed,
  Ticket,
  Bike,
  Car,
  Dumbbell,
  ShieldCheck,
  Shield,
  Tv,
  Music,
  Hotel,
  ShoppingBag,
  ShoppingCart,
  Coffee,
  Gift,
  Globe,
  Zap,
  Activity,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import type { ClassifiedBenefitGroup } from "./types";

// Map benefit icon string names → Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Plane,
  ConciergeBell,
  UtensilsCrossed,
  Ticket,
  Bike,
  Car,
  Dumbbell,
  ShieldCheck,
  Shield,
  Tv,
  Music,
  Hotel,
  ShoppingBag,
  ShoppingCart,
  Coffee,
  Gift,
  Globe,
  Zap,
  Activity,
  CreditCard,
};

interface BenefitRowProps {
  group: ClassifiedBenefitGroup;
}

const STATUS_CONFIG = {
  captured: {
    icon: CheckCircle2,
    iconBg: "rgba(52,211,153,0.1)",
    iconBorder: "rgba(52,211,153,0.2)",
    iconColor: "var(--color-success)",
    amountColor: "var(--color-success)",
    barColor: "var(--color-success)",
    label: "Captured",
  },
  partial: {
    icon: MinusCircle,
    iconBg: "rgba(248,113,113,0.1)",
    iconBorder: "rgba(248,113,113,0.2)",
    iconColor: "var(--color-danger)",
    amountColor: "var(--color-danger)",
    barColor: "var(--color-danger)",
    label: "Partial",
  },
  expiring: {
    icon: Clock,
    iconBg: "rgba(251,191,36,0.1)",
    iconBorder: "rgba(251,191,36,0.2)",
    iconColor: "var(--color-accent-amber)",
    amountColor: "var(--color-accent-amber)",
    barColor: "var(--color-accent-amber)",
    label: "Expiring",
  },
  unused: {
    icon: XCircle,
    iconBg: "rgba(255,255,255,0.03)",
    iconBorder: "rgba(255,255,255,0.06)",
    iconColor: "var(--text-dim)",
    amountColor: "var(--text-dim)",
    barColor: "var(--text-dim)",
    label: "Unused",
  },
};

function formatResetDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatTxDate(isoDate: string | Date): string {
  const d = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCycleLabel(cycle: string, activeMonths?: number[]): string {
  const MONTH_ABBREVS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  if (activeMonths && activeMonths.length > 0 && activeMonths.length < 12) {
    if (activeMonths.length === 1) return MONTH_ABBREVS[activeMonths[0]];
    return `${MONTH_ABBREVS[activeMonths[0]]} \u2013 ${MONTH_ABBREVS[activeMonths[activeMonths.length - 1]]}`;
  }

  switch (cycle) {
    case "monthly": return "Monthly";
    case "biannual_h1": return "Jan \u2013 Jun";
    case "biannual_h2": return "Jul \u2013 Dec";
    case "annual_calendar": return "Annual";
    case "annual_anniversary": return "Anniversary year";
    case "quarterly_q1": return "Q1 (Jan\u2013Mar)";
    case "quarterly_q2": return "Q2 (Apr\u2013Jun)";
    case "quarterly_q3": return "Q3 (Jul\u2013Sep)";
    case "quarterly_q4": return "Q4 (Oct\u2013Dec)";
    case "quadrennial": return "Every 4 years";
    case "subscription": return "Subscription";
    default: return cycle;
  }
}

function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    options.push({ value: `${mm}-${yyyy}`, label });
  }
  return options;
}

function BenefitIcon({
  group,
  config,
  size,
  iconSize,
  badgeSize,
  badgeIconSize,
}: {
  group: ClassifiedBenefitGroup;
  config: (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG];
  size: number;
  iconSize: number;
  badgeSize: number;
  badgeIconSize: number;
}) {
  const StatusIcon = config.icon;
  const FallbackIcon = ICON_MAP[group.icon] ?? CreditCard;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="flex items-center justify-center rounded-[10px]"
        style={{
          width: size,
          height: size,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {group.brandSlug ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`https://cdn.simpleicons.org/${group.brandSlug}/f0f2f5`}
            alt=""
            width={iconSize}
            height={iconSize}
            style={{ opacity: 0.85 }}
          />
        ) : (
          <FallbackIcon
            size={iconSize}
            strokeWidth={1.75}
            style={{ color: "var(--text-primary)", opacity: 0.85 }}
          />
        )}
      </div>
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{
          width: badgeSize,
          height: badgeSize,
          bottom: -2,
          right: -2,
          background: config.iconBg,
          border: `1px solid ${config.iconBorder}`,
        }}
      >
        <StatusIcon size={badgeIconSize} strokeWidth={2.5} style={{ color: config.iconColor }} />
      </div>
    </div>
  );
}

export function BenefitRow({ group }: BenefitRowProps) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[group.status];
  const pct =
    group.totalCredit > 0
      ? Math.min(100, (group.totalUsed / group.totalCredit) * 100)
      : 0;

  // Detail line based on status
  let detail = "";
  if (group.status === "captured") {
    detail = `Resets on ${formatResetDate(group.cycleEnd)}`;
  } else if (group.status === "expiring") {
    detail = `$${Math.round(group.totalRemaining)} remaining \u00b7 ${group.daysRemaining} days left`;
  } else if (group.status === "partial") {
    detail = `$${Math.round(group.totalRemaining)} remaining \u00b7 resets ${formatResetDate(group.cycleEnd)}`;
  } else {
    detail = `$${Math.round(group.totalCredit)}/${group.cycle === "monthly" ? "mo" : "yr"} \u00b7 never used`;
  }

  return (
    <div className="border-b border-[var(--border-subtle)] last:border-0">
      {/* Mobile summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-card-hover)] md:hidden"
      >
        <BenefitIcon group={group} config={config} size={32} iconSize={16} badgeSize={12} badgeIconSize={7} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
              {group.name}
            </span>
            <div className="shrink-0 flex items-center gap-1.5">
              <span
                className="text-[13px] font-bold"
                style={{ fontFamily: "var(--font-mono)", color: config.amountColor }}
              >
                ${Math.round(group.totalUsed)}
              </span>
              <span
                className="text-[11px] text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                / ${Math.round(group.totalCredit)}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`text-[var(--text-secondary)] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </div>
          </div>
          {/* Mobile progress bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <div
              className="flex-1 overflow-hidden rounded-sm"
              style={{ height: 4, background: "rgba(255,255,255,0.04)" }}
            >
              <div
                className="h-full rounded-sm"
                style={{ width: `${pct}%`, background: config.barColor }}
              />
            </div>
            <span className="shrink-0 text-[10px] text-[var(--text-secondary)]">
              {group.status === "expiring" ? (
                <span style={{ color: "var(--color-accent-amber)" }}>
                  {group.daysRemaining}d left
                </span>
              ) : group.status === "captured" ? (
                `Resets ${formatResetDate(group.cycleEnd)}`
              ) : group.status === "partial" ? (
                `$${Math.round(group.totalRemaining)} left`
              ) : (
                "Unused"
              )}
            </span>
          </div>
        </div>
      </button>

      {/* Desktop summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="benefit-row-desktop hidden w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-card-hover)] md:grid"
      >
        <BenefitIcon group={group} config={config} size={36} iconSize={18} badgeSize={14} badgeIconSize={8} />

        {/* Name + detail */}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {group.name}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            {group.status === "expiring" ? (
              <>
                ${Math.round(group.totalRemaining)} remaining &middot;{" "}
                <span className="font-bold" style={{ color: "var(--color-accent-amber)" }}>
                  {group.daysRemaining} days left
                </span>
              </>
            ) : (
              detail
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div
            className="overflow-hidden rounded-sm"
            style={{ height: 6, background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="h-full rounded-sm transition-all"
              style={{ width: `${pct}%`, background: config.barColor }}
            />
          </div>
        </div>

        {/* Amount */}
        <div className="whitespace-nowrap text-right">
          <span
            className="text-sm font-bold"
            style={{ fontFamily: "var(--font-mono)", color: config.amountColor }}
          >
            ${Math.round(group.totalUsed)}
          </span>
          <span
            className="text-sm text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {" / "}${Math.round(group.totalCredit)}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`text-[var(--text-secondary)] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded detail section */}
      {expanded && <BenefitDetail group={group} config={config} pct={pct} />}
    </div>
  );
}

// ── Expanded detail panel ──

interface BenefitDetailProps {
  group: ClassifiedBenefitGroup;
  config: (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG];
  pct: number;
}

function BenefitDetail({ group, config, pct }: BenefitDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${mm}-${now.getFullYear()}`;
  });

  const details = group.details;
  const isCredit = group.type === "credit";
  const isSubscription = group.type === "subscription";
  const isGrouped = group.benefits.length > 1;
  const remaining = Math.max(0, group.totalRemaining);
  const txs = group.benefitTransactions;
  const benefitId = group.benefits[0]?.benefitId ?? group.id;

  async function handleActivate() {
    const res = await fetch("/api/benefits/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benefitId, activatedMonth: selectedMonth }),
    });
    if (res.ok) startTransition(() => router.refresh());
  }

  async function handleDeactivate() {
    const res = await fetch("/api/benefits/activate", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benefitId }),
    });
    if (res.ok) startTransition(() => router.refresh());
  }

  return (
    <div
      className="border-t border-[var(--border-subtle)] px-3 pb-4 pt-3 md:px-4 md:pb-5 md:pt-4"
      style={{ marginLeft: 0 }}
    >
      {/* Status + cycle badges */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px]"
          style={{
            fontFamily: "var(--font-mono)",
            color: config.iconColor,
            background: config.iconBg,
            border: `1px solid ${config.iconBorder}`,
          }}
        >
          {config.label}
        </span>
        <span
          className="rounded-full border border-[var(--border-subtle)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {getCycleLabel(group.cycle, group.activeMonths)}
        </span>
        {group.daysRemaining <= 30 && isCredit && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent-amber)",
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.15)",
            }}
          >
            Resets {formatResetDate(group.cycleEnd)}
          </span>
        )}
        {group.sunsetDate && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent-amber)",
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.15)",
            }}
          >
            Expires {formatResetDate(group.sunsetDate)}
          </span>
        )}
      </div>

      {/* Usage breakdown for credit-type benefits */}
      {isCredit && (
        <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-mono)",
                color: config.amountColor,
              }}
            >
              ${group.totalUsed.toFixed(0)}
            </span>
            <span
              className="text-xs text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              of ${group.totalCredit.toFixed(0)} &middot; ${remaining.toFixed(0)} remaining
            </span>
          </div>
          <div
            className="overflow-hidden rounded-full"
            style={{ height: 8, background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: config.barColor }}
            />
          </div>

          {/* Sub-credit breakdown for grouped benefits (DoorDash) */}
          {isGrouped && (
            <div className="mt-3 space-y-1.5 border-t border-[var(--border-subtle)] pt-3">
              {group.benefits.map((b) => {
                const subRemaining = Math.max(0, b.amountRemaining);
                const subUsed = b.creditAmount - subRemaining;
                return (
                  <div
                    key={b.benefitId}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate text-xs text-[var(--text-secondary)]">
                      {b.benefitName}
                    </span>
                    <span
                      className="shrink-0 text-xs text-[var(--text-secondary)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      ${subUsed.toFixed(0)} / ${b.creditAmount.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* YTD */}
          {group.ytdUsed != null && group.ytdUsed > 0 && (
            <div
              className="mt-3 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span
                style={{
                  color:
                    group.ytdUsed > 0
                      ? "var(--color-success)"
                      : "var(--text-secondary)",
                }}
              >
                ${group.ytdUsed.toFixed(0)}
              </span>{" "}
              captured this year
            </div>
          )}
        </div>
      )}

      {/* Subscription activation panel */}
      {isSubscription && (
        <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4">
          <div className="flex items-baseline justify-between">
            <span
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-accent-purple)",
              }}
            >
              ${group.totalCredit.toFixed(2)}
            </span>
            <span
              className="text-xs text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              per month
            </span>
          </div>

          {group.isActivated && group.activatedAt ? (
            <div className="mt-3">
              <p className="text-sm text-[var(--text-secondary)]">
                Activated since{" "}
                {new Date(group.activatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </p>
              <button
                onClick={handleDeactivate}
                disabled={isPending}
                className="mt-2 text-xs text-[var(--text-secondary)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                {isPending ? "Updating..." : "Deactivate"}
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <p className="mb-2 text-sm text-[var(--text-secondary)]">
                When did you activate this subscription?
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--color-accent-cyan)] focus:outline-none"
                >
                  {getMonthOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleActivate}
                  disabled={isPending}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-blue))",
                  }}
                >
                  {isPending ? "Saving..." : "Activate"}
                </button>
              </div>
            </div>
          )}

          {/* YTD for subscription */}
          {group.ytdUsed != null && group.ytdUsed > 0 && (
            <div
              className="mt-3 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span style={{ color: "var(--color-success)" }}>
                ${group.ytdUsed.toFixed(0)}
              </span>{" "}
              captured this year
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {details?.description && (
        <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
          {details.description}
        </p>
      )}

      {/* How to use */}
      {details?.howToUse && details.howToUse.length > 0 && (
        <div className="mb-4">
          <h4
            className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            HOW TO USE
          </h4>
          <ol className="space-y-1.5">
            {details.howToUse.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-accent-cyan)",
                    background: "rgba(34,211,238,0.08)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-[var(--text-primary)]">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Matched transactions */}
      {txs.length > 0 && (
        <div className="mb-4">
          <h4
            className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            MATCHED TRANSACTIONS
            <span
              className="rounded-full border border-[var(--border-subtle)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {txs.length}
            </span>
          </h4>
          <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden">
            {txs.map((tx, i) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between px-3 py-2.5 ${
                  i < txs.length - 1
                    ? "border-b border-[var(--border-subtle)]"
                    : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-[var(--text-primary)]">
                    {tx.merchantName || "Unknown"}
                  </span>
                  <span
                    className="text-[11px] text-[var(--text-secondary)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatTxDate(tx.date)}
                  </span>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <span
                    className="block text-xs text-[var(--text-secondary)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    ${tx.amount.toFixed(2)}
                  </span>
                  <span
                    className="block text-xs font-bold"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-success)",
                    }}
                  >
                    ${tx.creditApplied.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            {/* Total row */}
            <div className="flex items-center justify-between border-t border-[var(--border-medium)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
              <span
                className="text-xs text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Total credit applied
              </span>
              <span
                className="text-xs font-bold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-success)",
                }}
              >
                $
                {txs
                  .reduce((sum, tx) => sum + tx.creditApplied, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Links */}
      {details?.links && details.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {details.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-cyan)] transition-colors hover:bg-[rgba(34,211,238,0.05)]"
            >
              <ExternalLink size={12} strokeWidth={2} />
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
