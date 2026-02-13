"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-[var(--radius-md)] border px-3 py-1.5 text-xs font-semibold transition-colors"
      style={{
        fontFamily: "var(--font-mono)",
        color: "var(--color-danger)",
        background: "rgba(248,113,113,0.06)",
        borderColor: "rgba(248,113,113,0.15)",
      }}
    >
      Sign out
    </button>
  );
}
