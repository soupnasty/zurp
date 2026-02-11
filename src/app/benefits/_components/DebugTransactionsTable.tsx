"use client";

import type { DebugTransactionRow } from "@/lib/queries";

interface DebugTransactionsTableProps {
  rows: DebugTransactionRow[];
}

export function DebugTransactionsTable({ rows }: DebugTransactionsTableProps) {
  function downloadCsv() {
    const headers = [
      "Date",
      "Merchant",
      "Amount",
      "Status",
      "Matched Benefit",
      "Credit Applied",
      "Confidence",
      "Method",
      "Plaid Category",
    ];
    const csvRows = [headers.join(",")];
    for (const r of rows) {
      csvRows.push(
        [
          fmt(r.date),
          escapeCsv(r.merchantName ?? ""),
          r.amount.toFixed(2),
          r.matchedStatus,
          escapeCsv(r.matchedBenefitName ?? ""),
          r.creditApplied != null ? r.creditApplied.toFixed(2) : "",
          r.matchConfidence ?? "",
          r.matchMethod ?? "",
          escapeCsv(r.plaidCategoryPrimary ?? ""),
        ].join(",")
      );
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zurp-transactions-debug-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <details className="mt-[var(--space-lg)] rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/5 p-[var(--space-md)]">
      <summary className="cursor-pointer text-[var(--text-body)] font-semibold text-amber-400">
        Debug: Transactions ({rows.length} rows, dev only)
      </summary>

      <div className="mt-[var(--space-md)] space-y-2 text-[var(--text-caption)]">
        <button
          onClick={downloadCsv}
          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-300 transition-colors hover:bg-amber-500/20"
        >
          Download CSV
        </button>

        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-left text-[var(--text-caption)]">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)]">
                <th className="pb-1 pr-3 font-medium">Date</th>
                <th className="pb-1 pr-3 font-medium">Merchant</th>
                <th className="pb-1 pr-3 font-medium text-right">Amount</th>
                <th className="pb-1 pr-3 font-medium">Status</th>
                <th className="pb-1 pr-3 font-medium">Matched Benefit</th>
                <th className="pb-1 pr-3 font-medium text-right">Credit</th>
                <th className="pb-1 pr-3 font-medium">Confidence</th>
                <th className="pb-1 pr-3 font-medium">Method</th>
                <th className="pb-1 font-medium">Plaid Category</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--border-default)]/50 text-[var(--text-primary)]"
                >
                  <td className="py-1 pr-3 font-data whitespace-nowrap">{fmt(row.date)}</td>
                  <td className="py-1 pr-3 truncate max-w-[200px]">{row.merchantName ?? "—"}</td>
                  <td className="py-1 pr-3 font-data text-right">${row.amount.toFixed(2)}</td>
                  <td className="py-1 pr-3">
                    <StatusBadge status={row.matchedStatus} />
                  </td>
                  <td className="py-1 pr-3 truncate max-w-[180px]">
                    {row.matchedBenefitName ?? "—"}
                  </td>
                  <td className="py-1 pr-3 font-data text-right">
                    {row.creditApplied != null ? `$${row.creditApplied.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-1 pr-3 font-data">{row.matchConfidence ?? "—"}</td>
                  <td className="py-1 pr-3 font-data">{row.matchMethod ?? "—"}</td>
                  <td className="py-1 font-data">{row.plaidCategoryPrimary ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    matched: "text-[var(--color-success)]",
    ambiguous: "text-[var(--color-warning)]",
    skipped: "text-[var(--text-muted)]",
    unmatched: "text-[var(--text-secondary)]",
  };
  return (
    <span className={`font-data ${colors[status] ?? "text-[var(--text-secondary)]"}`}>
      {status}
    </span>
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

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
