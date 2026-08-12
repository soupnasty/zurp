"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, Check } from "lucide-react";
import { resolveActiveCard } from "@/lib/resolve-card";

interface CardProfile {
  id: string;
  isActive: boolean;
  connectionId: string | null;
  connectionStatus: string | null;
  lastSyncedAt: string | null;
}

interface SyncFooterProps {
  cardProfiles: CardProfile[];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SyncFooter({ cardProfiles }: SyncFooterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  // Same resolution as the server pages (?card → isActive → first)
  const activeProfile = resolveActiveCard(
    cardProfiles,
    searchParams.get("card") ?? undefined
  );
  const connectionId = activeProfile?.connectionId ?? null;
  const lastSyncedAt = activeProfile?.lastSyncedAt ?? null;

  async function handleSync() {
    if (!connectionId || syncing) return;
    setSyncing(true);
    setSynced(false);

    try {
      const res = await fetch("/api/plaid/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });

      if (res.ok) {
        setSynced(true);
        router.refresh();
        setTimeout(() => setSynced(false), 3000);
      }
    } catch {
      // Silently fail
    } finally {
      setSyncing(false);
    }
  }

  // 24-hour cooldown between manual syncs
  const SYNC_COOLDOWN_MS = 24 * 60 * 60 * 1000;
  const cooldownActive = lastSyncedAt
    ? Date.now() - new Date(lastSyncedAt).getTime() < SYNC_COOLDOWN_MS
    : false;

  if (!connectionId) return null;

  return (
    <div className="flex items-center justify-center py-6 mt-4 md:hidden">
      <div className="flex items-center gap-2">
        {synced ? (
          <>
            <Check size={14} strokeWidth={2} className="text-[var(--color-success)]" />
            <span className="text-xs text-[var(--text-secondary)]">Updated just now</span>
          </>
        ) : (
          <>
            <span className="text-xs text-[var(--text-dim)]">
              Updated {lastSyncedAt ? relativeTime(lastSyncedAt) : "never"}
            </span>
            <span className="text-[var(--text-dim)]">&middot;</span>
            <button
              onClick={handleSync}
              disabled={syncing || cooldownActive}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent-cyan)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
            >
              <RefreshCw size={12} strokeWidth={2} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : cooldownActive ? "Synced today" : "Sync now"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
