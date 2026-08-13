import { requireAuth } from "@/lib/auth-helpers";
import { generateAndPersistAlerts } from "@/lib/alerts/orchestrator";
import {
  getActiveAlerts,
  getRecentClosedAlerts,
  markAllAlertsRead,
} from "@/lib/alerts/queries";
import { AlertsTab } from "../_components/AlertsTab";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const user = await requireAuth();

  // Refresh alert state on view — the calendar may have moved since the
  // last sync even if no new transactions arrived.
  try {
    await generateAndPersistAlerts(user.id!);
  } catch (err) {
    console.error("Alert generation failed:", err);
    // Non-fatal: render whatever state exists
  }

  const [active, closed] = await Promise.all([
    getActiveAlerts(user.id!),
    getRecentClosedAlerts(user.id!),
  ]);

  // Capture unread state for rendering, then clear the badge.
  const unreadIds = new Set(
    active.filter((a) => a.readAt === null).map((a) => a.id)
  );
  await markAllAlertsRead(user.id!);

  const serialize = (a: (typeof active)[number]) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    body: a.body,
    payload: a.payload as Record<string, unknown>,
    state: a.state,
    expiresAt: a.expiresAt?.toISOString() ?? null,
    updatedAt: a.updatedAt.toISOString(),
    unread: unreadIds.has(a.id),
  });

  return (
    <AlertsTab
      active={active.map(serialize)}
      closed={closed.map(serialize)}
    />
  );
}
