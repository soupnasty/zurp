import { CreditCard } from "lucide-react";

interface CardSelectorProps {
  cardName: string;
}

export function CardSelector({ cardName }: CardSelectorProps) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2">
      <CreditCard size={16} strokeWidth={1.75} className="text-[var(--accent)]" />
      <span className="text-[var(--text-body)] font-medium text-[var(--text-primary)]">
        {cardName}
      </span>
    </div>
  );
}
