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

export function OnboardingWizard({ userId, cards }: OnboardingWizardProps) {
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [showCardFallback, setShowCardFallback] = useState(false);
  const [plaidDismissed, setPlaidDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncAndRedirect = (connId: string, cardType: string) => {
    window.location.href = `/onboarding/processing?connectionId=${encodeURIComponent(connId)}&cardType=${encodeURIComponent(cardType)}`;
  };

  const handlePlaidSuccess = async (result: {
    connectionId: string;
    cardProfileId: string | null;
    detectedCard: DetectedCard | null;
  }) => {
    setConnectionId(result.connectionId);
    setError(null);

    if (result.cardProfileId && result.detectedCard) {
      syncAndRedirect(result.connectionId, result.detectedCard.cardId);
    } else {
      setShowCardFallback(true);
    }
  };

  const handleCardSelect = async (cardId: string) => {
    if (!connectionId) return;
    setError(null);

    try {
      await createCardProfile(cardId, connectionId);
      syncAndRedirect(connectionId, cardId);
    } catch {
      setError("Failed to add card. Please try again.");
    }
  };

  const handlePlaidExit = () => {
    // If user dismissed Plaid without linking, show a visible button
    if (!connectionId) {
      setPlaidDismissed(true);
    }
  };

  // PlaidLink auto-opens on mount. Show nothing until the user dismisses
  // Plaid (card selection fallback) — the page is just a plain dark bg.
  return (
    <div className="flex flex-col">
      {showCardFallback ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
          <CardSelection
            cards={cards}
            onSelect={handleCardSelect}
            detectedCardId={null}
          />

          {error && (
            <p className="mt-4 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <PlaidLinkButton
            userId={userId}
            onSuccess={handlePlaidSuccess}
            onError={setError}
            onExit={handlePlaidExit}
          />
          {error && (
            <p className="mt-2 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
