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
    <>
      {/* Sort controls — shared between mobile and desktop */}
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

      {/* Mobile card list */}
      <div className="space-y-2 md:hidden">
        {sorted.map((tx) => (
          <div
            key={tx.id}
            className={`rounded-[var(--radius-lg)] border bg-[var(--bg-secondary)] p-3 ${
              tx.matchedStatus === "ambiguous"
                ? "border-[var(--color-warning)]/30"
                : "border-[var(--border-default)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[var(--text-body)] font-medium text-[var(--text-primary)] truncate">
                  {tx.merchantName || "Unknown"}
                </p>
                <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                  {new Date(tx.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right ml-3 shrink-0">
                <p className="font-data text-[var(--text-body)] font-medium text-[var(--text-primary)]">
                  ${tx.amount.toFixed(2)}
                </p>
                {tx.creditApplied ? (
                  <p className="font-data text-[var(--text-caption)] text-[var(--color-success)]">
                    -${tx.creditApplied.toFixed(2)}
                  </p>
                ) : null}
              </div>
            </div>
            {(tx.matchedBenefitName || tx.matchedStatus === "ambiguous") && (
              <div className="mt-2 flex items-center gap-2 border-t border-[var(--border-default)] pt-2">
                {tx.matchedBenefitName ? (
                  <span className="text-[var(--text-caption)] text-[var(--accent)]">
                    {tx.matchedBenefitName}
                  </span>
                ) : (
                  <span className="text-[var(--text-caption)] text-[var(--color-warning)]">
                    Needs review
                  </span>
                )}
                {confidenceBadge(tx.matchConfidence)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
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
    </>
  );
}
