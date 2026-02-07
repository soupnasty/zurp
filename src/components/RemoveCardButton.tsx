"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { removeUserCard } from "@/lib/actions";

interface RemoveCardButtonProps {
  userCardId: string;
  cardName: string;
}

export function RemoveCardButton({ userCardId, cardName }: RemoveCardButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeUserCard(userCardId);
    } catch {
      setRemoving(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleRemove}
          disabled={removing}
          className="rounded-[var(--radius-md)] bg-[var(--color-danger)] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {removing ? "Removing..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={removing}
          className="rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-[var(--radius-md)] p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
      title={`Remove ${cardName}`}
    >
      <Trash2 size={18} strokeWidth={1.75} />
    </button>
  );
}
