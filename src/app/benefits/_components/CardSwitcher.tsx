"use client";

import { useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { updateCardType } from "@/lib/actions";

interface CardOption {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
}

interface CardSwitcherProps {
  allCards: CardOption[];
  activeCardProfileId: string;
  activeCardType: string;
}

export function CardSwitcher({ allCards, activeCardProfileId, activeCardType }: CardSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCardType = e.target.value;
    if (newCardType === activeCardType) return;
    startTransition(async () => {
      await updateCardType(activeCardProfileId, newCardType);
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={activeCardType}
        onChange={handleChange}
        disabled={isPending}
        className="appearance-none bg-transparent pr-6 text-[var(--text-secondary)] text-[var(--text-caption)] font-medium cursor-pointer focus:outline-none hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
      >
        {allCards.map((card) => (
          <option key={card.id} value={card.id}>
            {card.name}
          </option>
        ))}
      </select>
      {isPending ? (
        <Loader2
          size={14}
          className="pointer-events-none absolute right-0 text-[var(--text-muted)] animate-spin"
        />
      ) : (
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-0 text-[var(--text-muted)]"
        />
      )}
    </div>
  );
}
