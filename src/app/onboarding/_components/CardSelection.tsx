"use client";

import { CreditCard, Check } from "lucide-react";

interface Card {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
}

interface CardSelectionProps {
  cards: Card[];
  onSelect: (cardId: string) => void;
  detectedCardId?: string | null;
}

export function CardSelection({
  cards,
  onSelect,
  detectedCardId,
}: CardSelectionProps) {
  const detectedCard = detectedCardId
    ? cards.find((c) => c.id === detectedCardId)
    : null;
  const otherCards = detectedCard
    ? cards.filter((c) => c.id !== detectedCardId)
    : cards;

  return (
    <div>
      {detectedCard ? (
        <>
          <h2 className="text-h3 font-semibold">We detected your card</h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Based on your bank account, it looks like you have this card.
          </p>

          <div className="mt-6">
            <button
              onClick={() => onSelect(detectedCard.id)}
              className="flex w-full items-center gap-4 rounded-[var(--radius-lg)] border-2 border-[var(--accent)] bg-[var(--accent)]/5 p-4 text-left transition-all hover:bg-[var(--accent)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div className="rounded-[var(--radius-lg)] bg-[var(--accent)]/10 p-3">
                <CreditCard className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{detectedCard.name}</p>
                <p className="text-caption text-[var(--text-secondary)]">
                  {detectedCard.issuer.charAt(0).toUpperCase() +
                    detectedCard.issuer.slice(1)}{" "}
                  &middot; ${detectedCard.annualFee}/year
                </p>
              </div>
              <div className="rounded-full bg-[var(--accent)] p-1">
                <Check className="h-4 w-4 text-[var(--color-void)]" />
              </div>
            </button>
          </div>

          {otherCards.length > 0 && (
            <div className="mt-6">
              <p className="text-caption text-[var(--text-secondary)]">
                Not your card? Select from the list below:
              </p>
              <div className="mt-3 space-y-3">
                {otherCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => onSelect(card.id)}
                    className="flex w-full items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--bg-tertiary)] p-4 text-left transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <div className="rounded-[var(--radius-lg)] bg-[var(--accent)]/10 p-3">
                      <CreditCard className="h-6 w-6 text-[var(--accent)]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">{card.name}</p>
                      <p className="text-caption text-[var(--text-secondary)]">
                        {card.issuer.charAt(0).toUpperCase() +
                          card.issuer.slice(1)}{" "}
                        &middot; ${card.annualFee}/year
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="text-h3 font-semibold">Select Your Card</h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Choose the credit card you want to track benefits for.
          </p>

          <div className="mt-6 space-y-3">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => onSelect(card.id)}
                className="flex w-full items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--bg-tertiary)] p-4 text-left transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <div className="rounded-[var(--radius-lg)] bg-[var(--accent)]/10 p-3">
                  <CreditCard className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">{card.name}</p>
                  <p className="text-caption text-[var(--text-secondary)]">
                    {card.issuer.charAt(0).toUpperCase() + card.issuer.slice(1)}{" "}
                    &middot; ${card.annualFee}/year
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
