export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-helpers";
import { getPlaidConnectionStatus, getUserCards } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "./_components/SignOutButton";
import { Link2, CreditCard, Plus } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const user = await requireAuth();

  const [connections, userCards] = await Promise.all([
    getPlaidConnectionStatus(user.id!),
    getUserCards(user.id!),
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

        {/* Your Cards */}
        <section>
          <h2 className="label-caps mb-[var(--space-md)]">
            <div className="flex items-center gap-2">
              <CreditCard size={14} strokeWidth={1.75} />
              Your Cards
            </div>
          </h2>
          <div className="space-y-3">
            {userCards.map((uc) => (
              <Card key={uc.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-body)] font-semibold text-[var(--text-primary)]">
                      {uc.name}
                    </p>
                    <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                      {uc.issuer} &middot; Added{" "}
                      {new Date(uc.addedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {uc.isPrimary && <Badge variant="info">Primary</Badge>}
                </div>
              </Card>
            ))}
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-[var(--text-caption)] font-medium text-[var(--accent-signal)] hover:text-[var(--accent-signal-hover)] transition-colors"
            >
              <Plus size={14} />
              Add Card
            </Link>
          </div>
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
