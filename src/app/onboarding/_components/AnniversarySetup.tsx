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
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              id="anniversary"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full rounded-md border bg-[var(--bg-primary)] py-2.5 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <p className="mt-1.5 text-caption text-[var(--text-tertiary)]">
            This is usually the month you were approved for the card.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={!dateStr}
            className="flex-1 rounded-md bg-primary-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            Save Date
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-md border px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
