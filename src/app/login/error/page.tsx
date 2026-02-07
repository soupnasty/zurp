import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[var(--color-danger)]/10 p-4">
            <AlertTriangle
              size={28}
              strokeWidth={1.75}
              className="text-[var(--color-danger)]"
            />
          </div>
        </div>
        <h1 className="text-h2 font-semibold tracking-tight">
          Authentication Error
        </h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          Something went wrong during sign in. The link may have expired or
          already been used.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-[var(--radius-md)] bg-[var(--accent)] px-6 py-2.5 text-[var(--text-body)] font-medium text-[var(--color-void)] transition-opacity duration-[var(--duration-fast)] hover:opacity-90"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
