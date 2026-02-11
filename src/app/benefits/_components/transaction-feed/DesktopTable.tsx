import {
  Table,
  TableHeader,
  TableHead,
} from "@/components/ui/Table";
import type { TransactionWithMatch } from "@/lib/types";
import { TransactionRowDesktop } from "./TransactionRowDesktop";
import type { SortKey } from "./types";
import type { TransactionRowContext } from "./types";

interface Props {
  sorted: TransactionWithMatch[];
  sortKey: SortKey;
  sortIndicator: (key: SortKey) => string;
  toggleSort: (key: SortKey) => void;
  ctx: TransactionRowContext;
}

export function DesktopTable({ sorted, sortIndicator, toggleSort, ctx }: Props) {
  return (
    <div className="hidden md:block rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-hidden">
      <Table>
        <TableHeader>
          <tr>
            <TableHead>
              <button
                onClick={() => toggleSort("date")}
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                Date{sortIndicator("date")}
              </button>
            </TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead align="right">
              <button
                onClick={() => toggleSort("amount")}
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                Amount{sortIndicator("amount")}
              </button>
            </TableHead>
            <TableHead>Matched Benefit</TableHead>
            <TableHead align="right">Credit</TableHead>
            <TableHead align="center">Confidence</TableHead>
          </tr>
        </TableHeader>
        <tbody>
          {sorted.map((tx) => (
            <TransactionRowDesktop key={tx.id} tx={tx} ctx={ctx} />
          ))}
        </tbody>
      </Table>
    </div>
  );
}
