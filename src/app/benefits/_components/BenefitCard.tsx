"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BenefitDetailModal } from "./BenefitDetailModal";
import { BenefitIcon } from "@/components/ui/BenefitIcon";
import type { BenefitGroup } from "../page";

export function BenefitCard({ group }: { group: BenefitGroup }) {
  const [modalOpen, setModalOpen] = useState(false);

  const used = group.totalUsed;
  const remaining = Math.max(0, group.totalRemaining);

  const cycleLabel = getCycleLabel(group.cycle);
  const cycleExpiry = formatCycleExpiry(group.cycle, group.cycleEnd);
  const isGrouped = group.benefits.length > 1;

  return (
    <>
      <Card hover onClick={() => setModalOpen(true)} className={group.isFullyUsed ? "opacity-50" : ""}>
        <div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)]/10">
                <BenefitIcon icon={group.icon} size={20} />
              </div>
              <div>
                <h3 className="text-[var(--text-body)] font-semibold text-[var(--text-primary)]">
                  {group.name}
                </h3>
                <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                  {cycleLabel}
                </p>
              </div>
            </div>

            <span className="rounded-[var(--radius-md)] border border-[var(--accent)]/30 px-2.5 py-1 text-[var(--text-caption)] font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10">
              view
            </span>
          </div>

          {group.type === "credit" && (
            <>
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-data text-h3 font-semibold text-[var(--accent)]">
                    ${used.toFixed(0)}
                  </span>
                  <span className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                    of ${group.totalCredit.toFixed(0)}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={used} max={group.totalCredit} />
                </div>
              </div>

              {/* Sub-credit breakdown for grouped benefits (e.g. DoorDash) */}
              {isGrouped && (
                <div className="mt-3 space-y-1 border-t border-[var(--border-default)] pt-3">
                  {group.benefits.map((b) => {
                    const subRemaining = Math.max(0, b.amountRemaining);
                    const subUsed = b.creditAmount - subRemaining;
                    return (
                      <div
                        key={b.benefitId}
                        className="flex items-center justify-between text-[var(--text-caption)]"
                      >
                        <span className="truncate mr-2 text-[var(--text-secondary)]">
                          {b.benefitName}
                        </span>
                        <span className="font-data shrink-0 text-[var(--text-secondary)]">
                          ${subUsed.toFixed(0)}/{b.creditAmount.toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-[var(--text-caption)]">
                <span className="text-[var(--text-secondary)]">
                  ${remaining.toFixed(0)} remaining
                </span>
                {group.daysRemaining <= 30 && (
                  <span
                    className={
                      group.daysRemaining <= 7
                        ? "text-[var(--color-danger)]"
                        : group.daysRemaining <= 14
                          ? "text-[var(--color-warning)]"
                          : "text-[var(--text-secondary)]"
                    }
                  >
                    {group.daysRemaining}d left
                  </span>
                )}
              </div>

              {group.ytdUsed != null && (
                <div className="mt-2 text-[var(--text-caption)] text-[var(--text-secondary)]">
                  <span className={`font-data ${group.ytdUsed > 0 ? "text-[var(--color-success)]" : "text-[var(--text-secondary)]"}`}>
                    ${group.ytdUsed.toFixed(0)}
                  </span>{" "}
                  captured this year
                </div>
              )}
            </>
          )}

          {cycleExpiry ? (
            <p className="mt-2 text-[var(--text-caption)] text-[var(--text-secondary)]">
              {cycleExpiry}
            </p>
          ) : group.sunsetDate ? (
            <p className="mt-2 text-[var(--text-caption)] text-[var(--text-secondary)]">
              Expires {formatSunsetDate(group.sunsetDate!)}
            </p>
          ) : null}

        </div>
      </Card>

      <BenefitDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        group={group}
      />
    </>
  );
}

function formatCycleExpiry(cycle: string, endIso: string): string | null {
  if (cycle === "subscription") return null;

  const end = new Date(endIso);
  const month = end.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const prefix = cycle === "monthly" ? "Resets" : "Expires";
  return `${prefix} ${month} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
}

function formatSunsetDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function getCycleLabel(cycle: string): string {
  switch (cycle) {
    case "monthly":
      return "Monthly";
    case "biannual_h1":
      return "Jan \u2013 Jun";
    case "biannual_h2":
      return "Jul \u2013 Dec";
    case "annual_calendar":
      return "Annual";
    case "annual_anniversary":
      return "Anniversary year";
    case "quadrennial":
      return "Every 4 years";
    case "subscription":
      return "Subscription";
    default:
      return cycle;
  }
}
