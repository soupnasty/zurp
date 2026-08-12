"use client";

import { useSearchParams } from "next/navigation";
import { resolveActiveCard } from "@/lib/resolve-card";

interface CardProfile {
  id: string;
  isActive: boolean;
  syncStatus: "pending" | "initial" | "complete";
}

interface SyncBannerProps {
  cardProfiles: CardProfile[];
}

export function SyncBanner({ cardProfiles }: SyncBannerProps) {
  const searchParams = useSearchParams();

  // Same resolution as the server pages (?card → isActive → first)
  const activeProfile = resolveActiveCard(
    cardProfiles,
    searchParams.get("card") ?? undefined
  );

  if (!activeProfile || activeProfile.syncStatus === "complete") return null;

  return (
    <div
      className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: "rgba(96,165,250,0.06)",
        border: "1px solid rgba(96,165,250,0.10)",
      }}
    >
      {/* Pulse dot */}
      <span
        className="relative flex-shrink-0"
        style={{ width: 8, height: 8 }}
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "#60a5fa",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: "#60a5fa" }}
        />
      </span>

      <span
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.4,
        }}
      >
        {activeProfile.syncStatus === "pending"
          ? "Waiting for transaction data from your bank..."
          : "Syncing your full year of transactions. Data will update automatically."}
      </span>
    </div>
  );
}
