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

  return (
    <div className="flex flex-col">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
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
