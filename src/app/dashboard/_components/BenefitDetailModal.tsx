"use client";

import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink } from "lucide-react";
import { BenefitIcon } from "@/components/ui/BenefitIcon";
import type { BenefitGroup } from "../page";

interface BenefitDetailModalProps {
  open: boolean;
  onClose: () => void;
  group: BenefitGroup;
}

export function BenefitDetailModal({
  open,
  onClose,
  group,
}: BenefitDetailModalProps) {
  const details = group.details;
  const isCredit = group.type === "credit";
  const remaining = Math.max(0, group.totalRemaining);
  const used = group.totalCredit - remaining;
  const isGrouped = group.benefits.length > 1;

  const iconElement = (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)]/10">
      <BenefitIcon icon={group.icon} size={20} />
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={group.name} icon={iconElement}>
      {/* Status badges */}
      <div className="mb-[var(--space-md)] flex flex-wrap gap-2">
        {group.isFullyUsed && <Badge variant="success">Used</Badge>}
        {group.requiresActivation && <Badge variant="info">Activation Required</Badge>}
        {group.type === "subscription" && <Badge variant="neutral">Subscription</Badge>}
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
                  <div key={b.benefitId} className="flex items-center justify-between text-[var(--text-caption)]">
                    <span className="text-[var(--text-secondary)]">{b.benefitName}</span>
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
    </Modal>
  );
}
