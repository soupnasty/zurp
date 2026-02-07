export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-helpers";
import { getPlaidConnectionStatus, getUserAnniversaryStatus } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "./_components/SignOutButton";
import { Link2, Calendar, Palette, LogOut } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireAuth();

  const [connections, anniversary] = await Promise.all([
    getPlaidConnectionStatus(user.id!),
    getUserAnniversaryStatus(user.id!),
  ]);

  return (
    <div className="p-[var(--space-lg)]">
      <h1 className="text-h1 font-semibold tracking-tight mb-[var(--space-lg)]">
        Settings
      </h1>

      <div className="max-w-2xl space-y-[var(--space-lg)]">
        {/* Account */}
        <section>
          <h2 className="label-caps mb-[var(--space-md)]">Account</h2>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-body)] font-semibold text-[var(--text-primary)]">
                  Email
                </p>
                <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                  {user.email}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Connections */}
        <section>
          <h2 className="label-caps mb-[var(--space-md)]">
            <div className="flex items-center gap-2">
              <Link2 size={14} strokeWidth={1.75} />
              Linked Accounts
            </div>
          </h2>
          {connections.length === 0 ? (
            <Card>
              <p className="text-[var(--text-secondary)]">
                No bank accounts linked yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {connections.map((conn) => (
                <Card key={conn.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[var(--text-body)] font-semibold text-[var(--text-primary)]">
                        {conn.institutionName}
                      </p>
                      <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                        Last synced:{" "}
                        {conn.lastSyncedAt
                          ? new Date(conn.lastSyncedAt).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        conn.status === "active"
                          ? "success"
                          : conn.status === "needs_reauth"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {conn.status === "active"
                        ? "Active"
                        : conn.status === "needs_reauth"
                          ? "Needs reauth"
                          : "Disconnected"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Anniversary */}
        {anniversary && (
          <section>
            <h2 className="label-caps mb-[var(--space-md)]">
              <div className="flex items-center gap-2">
                <Calendar size={14} strokeWidth={1.75} />
                Card Anniversary
              </div>
            </h2>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-body)] font-semibold text-[var(--text-primary)]">
                    {anniversary.anniversaryDate
                      ? new Date(anniversary.anniversaryDate).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" }
                        )
                      : "Not set"}
                  </p>
                  <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                    Source:{" "}
                    {anniversary.anniversarySource === "auto_detected"
                      ? "Auto-detected from fee transaction"
                      : anniversary.anniversarySource === "user_provided"
                        ? "Manually set"
                        : "Pending detection"}
                  </p>
                </div>
                <Badge
                  variant={
                    anniversary.anniversarySource === "pending"
                      ? "warning"
                      : "success"
                  }
                >
                  {anniversary.anniversarySource === "pending"
                    ? "Pending"
                    : "Set"}
                </Badge>
              </div>
            </Card>
          </section>
        )}

        {/* Sign Out */}
        <section>
          <h2 className="label-caps mb-[var(--space-md)]">Session</h2>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-body)] font-semibold text-[var(--text-primary)]">
                  Sign out
                </p>
                <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                  End your current session
                </p>
              </div>
              <SignOutButton />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
