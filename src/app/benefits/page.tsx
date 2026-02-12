import { requireAuth } from "@/lib/auth-helpers";
import type { BenefitDetails, BenefitUsageSummary, BenefitCycle, CardSummary } from "@/lib/types";
import { redirect } from "next/navigation";
import {
  getCardSummary,
  getBenefitUsageSummaries,
  getBenefitTransactions,
  getRecentTransactions,
  getPlaidConnectionStatus,
  getCardProfiles,
  getUserAnniversaryStatus,
} from "@/lib/queries";
import type { BenefitTransaction } from "@/lib/queries";
import { getConnectionAlerts } from "@/lib/notifications";
import { getInsightsForDisplay } from "@/lib/insights/orchestrator";
import { getCardDefinition, getAllCardDefinitions } from "@/lib/cards";
import { getPointsEarningSummary } from "@/lib/points/queries";
import { getEarnConfig } from "@/lib/points/earn-configs";
import { computeBenefitsValue } from "@/lib/points/valuation";
import { simulateBenefitsForCard } from "@/lib/engine/benefit-simulator";
import { getCurrentCycleBounds, daysRemainingInCycle } from "@/lib/engine/cycle-utils";
import {
  getSimulationForCard,
  getMatcherTransactionsForProfile,
} from "@/lib/points/simulation-queries";
import { SummaryBar } from "./_components/SummaryBar";
import { BenefitCard } from "./_components/BenefitCard";
import { CountdownTimer } from "./_components/CountdownTimer";
import { AnniversaryPrompt } from "./_components/AnniversaryPrompt";
import { SyncButton } from "./_components/SyncButton";
import { ConnectionAlerts } from "./_components/ConnectionAlerts";
import { CardSwitcher } from "./_components/CardSwitcher";
import { UpcomingBenefits } from "./_components/UpcomingBenefits";
import { InsightsSection } from "./_components/InsightsSection";
import { PointsEarningSection } from "./_components/PointsEarningSection";
import { ViewAsSelector } from "./_components/ViewAsSelector";
import { ViewAsBanner } from "./_components/ViewAsBanner";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { LinkIcon, Plus } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

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

  // ── View As mode ──
  const viewAsParam = typeof params.viewAs === "string" ? params.viewAs : null;
  const viewAsDef = viewAsParam ? getCardDefinition(viewAsParam) : undefined;
  const isViewAsMode =
    !!viewAsDef && viewAsParam !== activeCard.cardType;

  // All card definitions for ViewAsSelector
  const allCardDefs = getAllCardDefinitions();

  // Fetch card-specific connections first (needed for transaction filtering)
  const connections = await getPlaidConnectionStatus(user.id!, activeCardId);
  const activeConnection = connections.find((c) => c.status === "active");

  // ── View As data path ──
  if (isViewAsMode) {
    const [simulation, matcherTxns] = await Promise.all([
      getSimulationForCard(activeCardId, viewAsParam!, false),
      getMatcherTransactionsForProfile(activeCardId),
    ]);

    // Empty state: no simulation data yet
    if (!simulation) {
      return (
        <div className="p-[var(--space-md)] md:p-[var(--space-lg)] min-w-0">
          {renderHeader(cardProfilesList, activeCard, activeCardId, activeConnection, allCardDefs, viewAsParam, isViewAsMode)}
          <ViewAsBanner cardName={viewAsDef!.name} annualFee={viewAsDef!.annualFee} />
          <div className="mt-[var(--space-xl)] text-center">
            <p className="text-[var(--text-body)] text-[var(--text-secondary)]">
              Sync your card to see estimated value for {viewAsDef!.name}
            </p>
          </div>
        </div>
      );
    }

    // Run benefit simulator for per-benefit capture amounts
    const benefitSim = simulateBenefitsForCard(viewAsParam!, matcherTxns, null);
    const viewAsEarnConfig = getEarnConfig(viewAsParam!);

    // Build synthetic CardSummary
    const simulatedSummary: CardSummary = {
      cardId: viewAsParam!,
      cardName: viewAsDef!.name,
      annualFee: viewAsDef!.annualFee,
      creditsAvailable: computeBenefitsValue(viewAsParam!),
      creditsUsed: benefitSim.total,
      creditsExpired: 0,
      effectiveFee: viewAsDef!.annualFee - benefitSim.total,
      roiPercent: 0,
      yearProgressPct: 0,
      daysUntilNextExpiry: null,
      valueAtRisk: 0,
      pointsEarned: simulation.totalPoints,
      pointsValueConservative: simulation.pointsValueConservative,
      pointsValueUpside: simulation.pointsValueUpside,
      conservativeCpp: viewAsEarnConfig?.valuation.conservativeCpp ?? null,
      netValue: simulation.netActual,
    };

    // Build simulated BenefitGroup[] from card definition + perBenefit map
    const now = new Date();
    const simulatedBenefitGroups = buildSimulatedBenefitGroups(
      viewAsDef!,
      benefitSim.perBenefit,
      now
    );

    // Points category breakdown from simulation
    const simCategories = simulation.categoryBreakdown.map((cat) => ({
      category: cat.category,
      spend: cat.totalSpend,
      points: cat.points,
      earnRate: cat.earnRate,
      valueConservative: cat.valueConservative,
    }));

    return (
      <div className="p-[var(--space-md)] md:p-[var(--space-lg)] min-w-0">
        {renderHeader(cardProfilesList, activeCard, activeCardId, activeConnection, allCardDefs, viewAsParam, isViewAsMode)}

        <ViewAsBanner cardName={viewAsDef!.name} annualFee={viewAsDef!.annualFee} />

        <SummaryBar summary={simulatedSummary} capturedLabel="estimated" />

        {/* Points earning section */}
        {simulation.totalPoints > 0 && viewAsEarnConfig && (
          <div className="mt-[var(--space-lg)]">
            <h2 className="label-caps mb-[var(--space-md)]">Points Earned</h2>
            <PointsEarningSection
              totalPoints={simulation.totalPoints}
              totalValueConservative={simulation.pointsValueConservative}
              conservativeCpp={viewAsEarnConfig.valuation.conservativeCpp}
              categories={simCategories}
            />
          </div>
        )}

        {/* Simulated benefits grid */}
        {(() => {
          const activeBenefits = simulatedBenefitGroups
            .filter((g) => now >= new Date(g.cycleStart))
            .sort(sortByUrgency);
          return (
            <div className="mt-[var(--space-lg)]">
              <div className="flex items-center gap-2 mb-[var(--space-md)]">
                <h2 className="label-caps">Benefits</h2>
                <Badge variant="neutral">{activeBenefits.length}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-3">
                {activeBenefits.map((group) => (
                  <BenefitCard
                    key={group.id}
                    group={group}
                    capturedLabel="estimated"
                    simulated
                  />
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ── Normal data path ──
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

  // Fetch benefit-linked transactions, insights, and points summary
  const allBenefitIds = benefits.map((b) => b.benefitId);
  const [benefitTxs, insights, pointsSummary] = await Promise.all([
    getBenefitTransactions(user.id!, allBenefitIds, activeCardId),
    getInsightsForDisplay(user.id!, "benefits_page", 3),
    getPointsEarningSummary(user.id!, activeCardId),
  ]);

  const earnConfig = getEarnConfig(activeCard.cardType);

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
      {renderHeader(cardProfilesList, activeCard, activeCardId, activeConnection, allCardDefs, viewAsParam, false)}

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
      <SummaryBar summary={summary} capturedLabel={capturedLabel} />

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

      {/* Points earning section (always below insights) */}
      {pointsSummary && earnConfig && pointsSummary.totalPoints > 0 && (
        <div className="mt-[var(--space-lg)]">
          <h2 className="label-caps mb-[var(--space-md)]">Points Earned</h2>
          <PointsEarningSection
            totalPoints={pointsSummary.totalPoints}
            totalValueConservative={pointsSummary.valueConservative}
            conservativeCpp={earnConfig.valuation.conservativeCpp}
            categories={pointsSummary.categoryBreakdown}
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

    </div>
  );
}

// ── Header (shared between normal and viewAs modes) ──

function renderHeader(
  cardProfilesList: Awaited<ReturnType<typeof getCardProfiles>>,
  activeCard: Awaited<ReturnType<typeof getCardProfiles>>[0],
  activeCardId: string,
  activeConnection: { id: string; status: string } | undefined,
  allCardDefs: ReturnType<typeof getAllCardDefinitions>,
  viewAsParam: string | null,
  isViewAsMode: boolean
) {
  return (
    <div className="mb-[var(--space-lg)] flex items-start justify-between gap-3">
      <div>
        <h1 className="text-h1 font-semibold tracking-tight">Card Value</h1>
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
          <span className="text-[var(--text-muted)]">&middot;</span>
          <ViewAsSelector
            cards={allCardDefs.map((c) => ({ id: c.id, name: c.name }))}
            activeCardType={activeCard.cardType}
            currentViewAs={viewAsParam}
          />
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
  );
}

// ── Build simulated BenefitGroup[] from card definition ──

function buildSimulatedBenefitGroups(
  cardDef: NonNullable<ReturnType<typeof getCardDefinition>>,
  perBenefit: Map<string, number>,
  referenceDate: Date
): BenefitGroup[] {
  // Build synthetic BenefitUsageSummary objects, then pass through groupBenefits
  const syntheticBenefits: BenefitUsageSummary[] = cardDef.benefits.map((b) => {
    const captured = perBenefit.get(b.id) ?? 0;
    const bounds = getCurrentCycleBounds(b.cycle, referenceDate, null);
    const daysLeft = daysRemainingInCycle(b.cycle, referenceDate, null);

    return {
      benefitId: b.id,
      benefitName: b.name,
      icon: b.icon,
      category: b.category,
      type: b.type,
      cycle: b.cycle,
      creditAmount: b.creditAmount,
      amountUsed: Math.min(captured, b.creditAmount),
      amountRemaining: Math.max(0, b.creditAmount - captured),
      isFullyUsed: captured >= b.creditAmount,
      manualOverride: false,
      daysRemaining: daysLeft,
      requiresActivation: b.requiresActivation,
      autoMatchable: b.autoMatchable,
      merchantPatterns: b.merchantPatterns,
      plaidCategories: b.plaidCategories,
      sunsetDate: b.sunsetDate,
      displayGroup: b.displayGroup,
      displayGroupName: b.displayGroupName,
      displayGroupIcon: b.displayGroupIcon,
      details: b.details,
      periodKey: bounds.periodKey,
      cycleStart: bounds.cycleStart,
      cycleEnd: bounds.cycleEnd,
      ytdUsed: Math.min(captured, b.creditAmount),
      isActivated: true,
      activatedAt: null,
      activeMonths: b.activeMonths,
      brandSlug: b.brandSlug,
    };
  });

  // Reuse groupBenefits with empty transactions
  return groupBenefits(syntheticBenefits, []);
}

// ── Group DoorDash sub-credits into a single display card ──

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
  activeMonths?: number[];
  brandSlug?: string;
}

function groupBenefits(
  benefits: BenefitUsageSummary[],
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
          brandSlug: b.brandSlug,
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
        activeMonths: b.activeMonths,
        brandSlug: b.brandSlug,
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
