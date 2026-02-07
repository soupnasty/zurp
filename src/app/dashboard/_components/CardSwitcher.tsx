"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface CardOption {
  id: string;
  name: string;
  issuer: string;
  isPrimary: boolean;
}

interface CardSwitcherProps {
  cards: CardOption[];
  activeCardId: string;
}

export function CardSwitcher({ cards, activeCardId }: CardSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (cards.length <= 1) return null;

  const activeCard = cards.find((c) => c.id === activeCardId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cardId", e.target.value);
    router.replace(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={activeCardId}
        onChange={handleChange}
        className="appearance-none bg-transparent pr-6 text-[var(--text-secondary)] text-[var(--text-caption)] font-medium cursor-pointer focus:outline-none hover:text-[var(--text-primary)] transition-colors"
      >
        {cards.map((card) => (
          <option key={card.id} value={card.id}>
            {card.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-0 text-[var(--text-muted)]"
      />
    </div>
  );
}
