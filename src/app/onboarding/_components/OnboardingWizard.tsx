"use client";

import { useState } from "react";

import { CardSelection } from "./CardSelection";
import { PlaidLinkButton } from "@/components/PlaidLink";
import { createCardProfile } from "../actions";

interface Card {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
}

interface DetectedCard {
  cardId: string;
  confidence: "high" | "low";
}

interface OnboardingWizardProps {
  userId: string;
  cards: Card[];
}

const MIN_LOADING_MS = 2000;

async function syncConnection(connectionId: string) {
  await fetch("/api/plaid/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ connectionId }),
  });
}

function ZurpLoader() {
  return (
    <div className="flex items-center justify-center gap-4 py-10">
      {/* Animated F3 logomark — A2 Z-path fill */}
      <svg
        width="72"
        height="54"
        viewBox="0 0 46 36"
        fill="none"
        aria-hidden="true"
      >
        {/* Card outline (static) */}
        <rect x="2" y="2" width="42" height="30" rx="5" fill="#0a0e17" stroke="#22d3ee" strokeWidth="1.5"/>
        {/* Top bar */}
        <clipPath id="zl-t">
          <rect x="8" y="9" width="30" height="6" rx="3"/>
        </clipPath>
        <g clipPath="url(#zl-t)">
          <rect x="8" y="9" width="18" height="6" fill="#60a5fa"
            style={{ animation: "z-fill 2.4s ease-in-out infinite", animationDelay: "0s" }}/>
          <rect x="26" y="9" width="6.5" height="6" fill="#a78bfa"
            style={{ animation: "z-fill 2.4s ease-in-out infinite", animationDelay: "0.24s" }}/>
          <rect x="32.5" y="9" width="5.5" height="6" fill="#f87171"
            style={{ animation: "z-fill 2.4s ease-in-out infinite", animationDelay: "0.48s" }}/>
        </g>
        {/* Bottom bar */}
        <clipPath id="zl-b">
          <rect x="8" y="19" width="30" height="6" rx="3"/>
        </clipPath>
        <g clipPath="url(#zl-b)">
          <rect x="8" y="19" width="5.5" height="6" fill="#f87171"
            style={{ animation: "z-fill-dim 2.4s ease-in-out infinite", animationDelay: "0.72s" }}/>
          <rect x="13.5" y="19" width="6.5" height="6" fill="#a78bfa"
            style={{ animation: "z-fill-dim 2.4s ease-in-out infinite", animationDelay: "0.96s" }}/>
          <rect x="20" y="19" width="18" height="6" fill="#60a5fa"
            style={{ animation: "z-fill-dim 2.4s ease-in-out infinite", animationDelay: "1.2s" }}/>
        </g>
      </svg>

      <p
        className="text-3xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-space-mono)" }}
      >
        zurping...
      </p>
    </div>
  );
}

export function OnboardingWizard({ userId, cards }: OnboardingWizardProps) {
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [showCardFallback, setShowCardFallback] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncAndRedirect = async (connId: string) => {
    setSyncing(true);
    const minTimer = new Promise((r) => setTimeout(r, MIN_LOADING_MS));
    const sync = syncConnection(connId).catch(() => {});
    await Promise.all([sync, minTimer]);
    window.location.href = "/benefits";
  };

  const handlePlaidSuccess = async (result: {
    connectionId: string;
    cardProfileId: string | null;
    detectedCard: DetectedCard | null;
  }) => {
    setConnectionId(result.connectionId);
    setError(null);

    if (result.cardProfileId) {
      await syncAndRedirect(result.connectionId);
    } else {
      setShowCardFallback(true);
    }
  };

  const handleCardSelect = async (cardId: string) => {
    if (!connectionId) return;
    setError(null);

    try {
      await createCardProfile(cardId, connectionId);
      await syncAndRedirect(connectionId);
    } catch {
      setError("Failed to add card. Please try again.");
    }
  };

  if (syncing) {
    return (
      <div className="flex max-h-full flex-col overflow-hidden">
        <div className="min-h-0 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
          <ZurpLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-h-full flex-col overflow-hidden">
      <div className="min-h-0 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
        {!showCardFallback ? (
          <div>
            <h2 className="text-h3 font-semibold">Link Your Bank Account</h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Connect your bank account so we can detect your card and track
              benefits automatically.
            </p>
            <div className="mt-6">
              <PlaidLinkButton
                userId={userId}
                onSuccess={handlePlaidSuccess}
                onError={setError}
              />
            </div>
          </div>
        ) : (
          <CardSelection
            cards={cards}
            onSelect={handleCardSelect}
            detectedCardId={null}
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
