"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  onExit?: () => void;
}

/**
 * Inner component — only mounted once we have a valid link token.
 * This ensures usePlaidLink never initializes with null, avoiding
 * the "embedded more than once" Plaid script warning.
 */
function PlaidLinkReady({
  token,
  userId,
  onSuccess,
  onError,
  onExit: onExitProp,
}: PlaidLinkProps & { token: string }) {
  const hasOpened = useRef(false);
  const [dismissed, setDismissed] = useState(false);

  const { open, ready } = usePlaidLink({
    token,
    onSuccess: async (publicToken, metadata) => {
      try {
        const account = metadata.accounts[0];
        const accountId = account?.id || "";
        const institutionName = metadata.institution?.name || "Unknown";
        const accountName = account?.name || "";
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
          sessionStorage.removeItem("plaid_link_token");
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
      hasOpened.current = false;
      setDismissed(true);
      if (err) {
        onError?.(err.display_message || "Plaid Link exited with error");
      }
      onExitProp?.();
    },
  });

  // Auto-open once Plaid is ready (fires only once)
  useEffect(() => {
    if (ready && !hasOpened.current) {
      hasOpened.current = true;
      open();
    }
  }, [ready, open]);

  // Cleanup Plaid script on unmount
  useEffect(() => {
    return () => {
      document
        .querySelectorAll('script[src*="plaid.com/link"]')
        .forEach((s) => s.remove());
    };
  }, []);

  // Only show the button after the user dismissed Plaid
  if (!dismissed) return null;

  return (
    <button
      onClick={() => { hasOpened.current = true; open(); }}
      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-2.5 font-medium text-[var(--color-void)] transition-opacity duration-[var(--duration-fast)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
    >
      Connect with Plaid
    </button>
  );
}

export function PlaidLinkButton({
  userId,
  onSuccess,
  onError,
  onExit,
}: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        sessionStorage.setItem("plaid_link_token", data.linkToken);
      } else {
        console.error("Link token error:", data.detail || data.error);
        onError?.("Failed to get link token");
      }
    } catch {
      onError?.("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [userId, onError]);

  useEffect(() => {
    // Remove any leftover Plaid scripts from prior navigation before fetching
    document
      .querySelectorAll('script[src*="plaid.com/link"]')
      .forEach((s) => s.remove());
    fetchLinkToken();
  }, [fetchLinkToken]);

  if (loading || !linkToken) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-2.5 font-medium text-[var(--color-void)] opacity-50"
      >
        Connecting...
      </button>
    );
  }

  return (
    <PlaidLinkReady
      token={linkToken}
      userId={userId}
      onSuccess={onSuccess}
      onError={onError}
      onExit={onExit}
    />
  );
}
