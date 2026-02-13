"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, WifiOff, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ConnectionAlert } from "@/lib/notifications";
import { ReauthButton } from "@/components/ReauthButton";

interface ConnectionAlertsProps {
  alerts: ConnectionAlert[];
}

const alertConfig = {
  stale: {
    icon: RefreshCw,
    borderColor: "border-[var(--color-warning)]",
    bgColor: "bg-[var(--color-warning)]/10",
    textColor: "text-[var(--color-warning)]",
  },
  needs_reauth: {
    icon: AlertTriangle,
    borderColor: "border-[var(--color-danger)]",
    bgColor: "bg-[var(--color-danger)]/10",
    textColor: "text-[var(--color-danger)]",
  },
  disconnected: {
    icon: WifiOff,
    borderColor: "border-[var(--color-danger)]",
    bgColor: "bg-[var(--color-danger)]/10",
    textColor: "text-[var(--color-danger)]",
  },
};

export function ConnectionAlerts({ alerts }: ConnectionAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-[var(--space-sm)]">
      {alerts.map((alert) => (
        <AlertRow key={alert.connectionId} alert={alert} />
      ))}
    </div>
  );
}

function AlertRow({ alert }: { alert: ConnectionAlert }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const config = alertConfig[alert.type];
  const Icon = config.icon;

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/plaid/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: alert.connectionId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // Silently fail
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-[var(--space-sm)] rounded-[var(--radius-md)] border ${config.borderColor} ${config.bgColor} px-[var(--space-md)] py-[var(--space-sm)]`}
    >
      <Icon size={16} strokeWidth={1.75} className={config.textColor} />
      <p className={`flex-1 text-[var(--text-caption)] ${config.textColor}`}>
        {alert.message}
      </p>
      {alert.type === "stale" && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--color-warning)]/20 px-2.5 py-1 text-[var(--text-caption)] font-medium text-[var(--color-warning)] transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {syncing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {syncing ? "Syncing…" : "Sync Now"}
        </button>
      )}
      {alert.type === "needs_reauth" && (
        <ReauthButton connectionId={alert.connectionId} />
      )}
      {alert.type === "disconnected" && (
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1 rounded-md bg-[var(--color-danger)]/20 px-2.5 py-1 text-[var(--text-caption)] font-medium text-[var(--color-danger)] transition-opacity hover:opacity-80"
        >
          Re-link
        </Link>
      )}
    </div>
  );
}
