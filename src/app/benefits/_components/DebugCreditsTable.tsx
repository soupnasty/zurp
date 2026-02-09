import type { CreditsDebugData } from "@/lib/queries";

interface DebugCreditsTableProps {
  data: CreditsDebugData;
}

export function DebugCreditsTable({ data }: DebugCreditsTableProps) {
  return (
    <details className="mt-[var(--space-lg)] rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/5 p-[var(--space-md)]">
      <summary className="cursor-pointer text-[var(--text-body)] font-semibold text-amber-400">
        Debug: Credits Used Breakdown (dev only)
      </summary>

      <div className="mt-[var(--space-md)] space-y-2 text-[var(--text-caption)]">
        <p className="text-[var(--text-secondary)]">
          Card year: {fmt(data.cardYearStart)} &ndash; {fmt(data.cardYearEnd)}
        </p>
        <p className="font-data text-[var(--text-primary)]">
          Credits Used Total: <strong>${data.creditsUsedTotal.toFixed(2)}</strong>
        </p>

        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-left text-[var(--text-caption)]">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)]">
                <th className="pb-1 pr-3 font-medium">Benefit</th>
                <th className="pb-1 pr-3 font-medium">Cycle</th>
                <th className="pb-1 pr-3 font-medium">Period</th>
                <th className="pb-1 pr-3 font-medium text-right">Used</th>
                <th className="pb-1 pr-3 font-medium text-right">Limit</th>
                <th className="pb-1 pr-3 font-medium">Cycle Start</th>
                <th className="pb-1 pr-3 font-medium">Cycle End</th>
                <th className="pb-1 font-medium">In Year?</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr
                  key={`${row.benefitId}-${row.periodKey}`}
                  className={`border-b border-[var(--border-default)]/50 ${
                    row.inCardYear ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] opacity-50"
                  }`}
                >
                  <td className="py-1 pr-3 truncate max-w-[180px]">{row.benefitName}</td>
                  <td className="py-1 pr-3">{row.cycle}</td>
                  <td className="py-1 pr-3 font-data">{row.periodKey}</td>
                  <td className="py-1 pr-3 font-data text-right">
                    ${row.amountUsed.toFixed(2)}
                  </td>
                  <td className="py-1 pr-3 font-data text-right">
                    ${row.creditAmount.toFixed(2)}
                  </td>
                  <td className="py-1 pr-3 font-data">{fmt(row.cycleStart)}</td>
                  <td className="py-1 pr-3 font-data">{fmt(row.cycleEnd)}</td>
                  <td className="py-1 font-data">
                    {row.inCardYear ? (
                      <span className="text-[var(--color-success)]">Yes</span>
                    ) : (
                      <span className="text-[var(--color-danger)]">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--border-default)] font-semibold text-[var(--text-primary)]">
                <td className="pt-2 pr-3" colSpan={3}>
                  Total (in card year)
                </td>
                <td className="pt-2 pr-3 font-data text-right">
                  ${data.creditsUsedTotal.toFixed(2)}
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </details>
  );
}

function fmt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
