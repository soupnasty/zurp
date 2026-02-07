"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import type { TransactionWithMatch } from "@/lib/types";

interface TransactionFeedProps {
  transactions: TransactionWithMatch[];
}

type SortKey = "date" | "amount";
type SortDir = "asc" | "desc";

export function TransactionFeed({ transactions }: TransactionFeedProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...transactions].sort((a, b) => {
    let cmp: number;
    if (sortKey === "date") {
      cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      cmp = a.amount - b.amount;
    }
    return sortDir === "desc" ? -cmp : cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "desc" ? " \u2193" : " \u2191";
  };

  const confidenceBadge = (confidence: string | null) => {
    if (!confidence) return null;
    const variant =
      confidence === "high"
        ? "success"
        : confidence === "medium"
          ? "warning"
          : "danger";
    return <Badge variant={variant as any}>{confidence}</Badge>;
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-xl)] text-center">
        <p className="text-[var(--text-secondary)]">
          No transactions yet. Link your bank account and sync to see
          transactions here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-hidden">
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
            <TableRow
              key={tx.id}
              highlight={tx.matchedStatus === "ambiguous"}
            >
              <TableCell>
                <span className="text-[var(--text-secondary)]">
                  {new Date(tx.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-[var(--text-primary)]">
                  {tx.merchantName || "Unknown"}
                </span>
              </TableCell>
              <TableCell align="right" mono>
                ${tx.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                {tx.matchedBenefitName ? (
                  <span className="text-[var(--accent)]">
                    {tx.matchedBenefitName}
                  </span>
                ) : tx.matchedStatus === "ambiguous" ? (
                  <span className="text-[var(--color-warning)]">
                    Needs review
                  </span>
                ) : (
                  <span className="text-[var(--text-secondary)]">&mdash;</span>
                )}
              </TableCell>
              <TableCell align="right" mono>
                {tx.creditApplied ? (
                  <span className="text-[var(--color-success)]">
                    -${tx.creditApplied.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-[var(--text-secondary)]">&mdash;</span>
                )}
              </TableCell>
              <TableCell align="center">
                {confidenceBadge(tx.matchConfidence)}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
