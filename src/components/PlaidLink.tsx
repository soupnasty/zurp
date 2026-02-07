"use client";

import { useCallback, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

interface PlaidLinkProps {
  userId: string;
  userCardId: string;
  onSuccess: (connectionId: string) => void;
  onError?: (error: string) => void;
}

export function PlaidLinkButton({
  userId,
  userCardId,
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
        const accountId = metadata.accounts[0]?.id || "";
        const institutionName = metadata.institution?.name || "Unknown";

        const res = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicToken,
            userId,
            userCardId,
            institutionName,
            accountId,
          }),
        });

        const data = await res.json();
        if (data.connectionId) {
          onSuccess(data.connectionId);
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
      className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50"
    >
      {loading ? "Connecting..." : "Link Bank Account"}
    </button>
  );
}
