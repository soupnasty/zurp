import { requireAuth } from "@/lib/auth-helpers";
import type { BenefitDetails, BenefitUsageSummary } from "@/lib/types";
import { redirect } from "next/navigation";
import {
  getCardSummary,
  getBenefitUsageSummaries,
  getBenefitTransactions,
  getRecentTransactions,
  getPlaidConnectionStatus,
  getCardProfiles,
  getUserAnniversaryStatus,
  getCreditsDebugBreakdown,
} from "@/lib/queries";
import type { BenefitTransaction } from "@/lib/queries";
import { getConnectionAlerts } from "@/lib/notifications";
import { getInsightsForDisplay } from "@/lib/insights/orchestrator";
import { getCardDefinition } from "@/lib/cards";
import { SummaryBar } from "./_components/SummaryBar";
import { BenefitCard } from "./_components/BenefitCard";
import { CountdownTimer } from "./_components/CountdownTimer";
import { AnniversaryPrompt } from "./_components/AnniversaryPrompt";
import { SyncButton } from "./_components/SyncButton";
import { ConnectionAlerts } from "./_components/ConnectionAlerts";
import { CardSwitcher } from "./_components/CardSwitcher";
import { UpcomingBenefits } from "./_components/UpcomingBenefits";
import { InsightsSection } from "./_components/InsightsSection";
import { DebugCreditsTable } from "./_components/DebugCreditsTable";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { LinkIcon, Plus } from "lucide-react";

const isDev = process.env.NODE_ENV === "development";

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch all card profiles
  const cardProfilesList = await getCardProfiles(user.id!);
  if (cardProfilesList.length === 0) {
    redirect("/onboarding");
  }

  // Resolve active card: first active, else first
  const activeCard =
    cardProfilesList.find((c) => c.isActive) ||
    cardProfilesList[0];

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

  // Fetch benefit-linked transactions and insights
  const allBenefitIds = benefits.map((b) => b.benefitId);
  const [benefitTxs, insights, debugData] = await Promise.all([
    getBenefitTransactions(user.id!, allBenefitIds, activeCardId),
    getInsightsForDisplay(user.id!, "benefits_page", 3),
    isDev ? getCreditsDebugBreakdown(user.id!, activeCardId) : null,
  ]);

  // Group benefits by displayGroup for DoorDash
  const groupedBenefits = groupBenefits(benefits, benefitTxs);

  // Label for YTD captured: "this cycle" if anniversary date is set, "this year" otherwise
  const capturedLabel =
    anniversary && anniversary.anniversarySource !== "pending"
      ? "this cycle"
      : "this year";

  // Find nearest expiring benefit (within 14-day window, matching "Expiring Soon" threshold)
  const creditBenefits = benefits.filter(
    (b) => b.type === "credit" && !b.isFullyUsed && b.daysRemaining <= 14
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

      {/* Anniversary prompt */}
      {anniversary && anniversary.anniversarySource === "pending" && (
        <div className="mb-[var(--space-lg)]">
          <AnniversaryPrompt cardProfileId={anniversary.cardProfileId} hasActivity={summary.creditsUsed > 0} />
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

      {/* Benefit insights */}
      <InsightsSection insights={insights} />

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
              <div className="flex items-center gap-2 mb-[var(--space-md)]">
                <h2 className="label-caps">Active Benefits</h2>
                <Badge variant="neutral">{activeBenefits.length}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-3">
                {activeBenefits.map((group) => (
                  <BenefitCard key={group.id} group={group} capturedLabel={capturedLabel} />
                ))}
              </div>
            </div>
            <UpcomingBenefits benefits={upcomingBenefits} capturedLabel={capturedLabel} />
          </>
        );
      })()}

      {isDev && debugData && <DebugCreditsTable data={debugData} />}
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
  ytdUsed?: number;
  benefitTransactions: BenefitTransaction[];
  isActivated?: boolean;
  activatedAt?: string | null;
}

function groupBenefits(
  benefits: Awaited<ReturnType<typeof getBenefitUsageSummaries>>,
  allTxs: BenefitTransaction[] = []
) {
  // Index transactions by benefitId
  const txByBenefit = new Map<string, BenefitTransaction[]>();
  for (const tx of allTxs) {
    const list = txByBenefit.get(tx.benefitId) ?? [];
    list.push(tx);
    txByBenefit.set(tx.benefitId, list);
  }

  const groups = new Map<string, any>();
  const ungrouped: any[] = [];

  for (const b of benefits) {
    const bTxs = txByBenefit.get(b.benefitId) ?? [];

    if (b.displayGroup) {
      const existing = groups.get(b.displayGroup);
      if (existing) {
        existing.totalCredit += b.creditAmount;
        existing.totalUsed += b.amountUsed;
        existing.totalRemaining += b.amountRemaining;
        existing.isFullyUsed = existing.isFullyUsed && b.isFullyUsed;
        existing.manualOverride = existing.manualOverride || b.manualOverride;
        existing.daysRemaining = Math.min(
          existing.daysRemaining,
          b.daysRemaining
        );
        if (b.ytdUsed != null) {
          existing.ytdUsed = (existing.ytdUsed ?? 0) + b.ytdUsed;
        }
        if (!existing.details && b.details) existing.details = b.details;
        existing.benefits.push(b);
        existing.benefitTransactions.push(...bTxs);
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
          ytdUsed: b.ytdUsed,
          benefitTransactions: [...bTxs],
          isActivated: b.isActivated,
          activatedAt: b.activatedAt,
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
        ytdUsed: b.ytdUsed,
        benefitTransactions: bTxs,
        isActivated: b.isActivated,
        activatedAt: b.activatedAt,
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
