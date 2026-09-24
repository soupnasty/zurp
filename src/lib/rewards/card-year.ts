import { getCurrentCycleBounds } from "@/lib/engine/cycle-utils";
import type { CardYear } from "./types";

/**
 * The card year containing `now`: anniversary to the day before the next
 * one. Without an anniversary date, falls back to the calendar year — the
 * same fallback the engine uses for annual_anniversary credits.
 */
export function getCardYear(
  anniversaryDate: Date | null,
  now: Date = new Date()
): CardYear {
  const { cycleStart, cycleEnd } = getCurrentCycleBounds(
    "annual_anniversary",
    now,
    anniversaryDate
  );
  return { start: cycleStart, end: cycleEnd, estimated: !anniversaryDate };
}
