"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, Check, Undo2 } from "lucide-react";
import { BenefitIcon } from "@/components/ui/BenefitIcon";
import { useToast } from "@/components/ui/ToastProvider";
import type { TransactionWithMatch } from "@/lib/types";
import type { BenefitGroup } from "../page";

interface BenefitDetailModalProps {
  open: boolean;
  onClose: () => void;
  group: BenefitGroup;
  transactions: TransactionWithMatch[];
}

export function BenefitDetailModal({
  open,
  onClose,
  group,
  transactions,
}: BenefitDetailModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const details = group.details;

  const benefitIds = useMemo(
    () => new Set(group.benefits.map((b) => b.benefitId)),
    [group.benefits]
  );

  const matchedTransactions = useMemo(
    () =>
      transactions
        .filter((tx) => tx.benefitId && benefitIds.has(tx.benefitId))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
    [transactions, benefitIds]
  );
  const isCredit = group.type === "credit";
  const remaining = Math.max(0, group.totalRemaining);
  const used = group.totalCredit - remaining;
  const isGrouped = group.benefits.length > 1;

  const iconElement = (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)]/10">
      <BenefitIcon icon={group.icon} size={20} />
    </div>
  );

  const handleRedeem = async () => {
    // For grouped benefits, redeem each sub-benefit
    const benefitIds = group.benefits.map((b) => b.benefitId);

    try {
      for (const id of benefitIds) {
        const res = await fetch("/api/benefits/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ benefitId: id }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      }

      addToast(`${group.name} marked as redeemed`, async () => {
        // Undo all
        for (const id of benefitIds) {
          await fetch("/api/benefits/redeem", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ benefitId: id }),
          });
        }
        startTransition(() => router.refresh());
      });

      startTransition(() => router.refresh());
    } catch (err: any) {
      console.error("Failed to redeem benefit:", err);
      addToast(err.message || "Failed to mark as redeemed");
    }
  };

  const handleUndoRedeem = async () => {
    const benefitIds = group.benefits.map((b) => b.benefitId);

    try {
      for (const id of benefitIds) {
        const res = await fetch("/api/benefits/redeem", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ benefitId: id }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      }

      addToast(`${group.name} redemption undone`);
      startTransition(() => router.refresh());
    } catch (err: any) {
      console.error("Failed to undo redemption:", err);
      addToast(err.message || "Failed to undo redemption");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={group.name} icon={iconElement}>
      {/* Status badges */}
      <div className="mb-[var(--space-md)] flex flex-wrap gap-2">
        {group.isFullyUsed && <Badge variant="success">Used</Badge>}
        {group.requiresActivation && (
          <Badge variant="info">Activation Required</Badge>
        )}
        {group.type === "subscription" && (
          <Badge variant="neutral">Subscription</Badge>
        )}
        {group.sunsetDate && (
          <Badge variant="warning">Expires {group.sunsetDate}</Badge>
        )}
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

      {/* Redeem / Undo button */}
      {isCredit && !group.isFullyUsed && (
        <button
          onClick={handleRedeem}
          disabled={isPending}
          className="mb-[var(--space-md)] flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--accent)]/30 px-4 py-2.5 text-[var(--text-body)] font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10 disabled:opacity-50"
        >
          <Check size={16} />
          Mark as Redeemed
        </button>
      )}
      {isCredit && group.isFullyUsed && group.manualOverride && (
        <button
          onClick={handleUndoRedeem}
          disabled={isPending}
          className="mb-[var(--space-md)] flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 py-2.5 text-[var(--text-body)] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-primary)] disabled:opacity-50"
        >
          <Undo2 size={16} />
          Undo Redemption
        </button>
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

      {/* Matched transactions */}
      {matchedTransactions.length > 0 && (
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
                  </span>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <span className="font-data text-[var(--text-primary)]">
                    ${tx.amount.toFixed(2)}
                  </span>
                  {tx.creditApplied && (
                    <span className="font-data text-[var(--text-caption)] text-[var(--color-success)] block">
                      -${tx.creditApplied.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
