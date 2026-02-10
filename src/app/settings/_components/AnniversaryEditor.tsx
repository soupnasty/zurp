"use client";

import { useState, useTransition } from "react";
import { updateAnniversaryDate } from "../actions";

interface AnniversaryEditorProps {
  cardProfileId: string;
  currentDate: string | null; // ISO string or null
  source: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function AnniversaryEditor({
  cardProfileId,
  currentDate,
  source,
}: AnniversaryEditorProps) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const parsed = currentDate ? new Date(currentDate) : null;
  const currentMonth = parsed ? parsed.getUTCMonth() + 1 : new Date().getMonth() + 1;
  const currentYear = parsed ? parsed.getUTCFullYear() : new Date().getFullYear();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const displayDate = parsed
    ? parsed.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  const sourceLabel =
    source === "auto_detected"
      ? "Auto-detected"
      : source === "user_provided"
        ? "Set manually"
        : "Not set";

  function handleSave() {
    startTransition(async () => {
      await updateAnniversaryDate(cardProfileId, month, year);
      setEditing(false);
    });
  }

  // Generate year options: current year back 5 years
  const nowYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = nowYear; y >= nowYear - 5; y--) {
    yearOptions.push(y);
  }

  if (!editing) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
          Anniversary:{" "}
          {displayDate ? (
            <span className="text-[var(--text-primary)]">{displayDate}</span>
          ) : (
            <span className="text-[var(--text-muted)]">Not set</span>
          )}
          {displayDate && (
            <span className="ml-1 text-[var(--text-muted)]">
              ({sourceLabel})
            </span>
          )}
        </p>
        <button
          onClick={() => setEditing(true)}
          className="text-[var(--text-caption)] font-medium text-[var(--accent)] hover:underline"
        >
          {displayDate ? "Edit" : "Set"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <p className="text-[var(--text-caption)] text-[var(--text-secondary)] mb-1.5">
        Anniversary month (when your annual fee posts)
      </p>
      <div className="flex items-center gap-2">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-[var(--text-caption)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
        >
          {MONTHS.map((name, i) => (
            <option key={i} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-[var(--text-caption)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-[var(--text-caption)] font-medium text-[var(--color-void)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => {
            setMonth(currentMonth);
            setYear(currentYear);
            setEditing(false);
          }}
          disabled={isPending}
          className="text-[var(--text-caption)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
