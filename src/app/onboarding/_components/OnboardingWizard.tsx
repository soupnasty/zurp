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
      {/* Animated logo mark */}
      <svg
        width="80"
        height="56"
        viewBox="0 0 50 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Card outline */}
        <rect
          x="0"
          y="8"
          width="50"
          height="34"
          rx="5"
          stroke="#58A6FF"
          strokeWidth="2.5"
          opacity="0.4"
        />
        {/* Card stripe */}
        <line
          x1="0"
          y1="20"
          x2="50"
          y2="20"
          stroke="#58A6FF"
          strokeWidth="1.2"
          opacity="0.2"
        />
        {/* Animated progress dots */}
        <circle cx="12" cy="32" r="2.5" fill="#58A6FF">
          <animate
            attributeName="opacity"
            values="1;0.2;0.2;1"
            dur="1.2s"
            repeatCount="indefinite"
            begin="0s"
          />
        </circle>
        <circle cx="21" cy="32" r="2.5" fill="#58A6FF">
          <animate
            attributeName="opacity"
            values="0.2;1;0.2;0.2"
            dur="1.2s"
            repeatCount="indefinite"
            begin="0s"
          />
        </circle>
        <circle cx="30" cy="32" r="2.5" fill="#58A6FF">
          <animate
            attributeName="opacity"
            values="0.2;0.2;1;0.2"
            dur="1.2s"
            repeatCount="indefinite"
            begin="0s"
          />
        </circle>
      </svg>

      <p className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
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
          <p className="mt-4 text-sm text-error-600 dark:text-error-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
