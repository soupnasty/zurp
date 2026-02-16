"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import type { ValuationMode } from "@/lib/points/types";

interface ValuationToggleProps {
  mode: ValuationMode;
  onChange: (mode: ValuationMode) => void;
}

const OPTIONS: {
  value: ValuationMode;
  label: string;
  sub: string;
}[] = [
  { value: "conservative", label: "Cash Value", sub: "face value" },
  { value: "realistic", label: "Avg Redemption", sub: "typical value" },
  { value: "upside", label: "Best Transfer", sub: "optimal value" },
];

export function ValuationToggle({ mode, onChange }: ValuationToggleProps) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span
          className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Points mode
        </span>
        <div
          className="relative"
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
        >
          <Info
            size={12}
            strokeWidth={2}
            className="cursor-help text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
          />
          {showTip && (
            <div
              className="absolute left-1/2 bottom-full z-50 mb-2 w-[280px] -translate-x-1/2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-3 shadow-lg"
            >
              <p className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--text-secondary)] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                How points are valued
              </p>
              <div className="space-y-2 text-[11px] text-[var(--text-secondary)]">
                <p><span className="font-semibold text-[var(--text-primary)]">Cash Value</span> — Face value redemption. Good for cash back redeemers or portal bookers.</p>
                <p><span className="font-semibold text-[var(--text-primary)]">Avg Redemption</span> — Typical redemption value across common uses. Good for most people who mix portal bookings and occasional transfers.</p>
                <p><span className="font-semibold text-[var(--text-primary)]">Best Transfer</span> — Optimal value via airline/hotel transfer partners. Good for regular transfers to international business/first class.</p>
              </div>
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[var(--bg-elevated)]" />
            </div>
          )}
        </div>
      </div>
      <div
        className="flex w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1"
      >
        {OPTIONS.map((opt) => {
          const active = mode === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="relative flex-1 rounded-lg px-3 py-1.5 transition-all duration-200"
              style={{
                background: active ? "rgba(96,165,250,0.08)" : "transparent",
                border: active
                  ? "1px solid rgba(96,165,250,0.15)"
                  : "1px solid transparent",
              }}
            >
              <span
                className="block text-[11px] font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: active
                    ? "var(--color-accent-blue)"
                    : "var(--text-secondary)",
                }}
              >
                {opt.label}
              </span>
              <span
                className="block text-[9px] mt-0.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  color: active
                    ? "rgba(96,165,250,0.6)"
                    : "var(--text-dim)",
                }}
              >
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
