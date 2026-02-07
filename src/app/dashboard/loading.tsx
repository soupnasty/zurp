import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-[var(--space-lg)]">
      {/* Header */}
      <div className="mb-[var(--space-lg)] flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-24 rounded-[var(--radius-md)]" />
      </div>

      {/* Summary bar — 4 stat cards */}
      <div className="grid grid-cols-2 gap-[var(--space-md)] lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-md)]"
          >
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>

      {/* Benefits grid */}
      <div className="mt-[var(--space-lg)]">
        <Skeleton className="h-3 w-16 mb-[var(--space-md)]" />
        <div className="grid grid-cols-1 gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-md)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-8 w-8 rounded-[var(--radius-md)]" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <div className="mt-2 flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction feed */}
      <div className="mt-[var(--space-xl)]">
        <Skeleton className="h-3 w-32 mb-[var(--space-md)]" />
        <div className="space-y-0 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-20 rounded-[var(--radius-sm)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
