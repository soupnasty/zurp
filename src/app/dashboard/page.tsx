import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { getCardProfiles } from "@/lib/queries";
import { resolveActiveCard } from "@/lib/resolve-card";
import { getInsightsForDisplay } from "@/lib/insights/orchestrator";
import {
  getCaptureRate,
  getRenewalStatus,
  getExpiringCredits,
  getCompareSnapshot,
} from "@/lib/home/queries";
import { HomeTab } from "./_components/HomeTab";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Legacy links: /dashboard?tab=track etc. still route to their tabs
  const tab = typeof params.tab === "string" ? params.tab : null;
  if (tab && ["compare", "track", "insights"].includes(tab)) {
    const card = typeof params.card === "string" ? `?card=${params.card}` : "";
    redirect(`/dashboard/${tab}${card}`);
  }

  const user = await requireAuth();
  const cardProfilesList = await getCardProfiles(user.id!);
  const activeCard = resolveActiveCard(cardProfilesList, params.card);

  const [captureRate, renewal, expiring, snapshot, insights] =
    await Promise.all([
      getCaptureRate(user.id!, activeCard.id),
      getRenewalStatus(user.id!, activeCard.id),
      getExpiringCredits(user.id!, activeCard.id),
      getCompareSnapshot(user.id!, activeCard.id),
      getInsightsForDisplay(user.id!, "home", 3),
    ]);

  const queue = insights.primary.map((i) => ({
    id: i.id,
    category: i.category as string,
    renderedTitle: i.renderedTitle,
    renderedBody: i.renderedBody,
    templateVars: i.templateVars,
  }));

  return (
    <HomeTab
      activeCardName={activeCard.name}
      activeCardFee={activeCard.annualFee}
      captureRate={captureRate}
      renewal={renewal}
      expiring={expiring}
      queue={queue}
      snapshot={snapshot}
      lastSyncedAt={activeCard.lastSyncedAt?.toISOString() ?? null}
    />
  );
}
