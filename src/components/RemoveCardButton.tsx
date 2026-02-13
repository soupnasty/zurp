"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { removeCardProfile } from "@/lib/actions";

interface RemoveCardButtonProps {
  cardProfileId: string;
  cardName: string;
}

export function RemoveCardButton({ cardProfileId, cardName }: RemoveCardButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeCardProfile(cardProfileId);
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
          className="rounded-[var(--radius-md)] border px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-50"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-danger)",
            background: "rgba(248,113,113,0.1)",
            borderColor: "rgba(248,113,113,0.2)",
          }}
        >
          {removing ? "..." : "Confirm"}
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
