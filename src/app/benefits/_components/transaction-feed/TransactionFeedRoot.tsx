"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { TransactionWithMatch } from "@/lib/types";
import {
  confidenceBadge,
  sortTransactions,
  sortIndicator as sortIndicatorFn,
  getEligibleBenefits as getEligibleBenefitsFn,
  getAmbiguousCandidates as getAmbiguousCandidatesFn,
  buildFilterOptions,
  computeFilterCounts,
  applyFilter,
} from "./helpers";
import { useFlagActions } from "./use-flag-actions";
import { FilterPillRow } from "./FilterPillRow";
import { MobileList } from "./MobileList";
import { DesktopTable } from "./DesktopTable";
import { PAGE_SIZE } from "./types";
import type { SortKey, SortDir, TransactionFeedProps, TransactionRowContext } from "./types";

export function TransactionFeed({ transactions, benefits, connectionId }: TransactionFeedProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [openRemoveId, setOpenRemoveId] = useState<string | null>(null);
  const [openAddId, setOpenAddId] = useState<string | null>(null);
  const [openReviewId, setOpenReviewId] = useState<string | null>(null);
  const [openHelpId, setOpenHelpId] = useState<string | null>(null);
  const [filterBenefitId, setFilterBenefitId] = useState<string | null>(null);
  const [extraTransactions, setExtraTransactions] = useState<TransactionWithMatch[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(transactions.length >= PAGE_SIZE);

  // Reset extra transactions when server-rendered props change
  const [prevTransactions, setPrevTransactions] = useState(transactions);
  if (transactions !== prevTransactions) {
    setPrevTransactions(transactions);
    setExtraTransactions([]);
    setHasMore(transactions.length >= PAGE_SIZE);
  }

  const allTransactions = useMemo(
    () => [...transactions, ...extraTransactions],
    [transactions, extraTransactions]
  );

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        offset: String(allTransactions.length),
        limit: String(PAGE_SIZE),
      });
      if (connectionId) params.set("connectionId", connectionId);
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const batch: TransactionWithMatch[] = data.transactions;
      setExtraTransactions((prev) => [...prev, ...batch]);
      if (batch.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error("Failed to load more transactions:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [allTransactions.length, connectionId]);

  // Stable callbacks for benefits lookups
  const getEligibleBenefits = useCallback(
    (txDate: Date) => getEligibleBenefitsFn(benefits, txDate),
    [benefits]
  );

  const getAmbiguousCandidates = useCallback(
    (tx: TransactionWithMatch) => getAmbiguousCandidatesFn(benefits, tx),
    [benefits]
  );

  const { pendingRemoves, pendingAdds, pendingSkips, handleRemove, handleAdd, handleSkip } =
    useFlagActions(getAmbiguousCandidates, getEligibleBenefits);

  const filterOptions = useMemo(() => buildFilterOptions(benefits), [benefits]);

  const filtered = useMemo(
    () => applyFilter(allTransactions, filterBenefitId, filterOptions),
    [allTransactions, filterBenefitId, filterOptions]
  );

  const filterCounts = useMemo(
    () => computeFilterCounts(allTransactions, filterOptions),
    [allTransactions, filterOptions]
  );

  const sorted = useMemo(
    () => sortTransactions(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  );

  // Close dropdowns on outside click
  useEffect(() => {
    if (!openRemoveId && !openAddId && !openReviewId && !openHelpId) return;
    const handleClick = () => {
      setOpenRemoveId(null);
      setOpenAddId(null);
      setOpenReviewId(null);
      setOpenHelpId(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openRemoveId, openAddId, openReviewId, openHelpId]);

  const toggleSort = useCallback((key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }, [sortKey, sortDir]);

  const sortIndicator = useCallback(
    (key: SortKey) => sortIndicatorFn(sortKey, sortDir, key),
    [sortKey, sortDir]
  );

  if (allTransactions.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-xl)] text-center">
        <p className="text-[var(--text-secondary)]">
          No transactions yet. Link your bank account and sync to see
          transactions here.
        </p>
      </div>
    );
  }

  const ctx: TransactionRowContext = {
    pendingRemoves,
    pendingAdds,
    pendingSkips,
    openRemoveId,
    openAddId,
    openReviewId,
    openHelpId,
    setOpenRemoveId,
    setOpenAddId,
    setOpenReviewId,
    setOpenHelpId,
    handleRemove,
    handleAdd,
    handleSkip,
    getEligibleBenefits,
    getAmbiguousCandidates,
    confidenceBadge,
  };

  return (
    <>
      <FilterPillRow
        filterBenefitId={filterBenefitId}
        setFilterBenefitId={setFilterBenefitId}
        filterCounts={filterCounts}
        filterOptions={filterOptions}
      />

      <MobileList
        sorted={sorted}
        sortKey={sortKey}
        sortIndicator={sortIndicator}
        toggleSort={toggleSort}
        ctx={ctx}
      />

      <DesktopTable
        sorted={sorted}
        sortKey={sortKey}
        sortIndicator={sortIndicator}
        toggleSort={toggleSort}
        ctx={ctx}
      />

      {hasMore && (
        <div className="mt-[var(--space-md)] flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 py-2 text-[var(--text-body)] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "View More"}
          </button>
        </div>
      )}
    </>
  );
}
