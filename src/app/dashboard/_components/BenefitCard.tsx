"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BenefitDetailModal } from "./BenefitDetailModal";
import {
  Plane,
  Building,
  UtensilsCrossed,
  Ticket,
  Bike,
  Car,
  Dumbbell,
  ShieldCheck,
  Tv,
  Music,
  CreditCard,
} from "lucide-react";
import type { BenefitGroup } from "../page";

const iconMap: Record<string, any> = {
  Plane,
  Building,
  UtensilsCrossed,
  Ticket,
  Bike,
  Car,
  Dumbbell,
  ShieldCheck,
  Tv,
  Music,
};

export function BenefitCard({ group }: { group: BenefitGroup }) {
  const [modalOpen, setModalOpen] = useState(false);
  const Icon = iconMap[group.icon] || CreditCard;
  const percent =
    group.totalCredit > 0
      ? (group.totalUsed / group.totalCredit) * 100
      : 0;

  const cycleLabel = getCycleLabel(group.cycle);
  const cycleExpiry = formatCycleExpiry(group.cycle, group.cycleEnd);

  return (
    <>
      <Card hover>
        <div onClick={() => setModalOpen(true)} className="cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)]/10">
                <Icon size={20} strokeWidth={1.75} className="text-[var(--accent)]" />
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

            {group.isFullyUsed ? (
              <Badge variant="success">Used</Badge>
            ) : group.requiresActivation ? (
              <Badge variant="info">Activate</Badge>
            ) : group.type === "subscription" ? (
              <Badge variant="neutral">Sub</Badge>
            ) : null}
          </div>

          {group.type === "credit" && (
            <>
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-data text-h3 font-semibold text-[var(--accent)]">
                    ${Math.min(group.totalUsed, group.totalCredit).toFixed(0)}
                  </span>
                  <span className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                    of ${group.totalCredit.toFixed(0)}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={group.totalUsed} max={group.totalCredit} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[var(--text-caption)]">
                <span className="text-[var(--text-secondary)]">
                  ${Math.max(0, group.totalRemaining).toFixed(0)} remaining
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
            </>
          )}

          {group.sunsetDate ? (
            <p className="mt-2 text-[var(--text-caption)] text-[var(--text-secondary)]">
              Expires {group.sunsetDate}
            </p>
          ) : cycleExpiry ? (
            <p className="mt-2 text-[var(--text-caption)] text-[var(--text-secondary)]">
              {cycleExpiry}
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
  return `Expires ${month} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
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
