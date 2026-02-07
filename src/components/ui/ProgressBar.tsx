interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  color?: "accent" | "success" | "warning" | "danger";
}

const colorMap = {
  accent: "bg-[var(--accent)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  danger: "bg-[var(--color-danger)]",
};

export function ProgressBar({
  value,
  max = 100,
  className = "",
  color,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  // Auto-color based on percentage if no color specified
  const resolvedColor =
    color ??
    (percent >= 100 ? "success" : percent >= 50 ? "accent" : percent >= 25 ? "warning" : "danger");

  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-default)] ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={`h-full rounded-full transition-all duration-[var(--duration-default)] ease-[var(--ease-default)] ${colorMap[resolvedColor]}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
