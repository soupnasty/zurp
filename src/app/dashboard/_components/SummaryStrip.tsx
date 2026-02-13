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

  return (
    <div
      className="summary-strip"
      style={{
        gridTemplateColumns: `repeat(${Math.min(cols, 2)}, 1fr)`,
      }}
    >
      {items.map((item, i) => (
        <div key={i} className="summary-strip-item">
          <span
            className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {item.label}
          </span>
          <span
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-mono)", color: item.valueColor }}
          >
            {item.value}
          </span>
          {item.sub && (
            <span className="text-xs text-[var(--text-secondary)]">{item.sub}</span>
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
