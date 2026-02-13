"use client";

import { Clock } from "lucide-react";
import type { UpcomingReset } from "./types";

interface UpcomingResetsProps {
  resets: UpcomingReset[];
}

export function UpcomingResets({ resets }: UpcomingResetsProps) {
  if (resets.length === 0) return null;

  return (
    <div className="mt-8">
      <div
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden"
        style={{ position: "relative" }}
      >
        {/* Top edge glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.2), transparent)",
          }}
        />

        <div className="p-6 pb-2">
          <h3
            className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--text-secondary)] mb-4"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            UPCOMING RESETS
          </h3>
        </div>

        {resets.map((reset) => (
          <div
            key={reset.id}
            className="flex items-center gap-3 px-6 py-3 border-t border-[var(--border-subtle)]"
          >
            {/* Clock icon */}
            <div
              className="flex items-center justify-center rounded-lg shrink-0"
              style={{
                width: 28,
                height: 28,
                background: "rgba(251,191,36,0.08)",
              }}
            >
              <Clock size={14} strokeWidth={2} style={{ color: "var(--color-accent-amber)" }} />
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-[var(--text-primary)] truncate block">
                {reset.name}
              </span>
            </div>

            {/* Amount + days */}
            <div className="text-right shrink-0">
              <span
                className="text-[13px] font-bold"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-amber)" }}
              >
                ${Math.round(reset.totalRemaining)}
              </span>
              <span className="block text-[11px] text-[var(--text-secondary)]">
                {reset.daysRemaining} days left
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
