"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthSelectorProps {
  year: number;
  month: number;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function MonthSelector({
  year,
  month,
  canGoPrev,
  canGoNext,
}: MonthSelectorProps) {
  const router = useRouter();

  function navigate(direction: -1 | 1) {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    router.push(`/spending?year=${newYear}&month=${newMonth}`);
  }

  return (
    <div className="flex items-center justify-center gap-[var(--space-md)]">
      <button
        onClick={() => navigate(-1)}
        disabled={!canGoPrev}
        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[var(--bg-secondary)] disabled:hover:text-[var(--text-secondary)]"
        aria-label="Previous month"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="min-w-[180px] text-center text-h3 font-semibold tracking-tight text-[var(--text-primary)]">
        {MONTH_NAMES[month - 1]} {year}
      </span>

      <button
        onClick={() => navigate(1)}
        disabled={!canGoNext}
        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[var(--bg-secondary)] disabled:hover:text-[var(--text-secondary)]"
        aria-label="Next month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
