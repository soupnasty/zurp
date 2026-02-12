"use client";

import { useRouter, usePathname } from "next/navigation";
import { Eye, X } from "lucide-react";

interface ViewAsBannerProps {
  cardName: string;
  annualFee: number;
}

export function ViewAsBanner({ cardName, annualFee }: ViewAsBannerProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="mb-[var(--space-lg)] flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-signal)]/30 bg-[var(--color-signal)]/5 px-[var(--space-md)] py-3">
      <div className="flex items-center gap-2 text-[var(--text-body)]">
        <Eye size={16} className="text-[var(--color-signal)]" />
        <span className="text-[var(--text-primary)]">
          Viewing as <span className="font-semibold">{cardName}</span>
        </span>
        <span className="text-[var(--text-secondary)]">&middot;</span>
        <span className="font-data text-[var(--text-secondary)]">
          ${annualFee}/yr fee
        </span>
      </div>
      <button
        onClick={() => router.push(pathname)}
        className="flex items-center gap-1 rounded-[var(--radius-md)] px-2 py-1 text-[var(--text-caption)] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--color-signal)]/10 hover:text-[var(--text-primary)]"
      >
        <X size={14} />
        Exit
      </button>
    </div>
  );
}
