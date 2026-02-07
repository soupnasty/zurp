import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[var(--accent)]/10 p-4">
            <FileQuestion
              size={28}
              strokeWidth={1.75}
              className="text-[var(--accent)]"
            />
          </div>
        </div>
        <h1 className="text-h2 font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/benefits"
          className="mt-6 inline-block rounded-[var(--radius-md)] bg-[var(--accent)] px-6 py-2.5 text-[var(--text-body)] font-medium text-[var(--color-void)] transition-opacity duration-[var(--duration-fast)] hover:opacity-90"
        >
          Back to Benefits
        </Link>
      </div>
    </div>
  );
}
