"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Eye } from "lucide-react";

interface CardOption {
  id: string;
  name: string;
}

interface ViewAsSelectorProps {
  cards: CardOption[];
  activeCardType: string;
  currentViewAs: string | null;
}

export function ViewAsSelector({
  cards,
  activeCardType,
  currentViewAs,
}: ViewAsSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options = cards.filter((c) => c.id !== activeCardType);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("viewAs", value);
    } else {
      params.delete("viewAs");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="relative inline-flex items-center">
      <Eye
        size={14}
        className="pointer-events-none absolute left-0 text-[var(--text-muted)]"
      />
      <select
        value={currentViewAs ?? ""}
        onChange={handleChange}
        className="appearance-none bg-transparent pl-5 pr-5 text-[var(--text-secondary)] text-[var(--text-caption)] font-medium cursor-pointer focus:outline-none hover:text-[var(--text-primary)] transition-colors"
      >
        <option value="">View as...</option>
        {options.map((card) => (
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
