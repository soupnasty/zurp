"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  Scale,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  userEmail?: string;
}

const navItems = [
  { href: "/benefits", label: "Benefits", icon: CircleDollarSign },
  { href: "/spending", label: "Spending", icon: Wallet },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, userEmail }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Sidebar — desktop only */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col border-r border-[var(--border-default)] bg-[var(--bg-secondary)] transition-all duration-[var(--duration-default)] ease-[var(--ease-default)] ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-[var(--border-default)] px-4">
          {!collapsed && (
            <Link href="/benefits" className="flex items-center gap-2">
              <svg width="24" height="16" viewBox="0 0 50 34" fill="none">
                <rect
                  x="0"
                  y="0"
                  width="50"
                  height="34"
                  rx="5"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  opacity="0.55"
                />
                <line
                  x1="0"
                  y1="12"
                  x2="50"
                  y2="12"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  opacity="0.3"
                />
                <circle cx="12" cy="24" r="2.5" fill="var(--accent)" />
                <circle
                  cx="21"
                  cy="24"
                  r="2.5"
                  fill="var(--accent)"
                  opacity="0.55"
                />
                <circle
                  cx="30"
                  cy="24"
                  r="2.5"
                  fill="var(--accent)"
                  opacity="0.2"
                />
              </svg>
              <span className="text-h3 font-semibold tracking-tight text-[var(--text-primary)]">
                zurp
              </span>
            </Link>
          )}
          {collapsed && (
            <svg width="24" height="16" viewBox="0 0 50 34" fill="none" className="mx-auto">
              <rect
                x="0"
                y="0"
                width="50"
                height="34"
                rx="5"
                stroke="var(--accent)"
                strokeWidth="3"
                opacity="0.55"
              />
              <circle cx="12" cy="24" r="2.5" fill="var(--accent)" />
              <circle cx="21" cy="24" r="2.5" fill="var(--accent)" opacity="0.55" />
              <circle cx="30" cy="24" r="2.5" fill="var(--accent)" opacity="0.2" />
            </svg>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-body)] font-medium transition-colors duration-[var(--duration-fast)] ${
                      active
                        ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? label : undefined}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-[var(--border-default)] px-2 py-3 space-y-1">
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-body)] text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] ${
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
            <div className="px-3 py-1.5 truncate text-[var(--text-caption)] text-[var(--text-secondary)]">
              {userEmail}
            </div>
          )}
        </div>
      </aside>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex md:hidden items-center justify-around border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-3 py-1.5 text-[10px] font-medium transition-colors duration-[var(--duration-fast)] ${
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main
        className={`min-w-0 flex-1 overflow-x-hidden pb-16 md:pb-0 transition-all duration-[var(--duration-default)] ease-[var(--ease-default)] ml-0 ${
          collapsed ? "md:ml-16" : "md:ml-56"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
