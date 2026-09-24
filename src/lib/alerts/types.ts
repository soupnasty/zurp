import type { BenefitCycle } from "@/lib/types";

export type AlertType =
  | "credit_expiring"
  | "renewal_verdict"
  | "connection_broken";

export type AlertSeverity = "action" | "notice" | "report";

export type AlertState = "active" | "resolved" | "dismissed" | "expired";

/**
 * A candidate emitted by a pure generator. The orchestrator upserts it
 * by (userId, dedupKey); `payload.stage` changing re-badges the alert
 * (readAt reset) without creating a duplicate.
 */
export interface AlertCandidate {
  type: AlertType;
  dedupKey: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  effectiveAt: Date;
  expiresAt: Date | null;
  cardProfileId: string | null;
}

/** One benefit (or display group) in its current period. */
export interface CreditGroupState {
  /** displayGroup ?? benefitId — stable across periods. */
  key: string;
  name: string;
  cycle: BenefitCycle;
  periodKey: string;
  remaining: number;
  cycleEnd: Date;
  /**
   * Whether each of the most recent COMPLETED periods was fully used,
   * newest first. Drives habit suppression.
   */
  recentFullUse: boolean[];
  /** The user's reminder choice for this credit; absent means auto. */
  reminder?: ReminderPreference;
}

/** Stored per benefit in benefit_preferences. */
export interface BenefitPreference {
  hidden: boolean;
  reminderMode: string;
  reminderLeadDays: number | null;
}

/** Resolved for one alert group. */
export interface ReminderPreference {
  mode: "auto" | "custom" | "off";
  leadDays: number | null;
}

export interface ConnectionState {
  id: string;
  institutionName: string | null;
  status: string;
}
