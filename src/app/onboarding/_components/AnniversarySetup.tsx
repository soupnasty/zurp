"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

interface AnniversarySetupProps {
  onSubmit: (date: Date) => void;
  onSkip: () => void;
}

export function AnniversarySetup({ onSubmit, onSkip }: AnniversarySetupProps) {
  const [dateStr, setDateStr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr) return;
    onSubmit(new Date(dateStr + "T00:00:00"));
  };

  return (
    <div>
      <h2 className="text-h3 font-semibold">Card Anniversary Date</h2>
      <p className="mt-2 text-[var(--text-secondary)]">
        When did you open your card? This helps us track your $300 travel credit
        cycle accurately.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <div>
          <label
            htmlFor="anniversary"
            className="block text-sm font-medium text-[var(--text-primary)]"
          >
            Anniversary date
          </label>
          <div className="relative mt-1.5">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              id="anniversary"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-tertiary)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </div>
          <p className="mt-1.5 text-caption text-[var(--text-secondary)]">
            This is usually the month you were approved for the card.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={!dateStr}
            className="flex-1 rounded-[var(--radius-md)] bg-[var(--accent)] py-2.5 text-sm font-medium text-[var(--color-void)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Save Date
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
