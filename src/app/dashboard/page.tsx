import { requireAuth } from "@/lib/auth-helpers";
import type { BenefitDetails, BenefitUsageSummary } from "@/lib/types";
import { redirect } from "next/navigation";
import {
  getCardSummary,
  getBenefitUsageSummaries,
  getRecentTransactions,
  getPlaidConnectionStatus,
  getUserCards,
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
import { CardSwitcher } from "./_components/CardSwitcher";
import { UpcomingBenefits } from "./_components/UpcomingBenefits";
import Link from "next/link";
import { LinkIcon } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cardId?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  // Fetch all user cards to power the switcher
  const userCards = await getUserCards(user.id!);
  if (userCards.length === 0) {
    redirect("/onboarding");
  }

  // Resolve active card: use searchParam if valid, else primary, else first
  const requestedCardId = params.cardId;
  const activeCard =
    (requestedCardId && userCards.find((c) => c.id === requestedCardId)) ||
    userCards.find((c) => c.isPrimary) ||
    userCards[0];

  const activeCardId = activeCard.id;

  // Fetch card-specific connections first (needed for transaction filtering)
  const connections = await getPlaidConnectionStatus(user.id!, activeCardId);
  const activeConnection = connections.find((c) => c.status === "active");

  const [summary, benefits, transactions, anniversary, alerts] =
    await Promise.all([
      getCardSummary(user.id!, activeCardId),
      getBenefitUsageSummaries(user.id!, activeCardId),
      getRecentTransactions(user.id!, 50, activeConnection?.id),
      getUserAnniversaryStatus(user.id!, activeCardId),
      getConnectionAlerts(user.id!, activeCardId),
    ]);

  // If selected card has no summary (shouldn't happen but safety)
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

  return (
    <div className="p-[var(--space-md)] md:p-[var(--space-lg)] min-w-0">
      {/* Header */}
      <div className="mb-[var(--space-lg)] flex items-start justify-between gap-3">
        <div>
          <h1 className="text-h1 font-semibold tracking-tight">Benefits</h1>
          <div className="mt-1">
            <CardSwitcher
              cards={userCards.map((c) => ({
                id: c.id,
                name: c.name,
                issuer: c.issuer,
                isPrimary: c.isPrimary,
              }))}
              activeCardId={activeCardId}
            />
            {userCards.length <= 1 && (
              <p className="text-[var(--text-secondary)]">{summary.cardName}</p>
            )}
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
            benefitName={
              nearestExpiring.displayGroupName || nearestExpiring.benefitName
            }
            daysRemaining={nearestExpiring.daysRemaining}
            amountRemaining={nearestExpiring.amountRemaining}
          />
        </div>
      )}

      {/* Benefits grid — split active vs upcoming, sorted by urgency */}
      {(() => {
        const now = new Date();
        const activeBenefits = groupedBenefits
          .filter((g) => now >= new Date(g.cycleStart))
          .sort(sortByUrgency);
        const upcomingBenefits = groupedBenefits
          .filter((g) => now < new Date(g.cycleStart))
          .sort(sortByUrgency);
        return (
          <>
            <div className="mt-[var(--space-lg)]">
              <h2 className="label-caps mb-[var(--space-md)]">Active Benefits</h2>
              <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-3">
                {activeBenefits.map((group) => (
                  <BenefitCard key={group.id} group={group} transactions={transactions} />
                ))}
              </div>
            </div>
            <UpcomingBenefits benefits={upcomingBenefits} />
          </>
        );
      })()}

      {/* Recent transactions */}
      <div className="mt-[var(--space-xl)]">
        <h2 className="label-caps mb-[var(--space-md)]">Recent Transactions</h2>
        <TransactionFeed transactions={transactions} benefits={benefits} connectionId={activeConnection?.id} />
      </div>
    </div>
  );
}

// Group DoorDash sub-credits into a single display card
export interface BenefitGroup {
  id: string;
  name: string;
  icon: string;
  totalCredit: number;
  totalUsed: number;
  totalRemaining: number;
  isFullyUsed: boolean;
  manualOverride: boolean;
  daysRemaining: number;
  cycle: string;
  requiresActivation: boolean;
  autoMatchable: boolean;
  sunsetDate: string | null;
  type: string;
  cycleStart: string;
  cycleEnd: string;
  details: BenefitDetails | null;
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
        existing.manualOverride = existing.manualOverride && b.manualOverride;
        existing.daysRemaining = Math.min(
          existing.daysRemaining,
          b.daysRemaining
        );
        if (!existing.details && b.details) existing.details = b.details;
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
          manualOverride: b.manualOverride,
          daysRemaining: b.daysRemaining,
          cycle: b.cycle,
          requiresActivation: b.requiresActivation,
          autoMatchable: b.autoMatchable,
          sunsetDate: b.sunsetDate,
          type: b.type,
          cycleStart: b.cycleStart.toISOString(),
          cycleEnd: b.cycleEnd.toISOString(),
          details: b.details,
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
        manualOverride: b.manualOverride,
        daysRemaining: b.daysRemaining,
        cycle: b.cycle,
        requiresActivation: b.requiresActivation,
        autoMatchable: b.autoMatchable,
        sunsetDate: b.sunsetDate,
        type: b.type,
        cycleStart: b.cycleStart.toISOString(),
        cycleEnd: b.cycleEnd.toISOString(),
        details: b.details,
        benefits: [b],
      });
    }
  }

  return [...groups.values(), ...ungrouped];
}

// Sort benefits by urgency: actionable items first, fully-used last.
// Within actionable: expiring soonest with remaining value on top,
// then partially used, then untouched. Ties broken by daysRemaining.
function sortByUrgency(a: BenefitGroup, b: BenefitGroup): number {
  const tierA = urgencyTier(a);
  const tierB = urgencyTier(b);
  if (tierA !== tierB) return tierA - tierB;
  return a.daysRemaining - b.daysRemaining;
}

function urgencyTier(g: BenefitGroup): number {
  if (g.isFullyUsed) return 3; // nothing to do
  if (g.totalUsed > 0) return 1; // partially used — finish it
  return 2; // untouched — start it
}
