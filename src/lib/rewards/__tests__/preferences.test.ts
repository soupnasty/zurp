import { describe, it, expect } from "vitest";
import { parsePreferenceUpdate } from "../preferences";

const VALID = new Set(["dd_a", "dd_b", "lyft"]);

describe("parsePreferenceUpdate", () => {
  it("accepts hiding a grouped row", () => {
    expect(parsePreferenceUpdate({ benefitIds: ["dd_a", "dd_b"], hidden: true }, VALID)).toEqual({
      ok: true,
      update: { benefitIds: ["dd_a", "dd_b"], hidden: true },
    });
  });

  it("accepts a custom reminder with a lead time", () => {
    expect(parsePreferenceUpdate({ benefitIds: ["lyft"], reminderMode: "custom", reminderLeadDays: 5 }, VALID)).toEqual({
      ok: true,
      update: { benefitIds: ["lyft"], reminderMode: "custom", reminderLeadDays: 5 },
    });
  });

  it("accepts turning a credit on", () => {
    expect(parsePreferenceUpdate({ benefitIds: ["lyft"], activated: true }, VALID)).toEqual({
      ok: true,
      update: { benefitIds: ["lyft"], activated: true },
    });
  });

  it("clears the lead time for auto and off", () => {
    const r = parsePreferenceUpdate({ benefitIds: ["lyft"], reminderMode: "off", reminderLeadDays: 5 }, VALID);
    expect(r).toEqual({ ok: true, update: { benefitIds: ["lyft"], reminderMode: "off", reminderLeadDays: null } });
  });

  it.each([
    [{ benefitIds: [] , hidden: true }, "benefitIds"],
    [{ benefitIds: ["other_card_benefit"], hidden: true }, "Unknown benefit"],
    [{ benefitIds: ["lyft"], hidden: "yes" }, "hidden"],
    [{ benefitIds: ["lyft"], reminderMode: "weekly" }, "reminderMode"],
    [{ benefitIds: ["lyft"], reminderMode: "custom" }, "reminderLeadDays"],
    [{ benefitIds: ["lyft"], reminderMode: "custom", reminderLeadDays: 0 }, "reminderLeadDays"],
    [{ benefitIds: ["lyft"], reminderMode: "custom", reminderLeadDays: 2.5 }, "reminderLeadDays"],
    [{ benefitIds: ["lyft"], reminderMode: "custom", reminderLeadDays: 91 }, "reminderLeadDays"],
    [{ benefitIds: ["lyft"] }, "Nothing to update"],
    [null, "Invalid body"],
  ])("rejects %j", (body, message) => {
    const r = parsePreferenceUpdate(body, VALID);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(message);
  });
});
