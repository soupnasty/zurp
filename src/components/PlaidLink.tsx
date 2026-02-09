"use client";

import { useCallback, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

interface DetectedCard {
  cardId: string;
  confidence: "high" | "low";
}

interface PlaidLinkProps {
  userId: string;
  onSuccess: (result: {
    connectionId: string;
    cardProfileId: string | null;
    detectedCard: DetectedCard | null;
  }) => void;
  onError?: (error: string) => void;
}

export function PlaidLinkButton({
  userId,
  onSuccess,
  onError,
}: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLinkToken = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.linkToken) {
        setLinkToken(data.linkToken);
      } else {
        onError?.("Failed to get link token");
      }
    } catch {
      onError?.("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [userId, onError]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      try {
        const account = metadata.accounts[0];
        const accountId = account?.id || "";
        const institutionName = metadata.institution?.name || "Unknown";
        const accountName = account?.name || "";
        // react-plaid-link types don't include official_name/mask but Plaid returns them
        const accountMeta = account as unknown as Record<string, unknown>;
        const accountOfficialName = (accountMeta?.official_name as string) || "";
        const accountMask = (accountMeta?.mask as string) || account?.mask || "";

        const res = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicToken,
            userId,
            institutionName,
            accountId,
            accountName,
            accountOfficialName,
            accountMask,
          }),
        });

        const data = await res.json();
        if (data.connectionId) {
          onSuccess({
            connectionId: data.connectionId,
            cardProfileId: data.cardProfileId || null,
            detectedCard: data.detectedCard || null,
          });
        } else {
          onError?.("Failed to exchange token");
        }
      } catch {
        onError?.("Failed to complete connection");
      }
    },
    onExit: (err) => {
      if (err) {
        onError?.(err.display_message || "Plaid Link exited with error");
      }
    },
  });

  const handleClick = async () => {
    if (linkToken && ready) {
      open();
    } else {
      await fetchLinkToken();
    }
  };

  // Open Plaid Link once token is ready
  if (linkToken && ready) {
    open();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-2.5 font-medium text-[var(--color-void)] transition-opacity duration-[var(--duration-fast)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
    >
      {loading ? "Connecting..." : "Link Bank Account"}
    </button>
  );
}
