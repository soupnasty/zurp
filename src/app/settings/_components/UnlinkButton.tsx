"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { unlinkConnection } from "../actions";

interface UnlinkButtonProps {
  connectionId: string;
  institutionName: string;
}

export function UnlinkButton({ connectionId, institutionName }: UnlinkButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await unlinkConnection(connectionId);
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
          className="text-[11px] text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded p-1.5 text-[var(--text-dim)] transition-colors hover:bg-[rgba(248,113,113,0.08)] hover:text-[var(--color-danger)]"
      title={`Unlink ${institutionName}`}
    >
      <Trash2 size={16} strokeWidth={1.75} />
    </button>
  );
}
