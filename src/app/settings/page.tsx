export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-helpers";
import { getPlaidConnectionStatus, getCardProfiles } from "@/lib/queries";
import { getAllCardDefinitions } from "@/lib/cards";
import { SignOutButton } from "./_components/SignOutButton";
import { UnlinkButton } from "./_components/UnlinkButton";
import { RemoveCardButton } from "@/components/RemoveCardButton";
import { AnniversaryEditor } from "./_components/AnniversaryEditor";
import { CardTypeEditor } from "./_components/CardTypeEditor";
import {
  CreditCard,
  Link2,
  User,
  LogOut,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { ReauthButton } from "@/components/ReauthButton";

export default async function SettingsPage() {
  const user = await requireAuth();

  const [connections, cardProfilesList] = await Promise.all([
    getPlaidConnectionStatus(user.id!),
    getCardProfiles(user.id!),
  ]);

  const allCardTypes = getAllCardDefinitions().map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="mx-auto max-w-[960px] px-4 pt-8 pb-32 md:px-8">
      {/* Your Cards */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Cards
          </h2>
          <Link
            href="/onboarding"
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-cyan)] transition-colors hover:bg-[rgba(34,211,238,0.08)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Plus size={14} strokeWidth={2} />
            ADD CARD
          </Link>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
          style={{ position: "relative" }}
        >
          {/* Top edge glow */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(34,211,238,0.2), transparent)",
            }}
          />

          {cardProfilesList.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <CreditCard
                size={28}
                strokeWidth={1.5}
                className="mx-auto mb-3 text-[var(--text-dim)]"
              />
              <p className="text-sm text-[var(--text-secondary)]">
                No cards added yet.
              </p>
              <Link
                href="/onboarding"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent-cyan)] transition-colors hover:text-[var(--text-primary)]"
              >
                <Plus size={14} strokeWidth={2} />
                Add your first card
              </Link>
            </div>
          ) : (
            cardProfilesList.map((cp, i) => (
              <div
                key={cp.id}
                className={`px-5 py-4 transition-colors hover:bg-[var(--bg-card-hover)] ${
                  i < cardProfilesList.length - 1
                    ? "border-b border-[var(--border-subtle)]"
                    : ""
                }`}
              >
                {/* Row 1: Card name + remove */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {cp.name}
                      </span>
                      {cp.isActive && (
                        <span
                          className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                          style={{
                            fontFamily: "var(--font-mono)",
                            letterSpacing: "0.5px",
                            color: "var(--color-accent-cyan)",
                            background: "rgba(34,211,238,0.08)",
                          }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <div
                      className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <span>{cp.issuer}</span>
                      {cp.accountMask && (
                        <>
                          <span>&middot;</span>
                          <span>&middot;&middot;&middot;&middot; {cp.accountMask}</span>
                        </>
                      )}
                      <span>&middot;</span>
                      <span>
                        {cp.annualFee > 0 ? `$${cp.annualFee}/yr` : "$0 fee"}
                      </span>
                    </div>
                  </div>
                  <RemoveCardButton cardProfileId={cp.id} cardName={cp.name} />
                </div>

                {/* Row 2: Card type + Anniversary editors (stacked) */}
                <div className="mt-3 flex flex-col gap-1.5">
                  <CardTypeEditor
                    cardProfileId={cp.id}
                    currentCardType={cp.cardType}
                    currentCardName={cp.name}
                    allCardTypes={allCardTypes}
                  />
                  <AnniversaryEditor
                    cardProfileId={cp.id}
                    currentDate={cp.anniversaryDate?.toISOString() ?? null}
                    source={cp.anniversarySource}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Linked Accounts */}
      <section className="mt-10">
        <h2
          className="mb-4 text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Linked Accounts
        </h2>

        <div
          className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
          style={{ position: "relative" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(96,165,250,0.15), transparent)",
            }}
          />

          {connections.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Link2
                size={28}
                strokeWidth={1.5}
                className="mx-auto mb-3 text-[var(--text-dim)]"
              />
              <p className="text-sm text-[var(--text-secondary)]">
                No bank accounts linked yet.
              </p>
            </div>
          ) : (
            connections.map((conn, i) => (
              <div
                key={conn.id}
                className={`grid items-center gap-3 px-5 py-4 transition-colors hover:bg-[var(--bg-card-hover)] ${
                  i < connections.length - 1
                    ? "border-b border-[var(--border-subtle)]"
                    : ""
                }`}
                style={{ gridTemplateColumns: "1fr auto auto" }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {conn.institutionName}
                  </div>
                  <div
                    className="mt-0.5 text-[11px] text-[var(--text-secondary)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {conn.lastSyncedAt
                      ? `Synced ${new Date(conn.lastSyncedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
                      : "Never synced"}
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    ...(conn.status === "active"
                      ? {
                          color: "var(--color-success)",
                          background: "rgba(52,211,153,0.08)",
                          border: "1px solid rgba(52,211,153,0.15)",
                        }
                      : conn.status === "needs_reauth"
                        ? {
                            color: "var(--color-accent-amber)",
                            background: "rgba(251,191,36,0.08)",
                            border: "1px solid rgba(251,191,36,0.15)",
                          }
                        : {
                            color: "var(--color-danger)",
                            background: "rgba(248,113,113,0.08)",
                            border: "1px solid rgba(248,113,113,0.15)",
                          }),
                  }}
                >
                  {conn.status === "active"
                    ? "ACTIVE"
                    : conn.status === "needs_reauth"
                      ? "REAUTH"
                      : "DISCONNECTED"}
                </span>

                {conn.status === "needs_reauth" && (
                  <ReauthButton
                    connectionId={conn.id}
                    label="Fix"
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold text-[var(--color-accent-cyan)] transition-colors hover:bg-[rgba(34,211,238,0.08)]"
                  />
                )}

                <UnlinkButton
                  connectionId={conn.id}
                  institutionName={conn.institutionName}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Account */}
      <section className="mt-10">
        <h2
          className="mb-4 text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Account
        </h2>

        <div
          className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
          style={{ position: "relative" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
            }}
          />

          {/* Email row */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-[10px]"
                style={{
                  width: 36,
                  height: 36,
                  background: "rgba(34,211,238,0.06)",
                  border: "1px solid rgba(34,211,238,0.12)",
                }}
              >
                <User size={18} strokeWidth={1.75} style={{ color: "var(--color-accent-cyan)" }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Email
                </div>
                <div
                  className="text-[11px] text-[var(--text-secondary)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Sign out row */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-[10px]"
                style={{
                  width: 36,
                  height: 36,
                  background: "rgba(248,113,113,0.06)",
                  border: "1px solid rgba(248,113,113,0.12)",
                }}
              >
                <LogOut size={18} strokeWidth={1.75} style={{ color: "var(--color-danger)" }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Sign out
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  End your current session
                </div>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <Link
          href="/privacy"
          className="text-[11px] text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Privacy
        </Link>
        <span className="text-[var(--text-dim)]">&middot;</span>
        <Link
          href="/terms"
          className="text-[11px] text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Terms
        </Link>
        <span className="text-[var(--text-dim)]">&middot;</span>
        <Link
          href="/security"
          className="text-[11px] text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Security
        </Link>
      </div>
    </div>
  );
}
