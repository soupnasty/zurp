import { requireAuth } from "@/lib/auth-helpers";
import { getCardProfiles } from "@/lib/queries";
import { hasUnseenInsights } from "@/lib/insights/queries";
import { getUnreadAlertCount } from "@/lib/alerts/queries";
import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  const [cardProfilesList, hasNew, unreadAlerts] = await Promise.all([
    getCardProfiles(user.id!),
    hasUnseenInsights(user.id!),
    getUnreadAlertCount(user.id!),
  ]);

  // Serialize dates for client components
  const cardProfiles = cardProfilesList.map((c) => ({
    id: c.id,
    cardType: c.cardType,
    name: c.name,
    annualFee: c.annualFee,
    isActive: c.isActive,
    connectionId: c.connectionId,
    connectionStatus: c.connectionStatus,
    lastSyncedAt: c.lastSyncedAt?.toISOString() ?? null,
  }));

  return (
    <AppShell
      userEmail={user.email ?? undefined}
      dashboardNav={{ hasNewInsights: hasNew, unreadAlerts, cardProfiles }}
    >
      {children}
    </AppShell>
  );
}
