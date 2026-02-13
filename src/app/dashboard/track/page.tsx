import { requireAuth } from "@/lib/auth-helpers";
import {
  getCardSummary,
  getBenefitUsageSummaries,
  getBenefitTransactions,
  getCardProfiles,
} from "@/lib/queries";
import { getPointsEarningSummary } from "@/lib/points/queries";
import { getDataStats } from "@/lib/points/simulation-queries";
import { getEarnConfig } from "@/lib/points/earn-configs";
import { groupBenefits } from "@/lib/benefit-grouping";
import { resolveActiveCard } from "../_lib/resolve-card";
import { classifyBenefitStatus } from "../_lib/classify-benefits";
import { TrackTab } from "../_components/TrackTab";

export const dynamic = "force-dynamic";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const cardProfilesList = await getCardProfiles(user.id!);
  const activeCard = resolveActiveCard(cardProfilesList, params.card);
  const activeCardId = activeCard.id;

  const [cardSummary, benefits, pointsSummary, dataStats] = await Promise.all([
    getCardSummary(user.id!, activeCardId),
    getBenefitUsageSummaries(user.id!, activeCardId),
    getPointsEarningSummary(user.id!, activeCardId),
    getDataStats(activeCardId),
  ]);

  // Fetch matched transactions for all benefits
  const allBenefitIds = benefits.map((b) => b.benefitId);
  const benefitTxs = allBenefitIds.length > 0
    ? await getBenefitTransactions(user.id!, allBenefitIds, activeCardId)
    : [];

  // Group benefits (DoorDash grouping + transaction attachment)
  const benefitGroups = groupBenefits(benefits, benefitTxs);

  // Classify benefit status + compute upcoming resets
  const now = new Date();
  const classifiedGroups = benefitGroups
    .filter((g) => now >= new Date(g.cycleStart))
    .map((g) => ({
      ...g,
      status: classifyBenefitStatus(g),
    }));

  // Group by cadence
  const annualBenefits = classifiedGroups.filter((g) =>
    ["annual_calendar", "annual_anniversary"].includes(g.cycle)
  );
  const biannualBenefits = classifiedGroups.filter((g) =>
    g.cycle.startsWith("biannual")
  );
  const quarterlyBenefits = classifiedGroups.filter((g) =>
    g.cycle.startsWith("quarterly")
  );
  const monthlyBenefits = classifiedGroups.filter((g) => g.cycle === "monthly");

  // Upcoming resets
  const upcomingResets = classifiedGroups
    .filter((g) => g.daysRemaining <= 30 && g.totalRemaining > 0 && !g.isFullyUsed)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      cycle: g.cycle,
      totalRemaining: g.totalRemaining,
      daysRemaining: g.daysRemaining,
      cycleEnd: g.cycleEnd,
    }));

  // Earn config for points section
  const earnConfig = getEarnConfig(activeCard.cardType);

  const serializedPointsSummary = pointsSummary
    ? {
        ...pointsSummary,
        lastTransactionDate: pointsSummary.lastTransactionDate?.toISOString() ?? null,
      }
    : null;

  return (
    <TrackTab
      cardSummary={cardSummary}
      benefitGroups={classifiedGroups}
      annualBenefits={annualBenefits}
      biannualBenefits={biannualBenefits}
      quarterlyBenefits={quarterlyBenefits}
      monthlyBenefits={monthlyBenefits}
      pointsSummary={serializedPointsSummary}
      earnConfig={earnConfig ? { conservativeCpp: earnConfig.valuation.conservativeCpp } : null}
      upcomingResets={upcomingResets}
      activeCardName={activeCard.name}
      activeCardFee={activeCard.annualFee}
      monthCount={dataStats?.monthCount ?? null}
      totalTransactions={dataStats?.totalTransactions ?? null}
    />
  );
}
