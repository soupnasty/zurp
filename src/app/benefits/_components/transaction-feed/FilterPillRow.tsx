import type { FilterOption } from "./types";

interface FilterPillRowProps {
  filterBenefitId: string | null;
  setFilterBenefitId: (id: string | null) => void;
  filterCounts: Record<string, number>;
  filterOptions: FilterOption[];
}

export function FilterPillRow({
  filterBenefitId,
  setFilterBenefitId,
  filterCounts,
  filterOptions,
}: FilterPillRowProps) {
  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => setFilterBenefitId(null)}
        className={`shrink-0 rounded-full border px-3 py-1 text-[var(--text-caption)] font-medium transition-colors ${
          filterBenefitId === null
            ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
            : "text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--text-secondary)]"
        }`}
      >
        All <span className="ml-1 font-data">{filterCounts.all}</span>
      </button>
      {filterOptions.map((opt) => {
        const count = filterCounts[opt.id] ?? 0;
        if (count === 0) return null;
        return (
          <button
            key={opt.id}
            onClick={() => setFilterBenefitId(opt.id)}
            className={`shrink-0 rounded-full border px-3 py-1 text-[var(--text-caption)] font-medium transition-colors ${
              filterBenefitId === opt.id
                ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
                : "text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--text-secondary)]"
            }`}
          >
            {opt.name} <span className="ml-1 font-data">{count}</span>
          </button>
        );
      })}
      {filterCounts.unmatched > 0 && (
        <button
          onClick={() => setFilterBenefitId("unmatched")}
          className={`shrink-0 rounded-full border px-3 py-1 text-[var(--text-caption)] font-medium transition-colors ${
            filterBenefitId === "unmatched"
              ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
              : "text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--text-secondary)]"
          }`}
        >
          Unmatched <span className="ml-1 font-data">{filterCounts.unmatched}</span>
        </button>
      )}
      {filterCounts.ambiguous > 0 && (
        <button
          onClick={() => setFilterBenefitId("ambiguous")}
          className={`shrink-0 rounded-full border px-3 py-1 text-[var(--text-caption)] font-medium transition-colors ${
            filterBenefitId === "ambiguous"
              ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
              : "text-[var(--color-warning)] border-[var(--color-warning)]/30 hover:border-[var(--color-warning)]"
          }`}
        >
          Needs Review <span className="ml-1 font-data">{filterCounts.ambiguous}</span>
        </button>
      )}
    </div>
  );
}
