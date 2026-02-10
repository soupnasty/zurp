import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success:
    "bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/25",
  warning:
    "bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/25",
  danger:
    "bg-[var(--color-danger)]/15 text-[var(--color-danger)] border-[var(--color-danger)]/25",
  info: "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/25",
  neutral:
    "bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-default)]",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-[var(--text-caption)] font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
