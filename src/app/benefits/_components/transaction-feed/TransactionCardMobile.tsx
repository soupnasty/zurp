import { X, Plus, ChevronDown, CircleHelp } from "lucide-react";
import type { TransactionWithMatch } from "@/lib/types";
import { DropdownMenu } from "./DropdownMenu";
import { REMOVE_REASONS } from "./types";
import type { TransactionRowContext } from "./types";

interface Props {
  tx: TransactionWithMatch;
  ctx: TransactionRowContext;
}

export function TransactionCardMobile({ tx, ctx }: Props) {
  const isRemoved = ctx.pendingRemoves.has(tx.id);
  const isSkipped = ctx.pendingSkips.has(tx.id);
  const addedBenefit = ctx.pendingAdds.get(tx.id);

  const renderMobileFlagButton = () => {
    const isMatched = tx.matchedStatus === "matched" && tx.matchedBenefitName;

    if (isRemoved) return null;

    if (isMatched) {
      return (
        <DropdownMenu
          isOpen={ctx.openRemoveId === tx.id}
          onToggle={(e) => {
            e.stopPropagation();
            ctx.setOpenRemoveId(ctx.openRemoveId === tx.id ? null : tx.id);
            ctx.setOpenAddId(null);
          }}
          trigger={
            <span className="rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] inline-flex">
              <X size={14} />
            </span>
          }
        >
          {REMOVE_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={(e) => {
                e.stopPropagation();
                ctx.handleRemove(tx, reason);
              }}
              className="block w-full px-3 py-1.5 text-left text-[var(--text-caption)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
            >
              {reason}
            </button>
          ))}
        </DropdownMenu>
      );
    }

    if (addedBenefit) return null;

    const eligible = ctx.getEligibleBenefits(tx.date);
    if (tx.matchedStatus === "unmatched" && eligible.length > 0) {
      return (
        <DropdownMenu
          isOpen={ctx.openAddId === tx.id}
          onToggle={(e) => {
            e.stopPropagation();
            ctx.setOpenAddId(ctx.openAddId === tx.id ? null : tx.id);
            ctx.setOpenRemoveId(null);
          }}
          width="w-56"
          trigger={
            <span className="rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] inline-flex">
              <Plus size={14} />
            </span>
          }
        >
          <p className="px-3 py-1 text-[var(--text-caption)] text-[var(--text-secondary)]">
            Add to benefit:
          </p>
          {eligible.map((b) => (
            <button
              key={b.benefitId}
              onClick={(e) => {
                e.stopPropagation();
                ctx.handleAdd(tx, b);
              }}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[var(--text-caption)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
            >
              <span className="truncate">{b.benefitName}</span>
              <span className="ml-2 shrink-0 font-data text-[var(--text-secondary)]">
                ${b.amountRemaining.toFixed(0)} left
              </span>
            </button>
          ))}
        </DropdownMenu>
      );
    }

    return null;
  };

  const renderReviewDropdown = () => {
    if (isSkipped) return null;

    const eligible = ctx.getAmbiguousCandidates(tx);
    if (eligible.length === 0) {
      return (
        <span className="text-[var(--text-caption)] text-[var(--color-warning)]">
          Needs review
        </span>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <DropdownMenu
          isOpen={ctx.openReviewId === tx.id}
          onToggle={(e) => {
            e.stopPropagation();
            ctx.setOpenReviewId(ctx.openReviewId === tx.id ? null : tx.id);
            ctx.setOpenRemoveId(null);
            ctx.setOpenAddId(null);
            ctx.setOpenHelpId(null);
          }}
          align="left"
          width="w-56"
          trigger={
            <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[var(--text-caption)] text-[var(--color-warning)] transition-colors hover:bg-[var(--color-warning)]/10">
              <span>Needs review</span>
              <ChevronDown size={12} />
            </span>
          }
        >
          <p className="px-3 py-1 text-[var(--text-caption)] text-[var(--text-secondary)]">
            Apply to benefit:
          </p>
          {eligible.map((b) => (
            <button
              key={b.benefitId}
              onClick={(e) => {
                e.stopPropagation();
                ctx.handleAdd(tx, b);
                ctx.setOpenReviewId(null);
              }}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[var(--text-caption)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
            >
              <span className="truncate">{b.benefitName}</span>
              <span className="ml-2 shrink-0 font-data text-[var(--text-secondary)]">
                ${b.amountRemaining.toFixed(0)} left
              </span>
            </button>
          ))}
          <div className="my-1 border-t border-[var(--border-default)]" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              ctx.handleSkip(tx);
            }}
            className="block w-full px-3 py-1.5 text-left text-[var(--text-caption)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
          >
            Skip — doesn&apos;t apply
          </button>
        </DropdownMenu>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              ctx.setOpenHelpId(ctx.openHelpId === tx.id ? null : tx.id);
              ctx.setOpenReviewId(null);
              ctx.setOpenRemoveId(null);
              ctx.setOpenAddId(null);
            }}
            className="rounded p-0.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--color-warning)]"
            title="Why needs review?"
          >
            <CircleHelp size={13} />
          </button>
          {ctx.openHelpId === tx.id && (
            <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 shadow-[var(--glow-sm)]">
              <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                This transaction matches a benefit category but couldn&apos;t be automatically assigned. Choose a benefit to apply the credit, or skip it.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const showBottomRow =
    (tx.matchedBenefitName && !isRemoved) ||
    addedBenefit ||
    tx.matchedStatus === "ambiguous" ||
    (tx.matchedStatus === "unmatched" && !addedBenefit && ctx.getEligibleBenefits(tx.date).length > 0);

  return (
    <div
      className={`rounded-[var(--radius-lg)] border bg-[var(--bg-secondary)] p-3 transition-opacity ${
        isRemoved || isSkipped ? "opacity-40" : ""
      } ${
        tx.matchedStatus === "ambiguous" && !isSkipped
          ? "border-[var(--color-warning)]/30"
          : "border-[var(--border-default)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-body)] font-medium text-[var(--text-primary)] truncate">
            {tx.merchantName || "Unknown"}
          </p>
          <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
            {new Date(tx.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right ml-3 shrink-0">
          <p className="font-data text-[var(--text-body)] font-medium text-[var(--text-primary)]">
            ${tx.amount.toFixed(2)}
          </p>
          {(tx.creditApplied && !isRemoved) ? (
            <p className="font-data text-[var(--text-caption)] text-[var(--color-success)]">
              -${tx.creditApplied.toFixed(2)}
            </p>
          ) : addedBenefit ? (
            <p className="font-data text-[var(--text-caption)] text-[var(--color-success)]">
              matched
            </p>
          ) : null}
        </div>
      </div>
      {showBottomRow && (
        <div className="mt-2 flex items-center gap-1.5 border-t border-[var(--border-default)] pt-2">
          {addedBenefit && !tx.matchedBenefitName ? (
            <span className="text-[var(--text-caption)] text-[var(--accent)]">
              {addedBenefit}
            </span>
          ) : (tx.matchedBenefitName || addedBenefit) && !isRemoved ? (
            <>
              <span className="text-[var(--text-caption)] text-[var(--accent)]">
                {tx.matchedBenefitName || addedBenefit}
              </span>
              {renderMobileFlagButton()}
            </>
          ) : tx.matchedStatus === "ambiguous" ? (
            renderReviewDropdown()
          ) : tx.matchedStatus === "unmatched" && ctx.getEligibleBenefits(tx.date).length > 0 ? (
            <>
              <span className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                No benefit matched
              </span>
              {renderMobileFlagButton()}
            </>
          ) : null}
          {!isRemoved && !addedBenefit && (
            <span className="ml-auto">{ctx.confidenceBadge(tx)}</span>
          )}
        </div>
      )}
    </div>
  );
}
