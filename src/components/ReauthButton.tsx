"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";
import { Loader2 } from "lucide-react";

interface ReauthButtonProps {
  connectionId: string;
  label?: string;
  className?: string;
}

export function ReauthButton({
  connectionId,
  label = "Reconnect",
  className,
}: ReauthButtonProps) {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasOpened = useRef(false);

  const fetchLinkToken = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      const data = await res.json();
      if (data.linkToken) {
        setLinkToken(data.linkToken);
        sessionStorage.setItem("plaid_link_token", data.linkToken);
        sessionStorage.setItem("plaid_reauth_connection_id", connectionId);
      } else {
        console.error("Failed to get reauth link token");
      }
    } catch {
      console.error("Failed to connect to server for reauth");
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async () => {
      try {
        await fetch("/api/plaid/reauth-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId }),
        });
        sessionStorage.removeItem("plaid_link_token");
        sessionStorage.removeItem("plaid_reauth_connection_id");
        router.refresh();
      } catch {
        console.error("Failed to complete re-authentication");
      }
    },
    onExit: (err) => {
      hasOpened.current = false;
      if (err) {
        console.error("Plaid reauth exited with error:", err.display_message);
      }
    },
  });

  useEffect(() => {
    if (linkToken && ready && !hasOpened.current) {
      hasOpened.current = true;
      open();
    }
  }, [linkToken, ready, open]);

  const handleClick = async () => {
    if (linkToken && ready) {
      hasOpened.current = true;
      open();
    } else {
      await fetchLinkToken();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        className ||
        "inline-flex items-center gap-1 rounded-md bg-[var(--color-danger)]/20 px-2.5 py-1 text-[var(--text-caption)] font-medium text-[var(--color-danger)] transition-opacity hover:opacity-80 disabled:opacity-50"
      }
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : null}
      {loading ? "Connecting..." : label}
    </button>
  );
}
