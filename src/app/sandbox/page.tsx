"use client";

import { useState, useEffect } from "react";
import { PlaidLinkButton } from "@/components/PlaidLink";

export default function SandboxPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [userId] = useState("sandbox-user-001");
  const [userCardId] = useState("sandbox-usercard-001");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Check if sandbox mode is enabled via a simple API check
    // In production, NEXT_PUBLIC_ENABLE_SANDBOX won't be set
    setEnabled(process.env.NEXT_PUBLIC_ENABLE_SANDBOX === "true");
  }, []);

  if (enabled === null) return null;

  if (!enabled) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-h2 font-semibold tracking-tight">
            Sandbox Disabled
          </h1>
          <p className="mt-3 text-[var(--text-secondary)]">
            Set NEXT_PUBLIC_ENABLE_SANDBOX=true to enable.
          </p>
        </div>
      </div>
    );
  }

  const handleSync = async () => {
    if (!connectionId) return;
    setSyncing(true);
    setError(null);

    try {
      const res = await fetch("/api/plaid/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(data);
      } else {
        setError(data.error || "Sync failed");
      }
    } catch {
      setError("Failed to sync");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-[var(--space-xl)]">
      <h1 className="text-h2 font-semibold tracking-tight">
        Plaid Sandbox Test
      </h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Use sandbox credentials: user_good / any password / 1234
      </p>

      <div className="mt-[var(--space-xl)] space-y-[var(--space-lg)]">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-lg)]">
          <h2 className="font-semibold">Step 1: Link Account</h2>
          <div className="mt-3">
            <PlaidLinkButton
              userId={userId}
              userCardId={userCardId}
              onSuccess={(id) => {
                setConnectionId(id);
                setError(null);
              }}
              onError={setError}
            />
          </div>
          {connectionId && (
            <p className="mt-2 text-[var(--text-caption)] text-[var(--color-success)]">
              Connected! ID: {connectionId}
            </p>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-lg)]">
          <h2 className="font-semibold">Step 2: Sync Transactions</h2>
          <div className="mt-3">
            <button
              onClick={handleSync}
              disabled={!connectionId || syncing}
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-[var(--text-body)] font-medium text-[var(--color-void)] transition-opacity duration-[var(--duration-fast)] hover:opacity-90 disabled:opacity-50"
            >
              {syncing ? "Syncing..." : "Sync Transactions"}
            </button>
          </div>
          {syncResult && (
            <pre className="font-data mt-2 rounded-[var(--radius-md)] bg-[var(--bg-primary)] p-3 text-[var(--text-caption)]">
              {JSON.stringify(syncResult, null, 2)}
            </pre>
          )}
        </div>

        {error && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger)]/10 p-[var(--space-md)] text-[var(--color-danger)]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
