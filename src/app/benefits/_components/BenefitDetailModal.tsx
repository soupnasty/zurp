"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink } from "lucide-react";
import { BenefitIcon } from "@/components/ui/BenefitIcon";
import type { BenefitGroup } from "../page";

function formatCycleEnd(endIso: string): string {
  const end = new Date(endIso);
  const month = end.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${month} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
}

function formatSunsetDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    options.push({ value: `${mm}-${yyyy}`, label });
  }
  return options;
}

interface BenefitDetailModalProps {
  open: boolean;
  onClose: () => void;
  group: BenefitGroup;
  readOnly?: boolean;
}

export function BenefitDetailModal({
  open,
  onClose,
  group,
  readOnly = false,
}: BenefitDetailModalProps) {
  const details = group.details;
  const matchedTransactions = group.benefitTransactions;
  const isCredit = group.type === "credit";
  const isSubscription = group.type === "subscription";
  const used = group.totalUsed;
  const remaining = Math.max(0, group.totalRemaining);
  const isGrouped = group.benefits.length > 1;

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${mm}-${now.getFullYear()}`;
  });

  const benefitId = group.benefits[0]?.benefitId ?? group.id;

  async function handleActivate() {
    const res = await fetch("/api/benefits/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benefitId, activatedMonth: selectedMonth }),
    });
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  }

  async function handleDeactivate() {
    const res = await fetch("/api/benefits/activate", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benefitId }),
    });
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  }

  const iconElement = (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)]/10">
      <BenefitIcon icon={group.icon} brandSlug={group.brandSlug} size={20} />
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={group.name} icon={iconElement}>
      {/* Status badges */}
      <div className="mb-[var(--space-md)] flex flex-wrap gap-2">
        {group.isFullyUsed && <Badge variant="success">Used</Badge>}
        {isSubscription && group.isActivated && (
          <Badge variant="success">Activated</Badge>
        )}
        {isSubscription && !group.isActivated && (
          <Badge variant="warning">Needs Activation</Badge>
        )}
        {!isSubscription && group.requiresActivation && (
          <Badge variant="info">Activation Required</Badge>
        )}
        {isSubscription && (
          <Badge variant="neutral">Subscription</Badge>
        )}
        {group.cycle === "monthly" && (
          <Badge variant="neutral">Monthly</Badge>
        )}
        {isCredit && group.cycle === "monthly" ? (
          <Badge variant="info">
            Resets {formatCycleEnd(group.cycleEnd)}
          </Badge>
        ) : group.sunsetDate ? (
          <Badge variant="warning">
            Expires {formatSunsetDate(group.sunsetDate)}
          </Badge>
        ) : null}
      </div>

      {/* Usage stats for credit-type benefits */}
      {isCredit && (
        <div className="mb-[var(--space-lg)] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] p-[var(--space-md)]">
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
          <div className="mt-2 flex items-center justify-between text-[var(--text-caption)]">
            <span className="text-[var(--text-secondary)]">
              ${remaining.toFixed(0)} remaining
            </span>
            <span className="text-[var(--text-secondary)]">
              {group.daysRemaining}d left in cycle
            </span>
          </div>

          {/* Sub-credit breakdown for grouped benefits */}
          {isGrouped && (
            <div className="mt-3 space-y-1.5 border-t border-[var(--border-default)] pt-3">
              {group.benefits.map((b) => {
                const subRemaining = Math.max(0, b.amountRemaining);
                const subUsed = b.creditAmount - subRemaining;
                return (
                  <div
                    key={b.benefitId}
                    className="flex items-center justify-between text-[var(--text-caption)]"
                  >
                    <span className="text-[var(--text-secondary)]">
                      {b.benefitName}
                    </span>
                    <span className="font-data text-[var(--text-secondary)]">
                      ${subUsed.toFixed(0)} / ${b.creditAmount.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Subscription activation panel */}
      {isSubscription && !readOnly && (
        <div className="mb-[var(--space-lg)] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] p-[var(--space-md)]">
          <div className="flex items-baseline justify-between">
            <span className="font-data text-h3 font-semibold text-[var(--accent)]">
              ${group.totalCredit.toFixed(2)}
            </span>
            <span className="text-[var(--text-caption)] text-[var(--text-secondary)]">
              per month
            </span>
          </div>

          {group.isActivated && group.activatedAt ? (
            <div className="mt-3">
              <p className="text-[var(--text-body)] text-[var(--text-secondary)]">
                Activated since{" "}
                {new Date(group.activatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </p>
              <button
                onClick={handleDeactivate}
                disabled={isPending}
                className="mt-2 text-[var(--text-caption)] text-[var(--text-muted)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--text-secondary)] disabled:opacity-50"
              >
                {isPending ? "Updating..." : "Deactivate"}
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <p className="mb-2 text-[var(--text-body)] text-[var(--text-secondary)]">
                When did you activate through Chase?
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-1.5 text-[var(--text-body)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                >
                  {getMonthOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleActivate}
                  disabled={isPending}
                  className="rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-[var(--text-body)] font-medium text-[var(--color-void)] transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Mark as Activated"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="mb-[var(--space-md)]">
        <p className="text-[var(--text-body)] leading-relaxed text-[var(--text-primary)]">
          {details?.description ?? group.benefits[0]?.benefitName}
        </p>
      </div>

      {/* How to use */}
      {details?.howToUse && details.howToUse.length > 0 && (
        <div className="mb-[var(--space-md)]">
          <h3 className="label-caps mb-[var(--space-sm)]">How to Use</h3>
          <ol className="list-none space-y-2">
            {details.howToUse.map((step, i) => (
              <li
                key={i}
                className="flex gap-3 text-[var(--text-body)] text-[var(--text-primary)]"
              >
                <span className="font-data flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--text-caption)] font-semibold text-[var(--accent)]">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Links */}
      {details?.links && details.links.length > 0 && (
        <div>
          <h3 className="label-caps mb-[var(--space-sm)]">Links</h3>
          <div className="space-y-1.5">
            {details.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--text-body)] text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10"
              >
                <ExternalLink size={14} className="shrink-0" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Estimated note for simulated mode */}
      {readOnly && (
        <p className="mt-[var(--space-sm)] text-[var(--text-caption)] text-[var(--text-secondary)] italic">
          Estimated from your spending history
        </p>
      )}

      {/* Matched transactions */}
      {!readOnly && matchedTransactions.length > 0 && (
        <div className="mt-[var(--space-md)] border-t border-[var(--border-default)] pt-[var(--space-md)]">
          <h3 className="label-caps mb-[var(--space-sm)]">
            Matched Transactions
            <span className="ml-1.5 font-data text-[var(--text-secondary)]">
              ({matchedTransactions.length})
            </span>
          </h3>
          <div className="space-y-1">
            {matchedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--text-body)]"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[var(--text-primary)] truncate block">
                    {tx.merchantName || "Unknown"}
                  </span>
                  <span className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                    {new Date(tx.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {" "}
                    <span className="text-[var(--text-muted)]">
                      ({tx.periodKey})
                    </span>
                  </span>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <span className="font-data text-[var(--text-primary)]">
                    ${tx.amount.toFixed(2)}
                  </span>
                  <span className="font-data text-[length:var(--text-caption)] text-[color:var(--color-success)] block">
                    ${tx.creditApplied.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[var(--border-default)] pt-2 text-[var(--text-caption)]">
            <span className="text-[var(--text-secondary)]">Total credit applied</span>
            <span className="font-data font-semibold text-[var(--color-success)]">
              ${matchedTransactions.reduce((sum, tx) => sum + tx.creditApplied, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
