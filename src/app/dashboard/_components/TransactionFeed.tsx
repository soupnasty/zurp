"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/ToastProvider";
import type { TransactionWithMatch, BenefitUsageSummary } from "@/lib/types";

interface TransactionFeedProps {
  transactions: TransactionWithMatch[];
  benefits: BenefitUsageSummary[];
}

type SortKey = "date" | "amount";
type SortDir = "asc" | "desc";

const REMOVE_REASONS = [
  "Doesn't qualify",
  "Duplicate",
  "Other",
] as const;

export function TransactionFeed({ transactions, benefits }: TransactionFeedProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { addToast } = useToast();
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  // Track which transaction has an open dropdown (remove or add)
  const [openRemoveId, setOpenRemoveId] = useState<string | null>(null);
  const [openAddId, setOpenAddId] = useState<string | null>(null);
  // Optimistic state: transactions being flagged
  const [pendingRemoves, setPendingRemoves] = useState<Set<string>>(new Set());
  const [pendingAdds, setPendingAdds] = useState<Map<string, string>>(new Map()); // txId -> benefitName

  // Close dropdowns on outside click
  useEffect(() => {
    if (!openRemoveId && !openAddId) return;
    const handleClick = () => {
      setOpenRemoveId(null);
      setOpenAddId(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openRemoveId, openAddId]);

  // Eligible benefits for add flow: credit-type with remaining balance,
  // filtered to benefits whose cycle period covers the transaction date
  const getEligibleBenefits = (txDate: Date) => {
    const d = new Date(txDate);
    return benefits.filter(
      (b) =>
        b.type === "credit" &&
        b.amountRemaining > 0 &&
        d >= new Date(b.cycleStart) &&
        d <= new Date(b.cycleEnd)
    );
  };

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

  const confidenceBadge = (tx: TransactionWithMatch) => {
    if (tx.matchMethod === "manual") {
      return <Badge variant="info">manual</Badge>;
    }
    if (!tx.matchConfidence) return null;
    const variant =
      tx.matchConfidence === "high"
        ? "success"
        : tx.matchConfidence === "medium"
          ? "warning"
          : "danger";
    return <Badge variant={variant as any}>{tx.matchConfidence}</Badge>;
  };

  const handleRemove = useCallback(
    async (tx: TransactionWithMatch, reason: string) => {
      if (!tx.benefitId || !tx.benefitUsageId) return;

      setOpenRemoveId(null);
      setPendingRemoves((prev) => new Set(prev).add(tx.id));

      try {
        const res = await fetch("/api/benefits/flag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: tx.id,
            benefitId: tx.benefitId,
            benefitUsageId: tx.benefitUsageId,
            flagType: "removed",
            reason,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const flagId = data.flag.id;

        addToast(`Transaction removed from ${tx.matchedBenefitName}`, async () => {
          // Undo
          await fetch("/api/benefits/flag", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flagId }),
          });
          startTransition(() => {
            setPendingRemoves((prev) => {
              const next = new Set(prev);
              next.delete(tx.id);
              return next;
            });
            router.refresh();
          });
        });

        // Clear optimistic state atomically with server data refresh
        startTransition(() => {
          setPendingRemoves((prev) => {
            const next = new Set(prev);
            next.delete(tx.id);
            return next;
          });
          router.refresh();
        });
      } catch (err) {
        console.error("Failed to remove match:", err);
        setPendingRemoves((prev) => {
          const next = new Set(prev);
          next.delete(tx.id);
          return next;
        });
      }
    },
    [addToast, router]
  );

  const handleAdd = useCallback(
    async (tx: TransactionWithMatch, benefit: BenefitUsageSummary) => {
      setOpenAddId(null);
      setPendingAdds((prev) => new Map(prev).set(tx.id, benefit.benefitName));

      try {
        const res = await fetch("/api/benefits/flag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: tx.id,
            benefitId: benefit.benefitId,
            flagType: "added",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const flagId = data.flag.id;

        addToast(`Transaction added to ${benefit.benefitName}`, async () => {
          // Undo
          await fetch("/api/benefits/flag", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flagId }),
          });
          startTransition(() => {
            setPendingAdds((prev) => {
              const next = new Map(prev);
              next.delete(tx.id);
              return next;
            });
            router.refresh();
          });
        });

        // Clear optimistic state atomically with server data refresh
        startTransition(() => {
          setPendingAdds((prev) => {
            const next = new Map(prev);
            next.delete(tx.id);
            return next;
          });
          router.refresh();
        });
      } catch (err) {
        console.error("Failed to add match:", err);
        setPendingAdds((prev) => {
          const next = new Map(prev);
          next.delete(tx.id);
          return next;
        });
      }
    },
    [addToast, router]
  );

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

  // Render flag action buttons for a transaction
  const renderFlagButton = (tx: TransactionWithMatch) => {
    const isMatched = tx.matchedStatus === "matched" && tx.matchedBenefitName;
    const isRemoved = pendingRemoves.has(tx.id);
    const addedBenefit = pendingAdds.get(tx.id);

    if (isRemoved) return null;

    if (isMatched) {
      // Remove button
      return (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenRemoveId(openRemoveId === tx.id ? null : tx.id);
              setOpenAddId(null);
            }}
            className="rounded p-1 text-[var(--text-secondary)] opacity-0 transition-all hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] group-hover:opacity-100 md:group-hover:opacity-100"
            title="Remove this match"
          >
            <X size={14} />
          </button>
          {openRemoveId === tx.id && (
            <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] py-1 shadow-[var(--glow-sm)]">
              {REMOVE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(tx, reason);
                  }}
                  className="block w-full px-3 py-1.5 text-left text-[var(--text-caption)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                >
                  {reason}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (addedBenefit) return null;

    // Unmatched: Add button
    const eligible = getEligibleBenefits(tx.date);
    if (tx.matchedStatus === "unmatched" && eligible.length > 0) {
      return (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenAddId(openAddId === tx.id ? null : tx.id);
              setOpenRemoveId(null);
            }}
            className="rounded p-1 text-[var(--text-secondary)] opacity-0 transition-all hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] group-hover:opacity-100 md:group-hover:opacity-100"
            title="Add to a benefit"
          >
            <Plus size={14} />
          </button>
          {openAddId === tx.id && (
            <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] py-1 shadow-[var(--glow-sm)]">
              <p className="px-3 py-1 text-[var(--text-caption)] text-[var(--text-secondary)]">
                Add to benefit:
              </p>
              {eligible.map((b) => (
                <button
                  key={b.benefitId}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(tx, b);
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[var(--text-caption)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                >
                  <span className="truncate">{b.benefitName}</span>
                  <span className="ml-2 shrink-0 font-data text-[var(--text-secondary)]">
                    ${b.amountRemaining.toFixed(0)} left
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Mobile flag button (always visible)
  const renderMobileFlagButton = (tx: TransactionWithMatch) => {
    const isMatched = tx.matchedStatus === "matched" && tx.matchedBenefitName;
    const isRemoved = pendingRemoves.has(tx.id);
    const addedBenefit = pendingAdds.get(tx.id);

    if (isRemoved) return null;

    if (isMatched) {
      return (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenRemoveId(openRemoveId === tx.id ? null : tx.id);
              setOpenAddId(null);
            }}
            className="rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
            title="Remove this match"
          >
            <X size={14} />
          </button>
          {openRemoveId === tx.id && (
            <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] py-1 shadow-[var(--glow-sm)]">
              {REMOVE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(tx, reason);
                  }}
                  className="block w-full px-3 py-1.5 text-left text-[var(--text-caption)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                >
                  {reason}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (addedBenefit) return null;

    const eligible = getEligibleBenefits(tx.date);
    if (tx.matchedStatus === "unmatched" && eligible.length > 0) {
      return (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenAddId(openAddId === tx.id ? null : tx.id);
              setOpenRemoveId(null);
            }}
            className="rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
            title="Add to a benefit"
          >
            <Plus size={14} />
          </button>
          {openAddId === tx.id && (
            <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] py-1 shadow-[var(--glow-sm)]">
              <p className="px-3 py-1 text-[var(--text-caption)] text-[var(--text-secondary)]">
                Add to benefit:
              </p>
              {eligible.map((b) => (
                <button
                  key={b.benefitId}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(tx, b);
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[var(--text-caption)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                >
                  <span className="truncate">{b.benefitName}</span>
                  <span className="ml-2 shrink-0 font-data text-[var(--text-secondary)]">
                    ${b.amountRemaining.toFixed(0)} left
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

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
        {sorted.map((tx) => {
          const isRemoved = pendingRemoves.has(tx.id);
          const addedBenefit = pendingAdds.get(tx.id);

          return (
            <div
              key={tx.id}
              className={`rounded-[var(--radius-lg)] border bg-[var(--bg-secondary)] p-3 transition-opacity ${
                isRemoved ? "opacity-40" : ""
              } ${
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
                  {(tx.creditApplied && !isRemoved) ? (
                    <p className="font-data text-[var(--text-caption)] text-[var(--color-success)]">
                      -${tx.creditApplied.toFixed(2)}
                    </p>
                  ) : addedBenefit ? (
                    <p className="font-data text-[var(--text-caption)] text-[var(--color-success)]">
                      matched
                    </p>
                  ) : null}
                </div>
              </div>
              {((tx.matchedBenefitName && !isRemoved) || addedBenefit || tx.matchedStatus === "ambiguous" || (tx.matchedStatus === "unmatched" && !addedBenefit && getEligibleBenefits(tx.date).length > 0)) && (
                <div className="mt-2 flex items-center gap-1.5 border-t border-[var(--border-default)] pt-2">
                  {addedBenefit && !tx.matchedBenefitName ? (
                    <span className="text-[var(--text-caption)] text-[var(--accent)]">
                      {addedBenefit}
                    </span>
                  ) : (tx.matchedBenefitName || addedBenefit) && !isRemoved ? (
                    <>
                      <span className="text-[var(--text-caption)] text-[var(--accent)]">
                        {tx.matchedBenefitName || addedBenefit}
                      </span>
                      {renderMobileFlagButton(tx)}
                    </>
                  ) : tx.matchedStatus === "ambiguous" ? (
                    <span className="text-[var(--text-caption)] text-[var(--color-warning)]">
                      Needs review
                    </span>
                  ) : tx.matchedStatus === "unmatched" && getEligibleBenefits(tx.date).length > 0 ? (
                    <>
                      <span className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                        No benefit matched
                      </span>
                      {renderMobileFlagButton(tx)}
                    </>
                  ) : null}
                  {!isRemoved && !addedBenefit && confidenceBadge(tx)}
                </div>
              )}
            </div>
          );
        })}
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
            {sorted.map((tx) => {
              const isRemoved = pendingRemoves.has(tx.id);
              const addedBenefit = pendingAdds.get(tx.id);

              return (
                <TableRow
                  key={tx.id}
                  highlight={tx.matchedStatus === "ambiguous"}
                  className={`group ${isRemoved ? "opacity-40" : ""}`}
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
                    <div className="flex items-center gap-1.5">
                      {addedBenefit && !tx.matchedBenefitName ? (
                        <span className="text-[var(--accent)]">{addedBenefit}</span>
                      ) : (tx.matchedBenefitName || addedBenefit) && !isRemoved ? (
                        <>
                          <span className="text-[var(--accent)]">
                            {tx.matchedBenefitName}
                          </span>
                          {renderFlagButton(tx)}
                        </>
                      ) : tx.matchedStatus === "ambiguous" ? (
                        <span className="text-[var(--color-warning)]">
                          Needs review
                        </span>
                      ) : (
                        <>
                          <span className="text-[var(--text-secondary)]">&mdash;</span>
                          {renderFlagButton(tx)}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="right" mono>
                    {tx.creditApplied && !isRemoved ? (
                      <span className="text-[var(--color-success)]">
                        -${tx.creditApplied.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[var(--text-secondary)]">&mdash;</span>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {!isRemoved && !addedBenefit && confidenceBadge(tx)}
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      </div>
    </>
  );
}
