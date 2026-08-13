"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle2, BellOff } from "lucide-react";

export interface SerializedAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  state: string;
  expiresAt: string | null;
  updatedAt: string;
  unread: boolean;
}

interface AlertsTabProps {
  active: SerializedAlert[];
  closed: SerializedAlert[];
}

const labelCaps: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "2px",
  color: "var(--text-dim)",
  display: "block",
};

function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
  );
}

/** Severity dot color: expiry money purple, connection/permanent amber. */
function dotColor(alert: SerializedAlert): string {
  if (alert.state !== "active") return "var(--color-success)";
  if (alert.type === "connection_broken") return "var(--color-warning)";
  if (alert.payload.stage === "escalated") return "var(--color-warning)";
  return "var(--color-accent-purple)";
}

const VERDICT_COLORS: Record<string, string> = {
  keep: "var(--color-success)",
  close_call: "var(--color-warning)",
  reconsider: "var(--color-danger)",
};

export function AlertsTab({ active, closed }: AlertsTabProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  async function handleDismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
    try {
      await fetch("/api/alerts/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: id }),
      });
      router.refresh();
    } catch {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const visible = active.filter((a) => !dismissed.has(a.id));
  const verdict = visible.find((a) => a.type === "renewal_verdict");
  const rows = visible.filter((a) => a.type !== "renewal_verdict");

  const thisWeek = rows.filter((a) => (daysLeft(a.expiresAt) ?? 99) <= 7);
  const thisMonth = rows.filter((a) => {
    const d = daysLeft(a.expiresAt) ?? 99;
    return d > 7 && d <= 31;
  });
  const later = rows.filter((a) => (daysLeft(a.expiresAt) ?? 99) > 31);

  const groups: Array<[string, SerializedAlert[]]> = [
    ["This week", thisWeek],
    ["This month", thisMonth],
    ["Later", later],
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <span
          className="text-[10px] font-bold uppercase tracking-[2.5px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Alerts
        </span>
        <h1 className="mt-1 text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          {visible.length > 0 ? "Needs your attention" : "All quiet"}
        </h1>
        <span
          className="text-[10px] md:text-[12px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {visible.length} active
        </span>
      </div>

      {/* Featured: renewal verdict */}
      {verdict && (
        <FeaturedVerdict
          alert={verdict}
          onDismiss={() => handleDismiss(verdict.id)}
        />
      )}

      {/* Grouped rows */}
      {groups.map(
        ([label, items]) =>
          items.length > 0 && (
            <div key={label} className="mt-5">
              <span style={labelCaps}>{label}</span>
              <div className="mt-2 flex flex-col gap-2">
                {items.map((a) => (
                  <AlertRow
                    key={a.id}
                    alert={a}
                    onDismiss={() => handleDismiss(a.id)}
                  />
                ))}
              </div>
            </div>
          )
      )}

      {/* Empty state — the best screen in the product */}
      {visible.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.04)] px-4 py-5">
          <CheckCircle2
            size={18}
            strokeWidth={1.75}
            className="shrink-0 text-[var(--color-success)]"
          />
          <span className="text-[13px] text-[var(--text-secondary)]">
            Nothing needs you. Credits are on track, your connection is
            healthy, and no fees are due soon.
          </span>
        </div>
      )}

      {/* Recently closed */}
      {closed.length > 0 && (
        <div className="mt-8">
          <span style={labelCaps}>Recent</span>
          <div className="mt-2 flex flex-col gap-2">
            {closed.map((a) => (
              <div
                key={a.id}
                className="grid items-baseline gap-x-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3 opacity-55"
                style={{ gridTemplateColumns: "8px 1fr auto" }}
              >
                <span
                  className="h-2 w-2 self-center rounded-full"
                  style={{
                    background:
                      a.state === "resolved"
                        ? "var(--color-success)"
                        : "var(--text-dim)",
                  }}
                />
                <span>
                  <span className="block text-[12.5px] font-semibold text-[var(--text-primary)]">
                    {a.title}
                  </span>
                </span>
                <span
                  className="text-[10px] uppercase text-[var(--text-dim)]"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}
                >
                  {a.state}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FeaturedVerdict({
  alert,
  onDismiss,
}: {
  alert: SerializedAlert;
  onDismiss: () => void;
}) {
  const verdict = String(alert.payload.verdict ?? "keep");
  const color = VERDICT_COLORS[verdict] ?? "var(--color-success)";
  const credits = Number(alert.payload.creditsCaptured ?? 0);
  const points = Number(alert.payload.pointsValue ?? 0);
  const fee = Number(alert.payload.annualFee ?? 0);
  const days = Number(alert.payload.daysUntil ?? 0);

  const verdictLabel =
    verdict === "close_call"
      ? "CLOSE CALL"
      : verdict === "reconsider"
        ? "RECONSIDER"
        : "KEEP";

  const tint =
    verdict === "close_call"
      ? { border: "rgba(251,191,36,0.35)", bg: "rgba(251,191,36,0.05)" }
      : verdict === "reconsider"
        ? { border: "rgba(248,113,113,0.35)", bg: "rgba(248,113,113,0.05)" }
        : { border: "rgba(52,211,153,0.35)", bg: "rgba(52,211,153,0.05)" };

  return (
    <div
      className="rounded-2xl p-4 md:p-5"
      style={{ border: `1px solid ${tint.border}`, background: tint.bg }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            color,
          }}
        >
          Renewal verdict · {days}d to fee
        </span>
        <button
          onClick={onDismiss}
          aria-label="Dismiss renewal verdict"
          className="text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
        >
          <BellOff size={14} strokeWidth={2} />
        </button>
      </div>
      <div
        className="mt-1 text-[22px] md:text-[26px]"
        style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color, lineHeight: 1.2 }}
      >
        {verdictLabel}
      </div>
      <p className="mt-1.5 max-w-[60ch] text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
        {alert.body}
      </p>
      <div
        className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11.5px]"
        style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}
      >
        <span style={{ color: "var(--color-accent-purple)" }}>
          credits ${Math.round(credits).toLocaleString()}
        </span>
        <span style={{ color: "var(--color-accent-blue)" }}>
          points ~${Math.round(points).toLocaleString()}
        </span>
        <span style={{ color: "var(--color-danger)" }}>
          fee −${Math.round(fee).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  onDismiss,
}: {
  alert: SerializedAlert;
  onDismiss: () => void;
}) {
  const d = daysLeft(alert.expiresAt);

  return (
    <div
      className={`grid items-baseline gap-x-3 rounded-xl border bg-[var(--bg-secondary)] px-4 py-3 ${
        alert.unread
          ? "border-[var(--border-medium)]"
          : "border-[var(--border-subtle)]"
      }`}
      style={{ gridTemplateColumns: "8px 1fr auto auto" }}
    >
      <span
        className="h-2 w-2 self-center rounded-full"
        style={{ background: dotColor(alert) }}
      />
      <span>
        <span className="block text-[13px] font-semibold text-[var(--text-primary)]">
          {alert.title}
          {alert.unread && (
            <span
              className="ml-2 align-middle text-[8px] uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                letterSpacing: "1px",
                color: "var(--color-accent-cyan)",
              }}
            >
              new
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
          {alert.body}
        </span>
      </span>
      {d !== null && (
        <span
          className="text-[11px]"
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: dotColor(alert),
            whiteSpace: "nowrap",
          }}
        >
          {d}d
        </span>
      )}
      <button
        onClick={onDismiss}
        aria-label={`Dismiss: ${alert.title}`}
        className="self-center text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
