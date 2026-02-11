import type { TransactionWithMatch } from "@/lib/types";
import { TransactionCardMobile } from "./TransactionCardMobile";
import type { SortKey } from "./types";
import type { TransactionRowContext } from "./types";

interface Props {
  sorted: TransactionWithMatch[];
  sortKey: SortKey;
  sortIndicator: (key: SortKey) => string;
  toggleSort: (key: SortKey) => void;
  ctx: TransactionRowContext;
}

export function MobileList({ sorted, sortKey, sortIndicator, toggleSort, ctx }: Props) {
  return (
    <>
      <div className="mb-2 flex items-center gap-2 md:hidden">
        <span className="text-[var(--text-caption)] text-[var(--text-secondary)]">Sort by:</span>
        <button
          onClick={() => toggleSort("date")}
          className={`text-[var(--text-caption)] font-medium transition-colors ${
            sortKey === "date" ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
          }`}
        >
          Date{sortIndicator("date")}
        </button>
        <button
          onClick={() => toggleSort("amount")}
          className={`text-[var(--text-caption)] font-medium transition-colors ${
            sortKey === "amount" ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
          }`}
        >
          Amount{sortIndicator("amount")}
        </button>
      </div>

      <div className="space-y-2 md:hidden">
        {sorted.map((tx) => (
          <TransactionCardMobile key={tx.id} tx={tx} ctx={ctx} />
        ))}
      </div>
    </>
  );
}
