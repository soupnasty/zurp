"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SyncButtonProps {
  connectionId: string | null;
}

export function SyncButton({ connectionId }: SyncButtonProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleSync = async () => {
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
  };

  if (!connectionId) return null;

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleSync}
      loading={syncing}
      icon={
        synced ? (
          <Check size={16} strokeWidth={1.75} className="text-[var(--color-success)]" />
        ) : (
          <RefreshCw
            size={16}
            strokeWidth={1.75}
            className={syncing ? "animate-spin" : ""}
          />
        )
      }
    >
      {synced ? "Synced" : syncing ? "Syncing" : "Sync"}
    </Button>
  );
}
