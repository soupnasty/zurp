"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { insightDollarValue } from "@/lib/insights/display-value";
import type { CaptureRate, RenewalStatus, ExpiringCredit, CompareSnapshot } from "@/lib/home/queries";

export interface HomeQueueItem {
  id: string;
  category: string;
  renderedTitle: string;
  renderedBody: string;
  templateVars: Record<string, string | number>;
}

interface HomeTabProps {
  activeCardName: string;
  activeCardFee: number;
  captureRate: CaptureRate | null;
  renewal: (Omit<RenewalStatus, "renewsAt"> & { renewsAt: string }) | null;
  expiring: ExpiringCredit[];
  queue: HomeQueueItem[];
  snapshot: CompareSnapshot | null;
  lastSyncedAt: string | null;
}

const labelCaps: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "2px",
  color: "var(--text-secondary)",
  display: "block",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatRenewalDate(iso: string): string {
  const d = new Date(iso);
  return `${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** Category → queue row accent. Benefit money purple, redirects blue. */
function queueAccent(category: string): string {
  if (category.startsWith("B") || category.startsWith("C")) return "var(--color-accent-purple)";
  return "var(--color-accent-blue)";
}

export function HomeTab({
  activeCardName,
  activeCardFee,
  captureRate,
  renewal,
  expiring,
  queue,
  snapshot,
  lastSyncedAt,
}: HomeTabProps) {
  const expiringTotal = expiring.reduce((s, e) => s + e.remaining, 0);
  const queueTotal = queue.reduce(
    (s, q) => s + insightDollarValue(q.category, q.templateVars),
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <span
          className="text-[10px] font-bold uppercase tracking-[2.5px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Home
        </span>
        <h1 className="mt-1 text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          Your card, right now
        </h1>
        <span
          className="text-[10px] md:text-[12px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {activeCardName}
          {lastSyncedAt && <> | synced {relativeTime(lastSyncedAt)}</>}
        </span>
      </div>

      {/* Status tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Capture rate */}
        <div className="px-3 py-4 md:px-6 md:py-5" style={{ background: "var(--bg-secondary)" }}>
          <span style={{ ...labelCaps, fontSize: 9 }} className="md:!text-[10px]">
            Capture rate · 12mo
          </span>
          {captureRate ? (
            <>
              <span
                className="text-[20px] md:text-[28px]"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: "var(--color-accent-purple)",
                  lineHeight: 1.2,
                }}
              >
                {captureRate.pct}%
              </span>
              <span style={{ display: "block", fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                ~${Math.round(captureRate.leftOnTable).toLocaleString()} left on the table
              </span>
            </>
          ) : (
            <span style={{ display: "block", fontSize: 12, color: "var(--text-dim)", marginTop: 8, lineHeight: 1.5 }}>
              Collecting your first cycles — appears once a benefit period closes
            </span>
          )}
        </div>

        {/* Renewal */}
        <div className="px-3 py-4 md:px-6 md:py-5" style={{ background: "var(--bg-secondary)" }}>
          <span style={{ ...labelCaps, fontSize: 9 }} className="md:!text-[10px]">
            {renewal ? `Renewal · ${formatRenewalDate(renewal.renewsAt)}` : "Renewal"}
          </span>
          {renewal ? (
            <>
              <span
                className="text-[20px] md:text-[28px]"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: renewal.tracking === "keep" ? "var(--color-success)" : "var(--color-warning)",
                  lineHeight: 1.2,
                }}
              >
                {renewal.tracking === "keep" ? "KEEP" : "BEHIND"}
              </span>
              <span style={{ display: "block", fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                {renewal.tracking === "keep"
                  ? `tracking ~$${Math.abs(renewal.netSoFar).toLocaleString()} past break-even`
                  : `~$${Math.abs(renewal.netSoFar).toLocaleString()} short of the $${renewal.annualFee} fee`}
              </span>
            </>
          ) : activeCardFee === 0 ? (
            <span style={{ display: "block", fontSize: 12, color: "var(--text-dim)", marginTop: 8, lineHeight: 1.5 }}>
              $0 annual fee — always past break-even
            </span>
          ) : (
            <Link
              href="/settings"
              style={{ display: "block", fontSize: 12, color: "var(--color-accent-cyan)", marginTop: 8, lineHeight: 1.5 }}
            >
              Set your anniversary date to track break-even →
            </Link>
          )}
        </div>

        {/* Expiring soon */}
        <div className="px-3 py-4 md:px-6 md:py-5" style={{ background: "var(--bg-secondary)" }}>
          <span style={{ ...labelCaps, fontSize: 9 }} className="md:!text-[10px]">
            Expiring · 14d
          </span>
          <span
            className="text-[20px] md:text-[28px]"
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: expiring.length > 0 ? "var(--color-accent-purple)" : "var(--text-secondary)",
              lineHeight: 1.2,
            }}
          >
            {expiring.length > 0 ? `$${Math.round(expiringTotal).toLocaleString()}` : "$0"}
          </span>
          <span style={{ display: "block", fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            {expiring.length > 0
              ? `across ${expiring.length} credit${expiring.length === 1 ? "" : "s"} — use or lose`
              : "nothing expires in the next two weeks"}
          </span>
        </div>
      </div>

      {/* Action queue */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <span style={labelCaps}>
            Do next{queue.length > 0 && queueTotal > 0 && (
              <> · worth ~${Math.round(queueTotal).toLocaleString()}</>
            )}
          </span>
          <Link
            href="/dashboard/insights"
            className="text-[11px] text-[var(--color-accent-cyan)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            all insights →
          </Link>
        </div>

        {queue.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {queue.map((item) => {
              const dollar = insightDollarValue(item.category, item.templateVars);
              return (
                <Link
                  key={item.id}
                  href="/dashboard/insights"
                  className="grid items-baseline gap-x-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3 transition-colors hover:border-[var(--border-medium)]"
                  style={{ gridTemplateColumns: "1fr auto" }}
                >
                  <span>
                    <span className="block text-[13px] font-semibold text-[var(--text-primary)]">
                      {item.renderedTitle}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
                      {item.renderedBody}
                    </span>
                  </span>
                  {dollar > 0 && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: queueAccent(item.category),
                        whiteSpace: "nowrap",
                      }}
                    >
                      ${Math.round(dollar).toLocaleString()}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.04)] px-4 py-4">
            <CheckCircle2 size={18} strokeWidth={1.75} className="shrink-0 text-[var(--color-success)]" />
            <span className="text-[13px] text-[var(--text-secondary)]">
              Nothing to fix — you&apos;re capturing everything available right now.
            </span>
          </div>
        )}
      </div>

      {/* Compare snapshot */}
      {snapshot && (
        <Link
          href="/dashboard/compare"
          className="mt-6 flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3 transition-colors hover:border-[var(--border-medium)]"
        >
          <span className="text-[12.5px] text-[var(--text-secondary)]">
            Compare: your card ranks{" "}
            <span
              style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}
            >
              {snapshot.rank}/{snapshot.totalCards}
            </span>{" "}
            for your spending
          </span>
          <span
            className="flex items-center gap-1 text-[11px] text-[var(--color-accent-cyan)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            leaderboard <ArrowRight size={12} strokeWidth={2} />
          </span>
        </Link>
      )}
    </div>
  );
}
