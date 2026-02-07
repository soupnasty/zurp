"use client";

import { useState } from "react";

import { CardSelection } from "./CardSelection";
import { AnniversarySetup } from "./AnniversarySetup";
import { PlaidLinkButton } from "@/components/PlaidLink";
import { addUserCardAndLinkConnection, setAnniversaryDate } from "../actions";
import { CheckCircle2 } from "lucide-react";

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

type Step = "link-plaid" | "confirm-card" | "anniversary" | "done";

export function OnboardingWizard({ userId, cards }: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>("link-plaid");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [detectedCard, setDetectedCard] = useState<DetectedCard | null>(null);
  const [userCardId, setUserCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlaidSuccess = async (result: {
    connectionId: string;
    detectedCard: DetectedCard | null;
  }) => {
    setConnectionId(result.connectionId);
    setDetectedCard(result.detectedCard);
    setError(null);
    setStep("confirm-card");
  };

  const handleCardSelect = async (cardId: string) => {
    if (!connectionId) return;
    setError(null);

    try {
      const userCard = await addUserCardAndLinkConnection(cardId, connectionId);
      setUserCardId(userCard.id);

      // Trigger initial sync
      try {
        await fetch("/api/plaid/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId }),
        });
      } catch {
        // Non-blocking: sync will happen later
      }

      setStep("anniversary");
    } catch {
      setError("Failed to add card. Please try again.");
    }
  };

  const handleAnniversarySubmit = async (date: Date) => {
    if (!userCardId) return;
    setError(null);

    try {
      await setAnniversaryDate(userCardId, date);
      setStep("done");
      setTimeout(() => window.location.href = "/benefits", 1500);
    } catch {
      setError("Failed to save anniversary date.");
    }
  };

  const handleSkipAnniversary = () => {
    setStep("done");
    setTimeout(() => window.location.href = "/benefits", 1500);
  };

  const stepNumber =
    step === "link-plaid" ? 1 : step === "confirm-card" ? 2 : step === "anniversary" ? 3 : 4;

  return (
    <div className="flex max-h-full flex-col overflow-hidden">
      {/* Progress indicator */}
      <div className="mb-8 flex shrink-0 items-center justify-center gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-2 w-12 rounded-full transition-colors ${
              n <= stepNumber
                ? "bg-[var(--accent)]"
                : "bg-[var(--border-default)]"
            }`}
          />
        ))}
      </div>

      <div className="min-h-0 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
        {step === "link-plaid" && (
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
        )}

        {step === "confirm-card" && (
          <CardSelection
            cards={cards}
            onSelect={handleCardSelect}
            detectedCardId={
              detectedCard?.confidence === "high" ? detectedCard.cardId : null
            }
          />
        )}

        {step === "anniversary" && (
          <AnniversarySetup
            onSubmit={handleAnniversarySubmit}
            onSkip={handleSkipAnniversary}
          />
        )}

        {step === "done" && (
          <div className="py-6 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-success-500" />
            </div>
            <h2 className="text-h3 font-semibold">You&apos;re all set!</h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Redirecting to your dashboard...
            </p>
          </div>
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
