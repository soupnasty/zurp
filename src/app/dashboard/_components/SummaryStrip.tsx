"use client";

interface SummaryStripItem {
  label: string;
  value: string;
  valueColor: string;
  sub?: string;
}

interface SummaryStripProps {
  items: SummaryStripItem[];
}

export function SummaryStrip({ items }: SummaryStripProps) {
  const cols = items.length;
  // 3 or fewer items: single row on all viewports. 4+: 2-col on mobile.
  const mobileCols = cols <= 3 ? cols : 2;

  return (
    <div
      className="summary-strip"
      style={{
        gridTemplateColumns: `repeat(${mobileCols}, 1fr)`,
      }}
    >
      {items.map((item, i) => (
        <div key={i} className="summary-strip-item">
          <span
            className="text-[10px] md:text-[11px] font-bold uppercase tracking-[1.5px] md:tracking-[2px] text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {item.label}
          </span>
          <span
            className="text-base md:text-xl font-bold"
            style={{ fontFamily: "var(--font-mono)", color: item.valueColor }}
          >
            {item.value}
          </span>
          {item.sub && (
            <span className="truncate text-[11px] md:text-xs text-[var(--text-secondary)]">{item.sub}</span>
          )}
        </div>
      ))}

      {/* Responsive: use CSS to expand on desktop */}
      <style jsx>{`
        @media (min-width: 768px) {
          .summary-strip {
            grid-template-columns: repeat(${cols}, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
