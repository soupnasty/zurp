import { requireAuth } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import {
  getCardProfiles,
  getRecentTransactions,
  getBenefitUsageSummaries,
  getPlaidConnectionStatus,
} from "@/lib/queries";
import {
  getMonthlyTransactions,
  buildCategoryBreakdown,
  getTransactionDateRange,
} from "@/lib/spending";
import { getCardDefinition } from "@/lib/cards";
import { getConnectionAlerts } from "@/lib/notifications";
import { CardSwitcher } from "@/app/benefits/_components/CardSwitcher";
import { SyncButton } from "@/app/benefits/_components/SyncButton";
import { ConnectionAlerts } from "@/app/benefits/_components/ConnectionAlerts";
import { MonthSelector } from "./_components/MonthSelector";
import { SpendingHeadline } from "./_components/SpendingHeadline";
import { CategoryBreakdown } from "./_components/CategoryBreakdown";
import { TransactionFeed } from "@/app/benefits/_components/TransactionFeed";
import Link from "next/link";
import { LinkIcon, Plus } from "lucide-react";

export default async function SpendingPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  const cardProfilesList = await getCardProfiles(user.id!);
  if (cardProfilesList.length === 0) {
    redirect("/onboarding");
  }

  // Resolve active card: first active, else first
  const activeCard =
    cardProfilesList.find((c) => c.isActive) ||
    cardProfilesList[0];

  // Fetch date range first so we can default to the most recent month with data
  const now = new Date();
  const dateRange = await getTransactionDateRange(user.id!);

  // Default to most recent transaction month, falling back to current month
  const defaultDate = dateRange.maxDate ?? now;
  const year = params.year ? parseInt(params.year, 10) : defaultDate.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : defaultDate.getMonth() + 1;

  // Resolve connection for active card
  const connections = await getPlaidConnectionStatus(user.id!, activeCard.id);
  const activeConnection = connections.find((c) => c.status === "active");

  // Parallel fetch
  const [spendingTxs, recentTxs, benefitUsages, alerts] = await Promise.all([
    getMonthlyTransactions(user.id!, year, month),
    getRecentTransactions(user.id!, 200, undefined, 0, { year, month }, {
      excludeCategories: ["INCOME", "TRANSFER_IN", "LOAN_PAYMENTS", "BANK_FEES"],
    }),
    getBenefitUsageSummaries(user.id!),
    getConnectionAlerts(user.id!, activeCard.id),
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
      {/* Header */}
      <div className="mb-[var(--space-lg)] flex items-start justify-between gap-3">
        <div>
          <h1 className="text-h1 font-semibold tracking-tight">Spending</h1>
          <div className="mt-1 flex items-center gap-2">
            {cardProfilesList.length > 1 ? (
              <CardSwitcher
                allCards={[...new Map(cardProfilesList.map((profile) => {
                  const def = getCardDefinition(profile.cardType)!;
                  return [def.id, { id: def.id, name: def.name, issuer: def.issuer, annualFee: def.annualFee }] as const;
                })).values()]}
                activeCardProfileId={activeCard.id}
                activeCardType={activeCard.cardType}
              />
            ) : (
              <span className="text-[var(--text-secondary)] text-[var(--text-caption)] font-medium">
                {getCardDefinition(activeCard.cardType)?.name ?? activeCard.cardType}
              </span>
            )}
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center rounded-md border border-[var(--border-default)] p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              title="Add card"
            >
              <Plus size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
        <div className="shrink-0">
          {activeConnection ? (
            <SyncButton connectionId={activeConnection.id} />
          ) : (
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[var(--text-caption)] font-medium text-[var(--color-void)] transition-opacity hover:opacity-90"
            >
              <LinkIcon size={16} />
              Link Card
            </Link>
          )}
        </div>
      </div>

      {/* Connection alerts */}
      {alerts.length > 0 && (
        <div className="mb-[var(--space-lg)]">
          <ConnectionAlerts alerts={alerts} />
        </div>
      )}

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
        />
      </div>
    </div>
  );
}
