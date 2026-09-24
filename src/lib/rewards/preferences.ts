export const REMINDER_MODES = ["auto", "custom", "off"] as const;
export type ReminderMode = (typeof REMINDER_MODES)[number];

export const MAX_REMINDER_LEAD_DAYS = 90;

export interface PreferenceUpdate {
  benefitIds: string[];
  hidden?: boolean;
  /** True when the user turned the credit on (activation-required credits). */
  activated?: boolean;
  reminderMode?: ReminderMode;
  reminderLeadDays?: number | null;
}

/**
 * Validate a POST /api/benefits/preferences body. `validBenefitIds` are the
 * benefits on the user's card. Returns the update or an error message.
 */
export function parsePreferenceUpdate(
  body: unknown,
  validBenefitIds: ReadonlySet<string>
): { ok: true; update: PreferenceUpdate } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;

  const ids = b.benefitIds;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 10) {
    return { ok: false, error: "benefitIds must list 1–10 benefits" };
  }
  if (!ids.every((id): id is string => typeof id === "string" && validBenefitIds.has(id))) {
    return { ok: false, error: "Unknown benefit for this card" };
  }

  const update: PreferenceUpdate = { benefitIds: ids };

  if (b.hidden !== undefined) {
    if (typeof b.hidden !== "boolean") return { ok: false, error: "hidden must be a boolean" };
    update.hidden = b.hidden;
  }

  if (b.activated !== undefined) {
    if (typeof b.activated !== "boolean") return { ok: false, error: "activated must be a boolean" };
    update.activated = b.activated;
  }

  if (b.reminderMode !== undefined) {
    if (!REMINDER_MODES.includes(b.reminderMode as ReminderMode)) {
      return { ok: false, error: "reminderMode must be auto, custom or off" };
    }
    update.reminderMode = b.reminderMode as ReminderMode;
    if (update.reminderMode === "custom") {
      const lead = b.reminderLeadDays;
      if (typeof lead !== "number" || !Number.isInteger(lead) || lead < 1 || lead > MAX_REMINDER_LEAD_DAYS) {
        return { ok: false, error: `reminderLeadDays must be a whole number from 1 to ${MAX_REMINDER_LEAD_DAYS}` };
      }
      update.reminderLeadDays = lead;
    } else {
      update.reminderLeadDays = null;
    }
  }

  if (update.hidden === undefined && update.activated === undefined && update.reminderMode === undefined) {
    return { ok: false, error: "Nothing to update" };
  }
  return { ok: true, update };
}
