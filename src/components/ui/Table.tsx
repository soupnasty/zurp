import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Table({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-[var(--text-body)]">{children}</table>
    </div>
  );
}

export function TableHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={`border-b border-[var(--border-default)] ${className}`}
    >
      {children}
    </thead>
  );
}

export function TableRow({
  children,
  className = "",
  highlight = false,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <tr
      className={`border-b border-[var(--border-default)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--bg-tertiary)]/50 ${
        highlight ? "bg-[var(--color-warning)]/5" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className = "",
  align = "left",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      className={`label-caps px-3 py-2.5 font-semibold ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      } ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = "",
  align = "left",
  mono = false,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
  align?: "left" | "right" | "center";
  mono?: boolean;
}) {
  return (
    <td
      className={`px-3 py-3 ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      } ${mono ? "font-data" : ""} ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
