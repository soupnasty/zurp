import { requireAuth } from "@/lib/auth-helpers";
import { getCardProfiles } from "@/lib/queries";
import { getInsightsForDisplay } from "@/lib/insights/orchestrator";
import { resolveActiveCard } from "../_lib/resolve-card";
import { InsightsTab } from "../_components/InsightsTab";

export const dynamic = "force-dynamic";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const cardProfilesList = await getCardProfiles(user.id!);
  const activeCard = resolveActiveCard(cardProfilesList, params.card);

  const { primary, expanded } = await getInsightsForDisplay(user.id!, "dashboard", 3, 20);

  const serializeInsight = (i: (typeof primary)[number]) => ({
    ...i,
    periodStart: i.periodStart?.toISOString() ?? null,
    periodEnd: i.periodEnd?.toISOString() ?? null,
    generatedAt: i.generatedAt.toISOString(),
    shownAt: i.shownAt?.toISOString() ?? null,
    resolvedAt: i.resolvedAt?.toISOString() ?? null,
  });

  const serializedInsights = primary.map(serializeInsight);
  const serializedExpanded = expanded.map(serializeInsight);

  return (
    <InsightsTab
      insights={serializedInsights}
      expandedInsights={serializedExpanded}
      activeCardName={activeCard.name}
      activeCardFee={activeCard.annualFee}
      anniversaryDate={activeCard.anniversaryDate?.toISOString() ?? null}
    />
  );
}
