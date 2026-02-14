"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="text-[var(--text-caption)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
    >
      &larr; Back
    </button>
  );
}
