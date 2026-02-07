"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          Something went wrong
        </h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="mt-2 font-data text-[var(--text-secondary)]">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6">
          <Button
            onClick={reset}
            icon={<RotateCcw size={16} strokeWidth={1.75} />}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
