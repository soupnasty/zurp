"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardSelection } from "./CardSelection";
import { AnniversarySetup } from "./AnniversarySetup";
import { PlaidLinkButton } from "@/components/PlaidLink";
import { addUserCard, setAnniversaryDate } from "../actions";
import { CheckCircle2 } from "lucide-react";

interface Card {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
}

interface OnboardingWizardProps {
  userId: string;
  cards: Card[];
}

type Step = "select-card" | "link-plaid" | "anniversary" | "done";

export function OnboardingWizard({ userId, cards }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select-card");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [userCardId, setUserCardId] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCardSelect = async (cardId: string) => {
    setError(null);
    try {
      const userCard = await addUserCard(cardId);
      setSelectedCardId(cardId);
      setUserCardId(userCard.id);
      setStep("link-plaid");
    } catch {
      setError("Failed to add card. Please try again.");
    }
  };

  const handlePlaidSuccess = async (connId: string) => {
    setConnectionId(connId);
    setError(null);

    // Trigger initial sync
    try {
      await fetch("/api/plaid/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: connId }),
      });
    } catch {
      // Non-blocking: sync will happen later
    }

    setStep("anniversary");
  };

  const handleAnniversarySubmit = async (date: Date) => {
    if (!userCardId) return;
    setError(null);

    try {
      await setAnniversaryDate(userCardId, date);
      setStep("done");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Failed to save anniversary date.");
    }
  };

  const handleSkipAnniversary = () => {
    setStep("done");
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  const stepNumber =
    step === "select-card" ? 1 : step === "link-plaid" ? 2 : step === "anniversary" ? 3 : 4;

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-2 w-12 rounded-full transition-colors ${
              n <= stepNumber
                ? "bg-primary-500"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>

      <div className="rounded-lg border bg-[var(--bg-secondary)] p-6 shadow-sm">
        {step === "select-card" && (
          <CardSelection cards={cards} onSelect={handleCardSelect} />
        )}

        {step === "link-plaid" && userCardId && (
          <div>
            <h2 className="text-h3 font-semibold">Link Your Bank Account</h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Connect your Chase account so we can track your card benefits
              automatically.
            </p>
            <div className="mt-6">
              <PlaidLinkButton
                userId={userId}
                userCardId={userCardId}
                onSuccess={handlePlaidSuccess}
                onError={setError}
              />
            </div>
          </div>
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
