"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";
import { Loader2 } from "lucide-react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const hasOpened = useRef(false);
  const [expired, setExpired] = useState(false);

  const storedToken =
    typeof window !== "undefined"
      ? sessionStorage.getItem("plaid_link_token")
      : null;
  const storedConnectionId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("plaid_reauth_connection_id")
      : null;

  const { open, ready } = usePlaidLink({
    token: storedToken,
    receivedRedirectUri: typeof window !== "undefined" ? window.location.href : undefined,
    onSuccess: async (publicToken, metadata) => {
      sessionStorage.removeItem("plaid_link_token");

      if (storedConnectionId) {
        // Update mode: mark connection as active
        sessionStorage.removeItem("plaid_reauth_connection_id");
        try {
          await fetch("/api/plaid/reauth-complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ connectionId: storedConnectionId }),
          });
        } catch {
          console.error("Failed to complete reauth after OAuth");
        }
        router.replace("/dashboard");
      } else {
        // Normal mode: exchange token
        const account = metadata.accounts[0];
        const accountMeta = account as unknown as Record<string, unknown>;
        try {
          await fetch("/api/plaid/exchange-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              publicToken,
              institutionName: metadata.institution?.name || "Unknown",
              accountId: account?.id || "",
              accountName: account?.name || "",
              accountOfficialName: (accountMeta?.official_name as string) || "",
              accountMask: (accountMeta?.mask as string) || account?.mask || "",
            }),
          });
        } catch {
          console.error("Failed to exchange token after OAuth");
        }
        router.replace("/onboarding/processing");
      }
    },
    onExit: () => {
      sessionStorage.removeItem("plaid_link_token");
      sessionStorage.removeItem("plaid_reauth_connection_id");
      router.replace("/dashboard");
    },
  });

  useEffect(() => {
    if (!storedToken) {
      setExpired(true);
      return;
    }
    if (ready && !hasOpened.current) {
      hasOpened.current = true;
      open();
    }
  }, [storedToken, ready, open]);

  if (expired) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Session expired. Please try linking your account again.
          </p>
          <button
            onClick={() => router.replace("/dashboard")}
            className="mt-4 text-sm font-medium text-[var(--color-accent-cyan)] transition-colors hover:text-[var(--text-primary)]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3">
        <Loader2 size={20} className="animate-spin text-[var(--text-secondary)]" />
        <span className="text-sm text-[var(--text-secondary)]">
          Completing bank connection...
        </span>
      </div>
    </div>
  );
}
