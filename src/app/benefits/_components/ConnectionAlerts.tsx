import { AlertTriangle, WifiOff, RefreshCw } from "lucide-react";
import type { ConnectionAlert } from "@/lib/notifications";

interface ConnectionAlertsProps {
  alerts: ConnectionAlert[];
}

const alertConfig = {
  stale: {
    icon: RefreshCw,
    borderColor: "border-[var(--color-warning)]",
    bgColor: "bg-[var(--color-warning)]/10",
    textColor: "text-[var(--color-warning)]",
  },
  needs_reauth: {
    icon: AlertTriangle,
    borderColor: "border-[var(--color-danger)]",
    bgColor: "bg-[var(--color-danger)]/10",
    textColor: "text-[var(--color-danger)]",
  },
  disconnected: {
    icon: WifiOff,
    borderColor: "border-[var(--color-danger)]",
    bgColor: "bg-[var(--color-danger)]/10",
    textColor: "text-[var(--color-danger)]",
  },
};

export function ConnectionAlerts({ alerts }: ConnectionAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-[var(--space-sm)]">
      {alerts.map((alert) => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;

        return (
          <div
            key={alert.connectionId}
            className={`flex items-center gap-[var(--space-sm)] rounded-[var(--radius-md)] border ${config.borderColor} ${config.bgColor} px-[var(--space-md)] py-[var(--space-sm)]`}
          >
            <Icon size={16} strokeWidth={1.75} className={config.textColor} />
            <p className={`text-[var(--text-caption)] ${config.textColor}`}>
              {alert.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
