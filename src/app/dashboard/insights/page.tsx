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

  const insights = await getInsightsForDisplay(user.id!, "dashboard", 20);

  const serializedInsights = insights.map((i) => ({
    ...i,
    periodStart: i.periodStart?.toISOString() ?? null,
    periodEnd: i.periodEnd?.toISOString() ?? null,
    generatedAt: i.generatedAt.toISOString(),
    shownAt: i.shownAt?.toISOString() ?? null,
    resolvedAt: i.resolvedAt?.toISOString() ?? null,
  }));

  return (
    <InsightsTab
      insights={serializedInsights}
      activeCardName={activeCard.name}
    />
  );
}
