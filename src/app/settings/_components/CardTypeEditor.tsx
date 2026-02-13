"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { updateCardType } from "@/lib/actions";

interface CardTypeEditorProps {
  cardProfileId: string;
  currentCardType: string;
  currentCardName: string;
  allCardTypes: { id: string; name: string }[];
}

export function CardTypeEditor({
  cardProfileId,
  currentCardType,
  currentCardName,
  allCardTypes,
}: CardTypeEditorProps) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState(currentCardType);

  function handleSave() {
    startTransition(async () => {
      await updateCardType(cardProfileId, selected);
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="text-[11px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Type:
        </span>
        <span
          className="text-[11px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {currentCardName}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="rounded p-1 text-[var(--text-secondary)] transition-colors hover:bg-[rgba(34,211,238,0.08)] hover:text-[var(--color-accent-cyan)]"
          title="Change card type"
        >
          <Pencil size={12} strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-1 text-[11px] text-[var(--text-primary)] focus:border-[var(--color-accent-cyan)] focus:outline-none"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {allCardTypes.map((card) => (
          <option key={card.id} value={card.id}>
            {card.name}
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
          setSelected(currentCardType);
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
