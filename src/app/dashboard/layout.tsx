import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { getCardProfiles } from "@/lib/queries";
import { hasUnseenInsights } from "@/lib/insights/queries";
import { AppShell } from "@/components/AppShell";
import { SyncFooter } from "./_components/SyncFooter";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  const [cardProfilesList, hasNew] = await Promise.all([
    getCardProfiles(user.id!),
    hasUnseenInsights(user.id!),
  ]);

  if (cardProfilesList.length === 0) {
    redirect("/onboarding");
  }

  // Serialize dates to strings for client components
  const cardProfiles = cardProfilesList.map((c) => ({
    id: c.id,
    cardType: c.cardType,
    name: c.name,
    annualFee: c.annualFee,
    connectionId: c.connectionId,
    connectionStatus: c.connectionStatus,
    lastSyncedAt: c.lastSyncedAt?.toISOString() ?? null,
  }));

  return (
    <AppShell
      userEmail={user.email ?? undefined}
      dashboardNav={{ hasNewInsights: hasNew, cardProfiles }}
    >
      <div className="mx-auto max-w-[960px] px-4 pt-8 pb-32 md:px-8">
        {children}
      </div>
      <SyncFooter cardProfiles={cardProfiles} />
    </AppShell>
  );
}
