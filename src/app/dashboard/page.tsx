import { requireAuth } from "@/lib/auth-helpers";
import type { BenefitUsageSummary } from "@/lib/types";
import { redirect } from "next/navigation";
import {
  getCardSummary,
  getBenefitUsageSummaries,
  getRecentTransactions,
  getPlaidConnectionStatus,
  getUserAnniversaryStatus,
} from "@/lib/queries";
import { getConnectionAlerts } from "@/lib/notifications";
import { SummaryBar } from "./_components/SummaryBar";
import { BenefitCard } from "./_components/BenefitCard";
import { CountdownTimer } from "./_components/CountdownTimer";
import { TransactionFeed } from "./_components/TransactionFeed";
import { AnniversaryPrompt } from "./_components/AnniversaryPrompt";
import { SyncButton } from "./_components/SyncButton";
import { ConnectionAlerts } from "./_components/ConnectionAlerts";

export default async function DashboardPage() {
  const user = await requireAuth();

  const [summary, benefits, transactions, connections, anniversary, alerts] =
    await Promise.all([
      getCardSummary(user.id!),
      getBenefitUsageSummaries(user.id!),
      getRecentTransactions(user.id!),
      getPlaidConnectionStatus(user.id!),
      getUserAnniversaryStatus(user.id!),
      getConnectionAlerts(user.id!),
    ]);

  // If no card, redirect to onboarding
  if (!summary) {
    redirect("/onboarding");
  }

  // Group benefits by displayGroup for DoorDash
  const groupedBenefits = groupBenefits(benefits);

  // Find nearest expiring benefit
  const creditBenefits = benefits.filter(
    (b) => b.type === "credit" && !b.isFullyUsed
  );
  const nearestExpiring = creditBenefits.length
    ? creditBenefits.reduce((nearest, b) =>
        b.daysRemaining < nearest.daysRemaining ? b : nearest
      )
    : null;

  const activeConnection = connections.find((c) => c.status === "active");

  return (
    <div className="p-[var(--space-lg)]">
      {/* Header */}
      <div className="mb-[var(--space-lg)] flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            {summary.cardName}
          </p>
        </div>
        <SyncButton connectionId={activeConnection?.id ?? null} />
      </div>

      {/* Connection alerts */}
      {alerts.length > 0 && (
        <div className="mb-[var(--space-lg)]">
          <ConnectionAlerts alerts={alerts} />
        </div>
      )}

      {/* Anniversary prompt */}
      {anniversary && anniversary.anniversarySource === "pending" && (
        <div className="mb-[var(--space-lg)]">
          <AnniversaryPrompt userCardId={anniversary.userCardId} />
        </div>
      )}

      {/* Summary cards */}
      <SummaryBar summary={summary} />

      {/* Countdown */}
      {nearestExpiring && (
        <div className="mt-[var(--space-lg)]">
          <CountdownTimer
            benefitName={nearestExpiring.displayGroupName || nearestExpiring.benefitName}
            daysRemaining={nearestExpiring.daysRemaining}
            amountRemaining={nearestExpiring.amountRemaining}
          />
        </div>
      )}

      {/* Benefits grid */}
      <div className="mt-[var(--space-lg)]">
        <h2 className="label-caps mb-[var(--space-md)]">Benefits</h2>
        <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-3">
          {groupedBenefits.map((group) => (
            <BenefitCard key={group.id} group={group} />
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="mt-[var(--space-xl)]">
        <h2 className="label-caps mb-[var(--space-md)]">
          Recent Transactions
        </h2>
        <TransactionFeed transactions={transactions} />
      </div>
    </div>
  );
}

// Group DoorDash sub-credits into a single display card
interface BenefitGroup {
  id: string;
  name: string;
  icon: string;
  totalCredit: number;
  totalUsed: number;
  totalRemaining: number;
  isFullyUsed: boolean;
  daysRemaining: number;
  cycle: string;
  requiresActivation: boolean;
  autoMatchable: boolean;
  sunsetDate: string | null;
  type: string;
  benefits: BenefitUsageSummary[];
}

function groupBenefits(
  benefits: Awaited<ReturnType<typeof getBenefitUsageSummaries>>
) {
  const groups = new Map<string, any>();
  const ungrouped: any[] = [];

  for (const b of benefits) {
    if (b.displayGroup) {
      const existing = groups.get(b.displayGroup);
      if (existing) {
        existing.totalCredit += b.creditAmount;
        existing.totalUsed += b.amountUsed;
        existing.totalRemaining += b.amountRemaining;
        existing.isFullyUsed = existing.isFullyUsed && b.isFullyUsed;
        existing.daysRemaining = Math.min(
          existing.daysRemaining,
          b.daysRemaining
        );
        existing.benefits.push(b);
      } else {
        groups.set(b.displayGroup, {
          id: b.displayGroup,
          name: b.displayGroupName || b.benefitName,
          icon: b.displayGroupIcon || b.icon,
          totalCredit: b.creditAmount,
          totalUsed: b.amountUsed,
          totalRemaining: b.amountRemaining,
          isFullyUsed: b.isFullyUsed,
          daysRemaining: b.daysRemaining,
          cycle: b.cycle,
          requiresActivation: b.requiresActivation,
          autoMatchable: b.autoMatchable,
          sunsetDate: b.sunsetDate,
          type: b.type,
          benefits: [b],
        });
      }
    } else {
      ungrouped.push({
        id: b.benefitId,
        name: b.benefitName,
        icon: b.icon,
        totalCredit: b.creditAmount,
        totalUsed: b.amountUsed,
        totalRemaining: b.amountRemaining,
        isFullyUsed: b.isFullyUsed,
        daysRemaining: b.daysRemaining,
        cycle: b.cycle,
        requiresActivation: b.requiresActivation,
        autoMatchable: b.autoMatchable,
        sunsetDate: b.sunsetDate,
        type: b.type,
        benefits: [b],
      });
    }
  }

  return [...groups.values(), ...ungrouped];
}
