"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { updateAnniversaryDate } from "../actions";

interface AnniversaryEditorProps {
  cardProfileId: string;
  currentDate: string | null; // ISO string or null
  source: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  const sourceLabel =
    source === "auto_detected"
      ? "auto"
      : source === "user_provided"
        ? "manual"
        : null;

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
      <div className="flex items-center gap-1.5">
        <span
          className="text-[11px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Anniversary:
        </span>
        {displayDate ? (
          <>
            <span
              className="text-[11px] font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {displayDate}
            </span>
            {sourceLabel && (
              <span
                className="text-[10px] text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ({sourceLabel})
              </span>
            )}
          </>
        ) : (
          <span
            className="text-[11px] text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Not set
          </span>
        )}
        <button
          onClick={() => setEditing(true)}
          className="rounded p-1 text-[var(--text-secondary)] transition-colors hover:bg-[rgba(34,211,238,0.08)] hover:text-[var(--color-accent-cyan)]"
          title={displayDate ? "Edit anniversary" : "Set anniversary"}
        >
          <Pencil size={12} strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
        className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-1 text-[11px] text-[var(--text-primary)] focus:border-[var(--color-accent-cyan)] focus:outline-none"
        style={{ fontFamily: "var(--font-mono)" }}
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
        className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-1 text-[11px] text-[var(--text-primary)] focus:border-[var(--color-accent-cyan)] focus:outline-none"
        style={{ fontFamily: "var(--font-mono)" }}
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
        className="rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-accent-cyan)] transition-colors hover:bg-[rgba(34,211,238,0.08)] disabled:opacity-50"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {isPending ? "..." : "Save"}
      </button>
      <button
        onClick={() => {
          setMonth(currentMonth);
          setYear(currentYear);
          setEditing(false);
        }}
        disabled={isPending}
        className="text-[11px] text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)] disabled:opacity-50"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Cancel
      </button>
    </div>
  );
}
