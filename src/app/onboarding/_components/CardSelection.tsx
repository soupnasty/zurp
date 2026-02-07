"use client";

import { CreditCard } from "lucide-react";

interface Card {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
}

interface CardSelectionProps {
  cards: Card[];
  onSelect: (cardId: string) => void;
}

export function CardSelection({ cards, onSelect }: CardSelectionProps) {
  return (
    <div>
      <h2 className="text-h3 font-semibold">Select Your Card</h2>
      <p className="mt-2 text-[var(--text-secondary)]">
        Choose the credit card you want to track benefits for.
      </p>

      <div className="mt-6 space-y-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelect(card.id)}
            className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all hover:border-primary-500 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <CreditCard className="h-6 w-6 text-[var(--text-secondary)]" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{card.name}</p>
              <p className="text-caption text-[var(--text-secondary)]">
                {card.issuer.charAt(0).toUpperCase() + card.issuer.slice(1)} &middot; $
                {card.annualFee}/year
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
