import { Skeleton } from "@/components/ui/Skeleton";

export default function SpendingLoading() {
  return (
    <div className="p-[var(--space-md)] md:p-[var(--space-lg)]">
      {/* Month selector skeleton */}
      <div className="mb-[var(--space-lg)] flex items-center justify-center gap-[var(--space-md)]">
        <Skeleton className="h-10 w-10 rounded-[var(--radius-md)]" />
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-10 w-10 rounded-[var(--radius-md)]" />
      </div>

      {/* Headline card skeleton */}
      <div className="mb-[var(--space-lg)] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-lg)] text-center">
        <Skeleton className="mx-auto h-3 w-24 mb-3" />
        <Skeleton className="mx-auto h-10 w-48 mb-3" />
        <Skeleton className="mx-auto h-5 w-32 rounded-[var(--radius-sm)]" />
      </div>

      {/* Category breakdown skeleton */}
      <Skeleton className="h-3 w-36 mb-[var(--space-md)]" />
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-[var(--space-sm)] px-[var(--space-md)] py-[var(--space-sm)] ${
              i > 0 ? "border-t border-[var(--border-default)]" : ""
            }`}
          >
            <Skeleton className="h-3.5 w-3.5 shrink-0" />
            <Skeleton className="h-4 w-28 shrink-0" />
            <div className="flex-1">
              <Skeleton className={`h-2 rounded-full ${
                [
                  "w-full",
                  "w-[88%]",
                  "w-[76%]",
                  "w-[64%]",
                  "w-[52%]",
                  "w-[40%]",
                ][i]
              }`} />
            </div>
            <Skeleton className="h-4 w-14 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
