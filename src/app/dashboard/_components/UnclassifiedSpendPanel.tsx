"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EARN_CATEGORY_LABELS } from "@/lib/points/category-labels";
import type { EarnCategory } from "@/lib/points/types";
import type { UnclassifiedMerchant } from "@/lib/points/overrides";

interface UnclassifiedSpendPanelProps {
  merchants: UnclassifiedMerchant[];
}

const CATEGORY_OPTIONS = (
  Object.entries(EARN_CATEGORY_LABELS) as [EarnCategory, string][]
)
  .filter(([key]) => key !== "other")
  .sort((a, b) => a[1].localeCompare(b[1]));

export function UnclassifiedSpendPanel({ merchants }: UnclassifiedSpendPanelProps) {
  const router = useRouter();
  const [savingMerchant, setSavingMerchant] = useState<string | null>(null);
  const [savedMerchants, setSavedMerchants] = useState<Set<string>>(new Set());

  if (merchants.length === 0) return null;

  async function reclassify(merchant: string, category: string) {
    setSavingMerchant(merchant);
    try {
      const res = await fetch("/api/transactions/reclassify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant, category }),
      });
      if (res.ok) {
        setSavedMerchants((prev) => new Set(prev).add(merchant));
        router.refresh();
      }
    } finally {
      setSavingMerchant(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between mb-1">
        <h2
          className="text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Unclassified spend
        </h2>
      </div>
      <p className="mb-3 text-[13px] text-[var(--text-secondary)]">
        These merchants only earn base rate in the simulation. Tell us what
        they are and every card&apos;s numbers get sharper.
      </p>

      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        {merchants.map((m, i) => {
          const isSaving = savingMerchant === m.merchant;
          const isSaved = savedMerchants.has(m.merchant);
          return (
            <div
              key={m.merchant}
              className={`flex items-center gap-3 px-3 py-2.5 md:px-4 ${
                i < merchants.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
              }`}
              style={{ opacity: isSaved ? 0.45 : 1, transition: "opacity 0.3s ease" }}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {m.displayName}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-dim)",
                  }}
                >
                  {m.count} txn{m.count === 1 ? "" : "s"}
                </div>
              </div>
              <span
                className="shrink-0"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--color-accent-blue)",
                }}
              >
                ${Math.round(m.spend).toLocaleString()}
              </span>
              {isSaved ? (
                <span
                  className="shrink-0"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--color-success)",
                  }}
                >
                  Saved
                </span>
              ) : (
                <select
                  className="shrink-0 rounded-lg px-2 py-1.5 text-xs"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-medium)",
                    color: "var(--text-secondary)",
                    cursor: isSaving ? "wait" : "pointer",
                  }}
                  disabled={isSaving}
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) reclassify(m.merchant, e.target.value);
                  }}
                >
                  <option value="" disabled>
                    {isSaving ? "Saving…" : "Categorize…"}
                  </option>
                  {CATEGORY_OPTIONS.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                  <option value="other">Not bonus-eligible</option>
                </select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
