import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { getCardProfiles } from "@/lib/queries";
import { resolveActiveCard } from "@/lib/resolve-card";
import { getRewardsView } from "@/lib/rewards/queries";
import { generateAndPersistAlerts } from "@/lib/alerts/orchestrator";
import { markAllAlertsRead } from "@/lib/alerts/queries";
import { RewardsTab } from "./_components/RewardsTab";

export const dynamic = "force-dynamic";

export default async function RewardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Legacy links: /dashboard?tab=compare goes to Verdict; the other old
  // tabs (track, insights, alerts) now live on this page.
  if (params.tab === "compare") {
    const card = typeof params.card === "string" ? `?card=${params.card}` : "";
    redirect(`/dashboard/verdict${card}`);
  }

  const user = await requireAuth();
  const cardProfilesList = await getCardProfiles(user.id!);
  const activeCard = resolveActiveCard(cardProfilesList, params.card);

  // Refresh reminders on view: the calendar may have moved since the last
  // sync even if no new transactions arrived.
  try {
    await generateAndPersistAlerts(user.id!);
  } catch (err) {
    console.error("Alert generation failed:", err);
  }

  const view = await getRewardsView(user.id!, activeCard.id);
  // Reminders are shown on the rows below, so the nav badge can clear.
  await markAllAlertsRead(user.id!);

  if (!view) {
    return <p className="text-[var(--text-secondary)]">We couldn&apos;t load this card.</p>;
  }

  return <RewardsTab view={view} cardName={activeCard.name} annualFee={activeCard.annualFee} />;
}
