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
      <div className="mt-2 flex items-center gap-2">
        <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
          Card type:{" "}
          <span className="text-[var(--text-primary)]">{currentCardName}</span>
        </p>
        <button
          onClick={() => setEditing(true)}
          className="rounded-[var(--radius-md)] p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
          title="Change card type"
        >
          <Pencil size={14} strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-[var(--text-caption)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
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
          className="rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-[var(--text-caption)] font-medium text-[var(--color-void)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => {
            setSelected(currentCardType);
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
