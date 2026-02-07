import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--color-void)] hover:opacity-90 focus-visible:ring-[var(--accent)]",
  secondary:
    "border border-[var(--border-default)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus-visible:ring-[var(--text-secondary)]",
  ghost:
    "bg-transparent text-[var(--accent)] hover:bg-[var(--accent-ghost)] focus-visible:ring-[var(--accent)]",
  danger:
    "border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/20 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/30 focus-visible:ring-[var(--color-danger)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[var(--text-caption)] gap-1.5",
  md: "px-4 py-2 text-[var(--text-body)] gap-2",
  lg: "px-5 py-2.5 text-[var(--text-body)] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      loading,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
