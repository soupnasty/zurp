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
  { href: "/benefits", label: "Card Value", icon: CircleDollarSign },
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
              <svg width="28" height="20" viewBox="0 0 46 36" fill="none">
                <rect x="2" y="2" width="42" height="30" rx="5" fill="#0a0e17" stroke="#22d3ee" strokeWidth="1.5"/>
                <clipPath id="nav-t">
                  <rect x="8" y="9" width="30" height="6" rx="3"/>
                </clipPath>
                <g clipPath="url(#nav-t)">
                  <rect x="8" y="9" width="18" height="6" fill="#60a5fa"/>
                  <rect x="26" y="9" width="6.5" height="6" fill="#a78bfa"/>
                  <rect x="32.5" y="9" width="5.5" height="6" fill="#f87171"/>
                </g>
                <clipPath id="nav-b">
                  <rect x="8" y="19" width="30" height="6" rx="3"/>
                </clipPath>
                <g clipPath="url(#nav-b)">
                  <rect x="8" y="19" width="5.5" height="6" fill="#f87171" opacity="0.5"/>
                  <rect x="13.5" y="19" width="6.5" height="6" fill="#a78bfa" opacity="0.5"/>
                  <rect x="20" y="19" width="18" height="6" fill="#60a5fa" opacity="0.5"/>
                </g>
              </svg>
              <span className="font-[var(--font-space-mono)] text-[15px] font-bold tracking-normal text-[var(--text-primary)]">
                zurp
              </span>
            </Link>
          )}
          {collapsed && (
            <svg width="28" height="20" viewBox="0 0 46 36" fill="none" className="mx-auto">
              <rect x="2" y="2" width="42" height="30" rx="5" fill="#0a0e17" stroke="#22d3ee" strokeWidth="1.5"/>
              <clipPath id="nav-ct">
                <rect x="8" y="9" width="30" height="6" rx="3"/>
              </clipPath>
              <g clipPath="url(#nav-ct)">
                <rect x="8" y="9" width="18" height="6" fill="#60a5fa"/>
                <rect x="26" y="9" width="6.5" height="6" fill="#a78bfa"/>
                <rect x="32.5" y="9" width="5.5" height="6" fill="#f87171"/>
              </g>
              <clipPath id="nav-cb">
                <rect x="8" y="19" width="30" height="6" rx="3"/>
              </clipPath>
              <g clipPath="url(#nav-cb)">
                <rect x="8" y="19" width="5.5" height="6" fill="#f87171" opacity="0.5"/>
                <rect x="13.5" y="19" width="6.5" height="6" fill="#a78bfa" opacity="0.5"/>
                <rect x="20" y="19" width="18" height="6" fill="#60a5fa" opacity="0.5"/>
              </g>
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
