import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface CountdownTimerProps {
  benefitName: string;
  daysRemaining: number;
  amountRemaining: number;
}

export function CountdownTimer({
  benefitName,
  daysRemaining,
  amountRemaining,
}: CountdownTimerProps) {
  const color =
    daysRemaining <= 7
      ? "var(--color-danger)"
      : daysRemaining <= 14
        ? "var(--color-warning)"
        : "var(--color-success)";

  const urgencyClass =
    daysRemaining <= 7
      ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5"
      : daysRemaining <= 14
        ? "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5"
        : "";

  return (
    <Card className={urgencyClass}>
      <div className="flex items-center gap-3">
        <Clock size={20} strokeWidth={1.75} style={{ color }} />
        <div>
          <p className="text-[var(--text-body)] text-[var(--text-primary)]">
            <span className="font-data font-semibold" style={{ color }}>
              ${amountRemaining.toFixed(0)}
            </span>{" "}
            in <span className="font-semibold">{benefitName}</span> credits
            {daysRemaining <= 1
              ? " expire today"
              : ` expire in ${daysRemaining} days`}
          </p>
        </div>
      </div>
    </Card>
  );
}
