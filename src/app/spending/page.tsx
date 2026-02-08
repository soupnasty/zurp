import { requireAuth } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import {
  getUserCards,
  getRecentTransactions,
  getBenefitUsageSummaries,
  getPlaidConnectionStatus,
} from "@/lib/queries";
import {
  getMonthlyTransactions,
  buildCategoryBreakdown,
  getTransactionDateRange,
} from "@/lib/spending";
import { MonthSelector } from "./_components/MonthSelector";
import { SpendingHeadline } from "./_components/SpendingHeadline";
import { CategoryBreakdown } from "./_components/CategoryBreakdown";
import { TransactionFeed } from "@/app/benefits/_components/TransactionFeed";

export default async function SpendingPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  const userCards = await getUserCards(user.id!);
  if (userCards.length === 0) {
    redirect("/onboarding");
  }

  // Fetch date range first so we can default to the most recent month with data
  const now = new Date();
  const dateRange = await getTransactionDateRange(user.id!);

  // Default to most recent transaction month, falling back to current month
  const defaultDate = dateRange.maxDate ?? now;
  const year = params.year ? parseInt(params.year, 10) : defaultDate.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : defaultDate.getMonth() + 1;

  // Resolve active card for connection lookup
  const activeCard = userCards.find((c) => c.isPrimary) || userCards[0];
  const connections = await getPlaidConnectionStatus(user.id!, activeCard.id);
  const activeConnection = connections.find((c) => c.status === "active");

  // Parallel fetch
  const [spendingTxs, recentTxs, benefitUsages] = await Promise.all([
    getMonthlyTransactions(user.id!, year, month),
    getRecentTransactions(user.id!, 200, activeConnection?.id, 0, { year, month }),
    getBenefitUsageSummaries(user.id!),
  ]);

  const total = spendingTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const categories = buildCategoryBreakdown(spendingTxs);

  // Month navigation bounds
  const canGoPrev = dateRange.minDate
    ? year > dateRange.minDate.getFullYear() ||
      (year === dateRange.minDate.getFullYear() &&
        month > dateRange.minDate.getMonth() + 1)
    : false;

  const canGoNext =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1);

  return (
    <div className="p-[var(--space-md)] md:p-[var(--space-lg)]">
      {/* Month selector */}
      <div className="mb-[var(--space-lg)]">
        <MonthSelector
          year={year}
          month={month}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
        />
      </div>

      {/* Headline */}
      <div className="mb-[var(--space-lg)]">
        <SpendingHeadline total={total} />
      </div>

      {/* Category breakdown */}
      <h2 className="label-caps mb-[var(--space-md)]">Spending by Category</h2>
      <CategoryBreakdown categories={categories} />

      {/* Recent transactions */}
      <div className="mt-[var(--space-xl)]">
        <h2 className="label-caps mb-[var(--space-md)]">Transactions</h2>
        <TransactionFeed
          transactions={recentTxs}
          benefits={benefitUsages}
          connectionId={activeConnection?.id}
        />
      </div>
    </div>
  );
}
