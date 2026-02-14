"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  Lightbulb,
  RefreshCw,
  Check,
} from "lucide-react";
import type { ReactNode } from "react";
import { CardSelectorDropdown } from "./CardSelectorDropdown";

type Tab = "compare" | "track" | "insights";

export interface DashboardNavProps {
  hasNewInsights: boolean;
  cardProfiles: Array<{
    id: string;
    cardType: string;
    name: string;
    annualFee: number;
    connectionId: string | null;
    connectionStatus: string | null;
    lastSyncedAt: string | null;
  }>;
}

interface AppShellProps {
  children: ReactNode;
  userEmail?: string;
  dashboardNav?: DashboardNavProps;
}

const dashboardTabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "compare", label: "Compare", icon: BarChart3 },
  { id: "track", label: "Track", icon: Target },
  { id: "insights", label: "Insights", icon: Lightbulb },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function LogoSvg({ id }: { id: string }) {
  return (
    <svg width="28" height="20" viewBox="0 0 46 36" fill="none">
      <rect x="2" y="2" width="42" height="30" rx="5" fill="#0a0e17" stroke="#22d3ee" strokeWidth="1.5"/>
      <clipPath id={`${id}-t`}>
        <rect x="8" y="9" width="30" height="6" rx="3"/>
      </clipPath>
      <g clipPath={`url(#${id}-t)`}>
        <rect x="8" y="9" width="18" height="6" fill="#60a5fa"/>
        <rect x="26" y="9" width="6.5" height="6" fill="#a78bfa"/>
        <rect x="32.5" y="9" width="5.5" height="6" fill="#f87171"/>
      </g>
      <clipPath id={`${id}-b`}>
        <rect x="8" y="19" width="30" height="6" rx="3"/>
      </clipPath>
      <g clipPath={`url(#${id}-b)`}>
        <rect x="8" y="19" width="5.5" height="6" fill="#f87171" opacity="0.5"/>
        <rect x="13.5" y="19" width="6.5" height="6" fill="#a78bfa" opacity="0.5"/>
        <rect x="20" y="19" width="18" height="6" fill="#60a5fa" opacity="0.5"/>
      </g>
    </svg>
  );
}

export function AppShell({ children, userEmail, dashboardNav }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const hasDashboardNav = !!dashboardNav;
  const isSettings = pathname.startsWith("/settings");

  // Derive active tab from pathname
  const activeTab: Tab | null = pathname.startsWith("/dashboard/track")
    ? "track"
    : pathname.startsWith("/dashboard/insights")
      ? "insights"
      : pathname.startsWith("/dashboard")
        ? "compare"
        : null;

  // Preserve ?card= param across tab navigation
  const cardParam = searchParams.get("card");
  const cardSuffix = cardParam ? `?card=${cardParam}` : "";

  // Derive sync info from active card's connection
  const activeCardId = cardParam ?? dashboardNav?.cardProfiles[0]?.id ?? null;
  const activeProfile = dashboardNav?.cardProfiles.find((c) => c.id === activeCardId) ?? dashboardNav?.cardProfiles[0];
  const connectionId = activeProfile?.connectionId ?? null;
  const lastSyncedAt = activeProfile?.lastSyncedAt ?? null;

  async function handleSync() {
    if (!connectionId || syncing) return;
    setSyncing(true);
    setSynced(false);
    try {
      const res = await fetch("/api/plaid/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      if (res.ok) {
        setSynced(true);
        router.refresh();
        setTimeout(() => setSynced(false), 3000);
      }
    } catch {
      // Silently fail
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="app-zoom flex overflow-x-hidden">
      {/* Sidebar — desktop only */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 z-40 app-zoom-sidebar flex-col border-r border-[var(--border-default)] bg-[var(--bg-secondary)] transition-all duration-[var(--duration-default)] ease-[var(--ease-default)] ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-[var(--border-default)] px-4">
          {!collapsed ? (
            <Link href="/dashboard/compare" className="flex items-center gap-2">
              <LogoSvg id="nav" />
              <span
                className="text-[15px] font-bold tracking-normal text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                zurp
              </span>
            </Link>
          ) : (
            <Link href="/dashboard/compare" className="mx-auto">
              <LogoSvg id="nav-c" />
            </Link>
          )}
        </div>

        {hasDashboardNav && (
          <>
            {/* Card selector + sync */}
            {dashboardNav.cardProfiles.length > 0 && (
              <div className="px-2 pt-4 pb-3">
                {!collapsed && (
                  <div className="mb-2 px-3">
                    <span
                      className="text-[9px] font-bold uppercase tracking-[2.5px] text-[var(--text-secondary)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      CARDS
                    </span>
                  </div>
                )}
                <CardSelectorDropdown
                  cardProfiles={dashboardNav.cardProfiles}
                  collapsed={collapsed}
                />
                {/* Sync status — under card selector */}
                {connectionId && !collapsed && (
                  <div className="flex items-center gap-2 px-3 pt-2">
                    {synced ? (
                      <>
                        <Check size={12} strokeWidth={2} className="shrink-0 text-[var(--color-success)]" />
                        <span
                          className="text-[11px] text-[var(--text-secondary)]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Updated just now
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          className="flex-1 truncate text-[11px] text-[var(--text-secondary)]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {lastSyncedAt
                            ? relativeTime(lastSyncedAt)
                            : "Never synced"}
                        </span>
                        <button
                          onClick={handleSync}
                          disabled={syncing}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent-cyan)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          <RefreshCw size={11} strokeWidth={2} className={syncing ? "animate-spin" : ""} />
                          {syncing ? "..." : "Sync"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mx-3 border-t border-[var(--border-default)]" />

            {/* Tab navigation */}
            <nav className="px-2 py-3">
              <ul className="space-y-1">
                {dashboardTabs.map(({ id, label, icon: Icon }) => {
                  const active = !isSettings && activeTab === id;
                  return (
                    <li key={id}>
                      <Link
                        href={`/dashboard/${id}${cardSuffix}`}
                        className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[14px] font-medium transition-colors duration-[var(--duration-fast)] ${
                          active
                            ? "bg-[rgba(34,211,238,0.1)] text-[var(--color-accent-cyan)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? label : undefined}
                      >
                        <span className="relative">
                          <Icon size={20} strokeWidth={1.75} />
                          {id === "insights" && dashboardNav.hasNewInsights && (
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                          )}
                        </span>
                        {!collapsed && <span>{label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mx-3 border-t border-[var(--border-default)]" />

            {/* Settings link */}
            <div className="px-2 py-3">
              <Link
                href="/settings"
                className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[14px] font-medium transition-colors duration-[var(--duration-fast)] ${
                  isSettings
                    ? "bg-[rgba(34,211,238,0.1)] text-[var(--color-accent-cyan)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? "Settings" : undefined}
              >
                <Settings size={20} strokeWidth={1.75} />
                {!collapsed && <span>Settings</span>}
              </Link>
            </div>

            <div className="flex-1" />
          </>
        )}

        {!hasDashboardNav && (
          /* Fallback: no dashboard nav (shouldn't happen normally) */
          <div className="flex-1" />
        )}

        {/* Bottom section */}
        <div className="space-y-1 border-t border-[var(--border-default)] px-2 py-3">
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[14px] text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={20} strokeWidth={1.75} />
            ) : (
              <ChevronLeft size={20} strokeWidth={1.75} />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* User email */}
          {userEmail && !collapsed && (
            <div className="truncate px-3 py-1.5 text-[12px] text-[var(--text-secondary)]">
              {userEmail}
            </div>
          )}
        </div>
      </aside>

      {/* Bottom nav — mobile only */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-2 py-2 md:hidden">
        {hasDashboardNav ? (
          <>
            {dashboardTabs.map(({ id, label, icon: Icon }) => {
              const active = !isSettings && activeTab === id;
              return (
                <Link
                  key={id}
                  href={`/dashboard/${id}${cardSuffix}`}
                  className={`flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[10px] font-medium transition-colors duration-[var(--duration-fast)] ${
                    active
                      ? "text-[var(--color-accent-cyan)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="relative">
                    <Icon size={20} strokeWidth={1.75} />
                    {id === "insights" && dashboardNav.hasNewInsights && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                    )}
                  </span>
                  <span>{label}</span>
                </Link>
              );
            })}
            <Link
              href="/settings"
              className={`flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[10px] font-medium transition-colors duration-[var(--duration-fast)] ${
                isSettings
                  ? "text-[var(--color-accent-cyan)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Settings size={20} strokeWidth={1.75} />
              <span>Settings</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/dashboard/compare"
              className="flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--text-primary)]"
            >
              <BarChart3 size={20} strokeWidth={1.75} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/settings"
              className={`flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[10px] font-medium transition-colors duration-[var(--duration-fast)] ${
                isSettings
                  ? "text-[var(--color-accent-cyan)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Settings size={20} strokeWidth={1.75} />
              <span>Settings</span>
            </Link>
          </>
        )}
      </nav>

      {/* Main content */}
      <main
        className={`ml-0 min-w-0 flex-1 overflow-x-hidden pb-16 transition-all duration-[var(--duration-default)] ease-[var(--ease-default)] md:pb-0 ${
          collapsed ? "md:ml-16" : "md:ml-56"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
