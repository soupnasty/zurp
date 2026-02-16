import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { setLifestyleSelections } from "@/lib/lifestyle-queries";
import { getRevealData } from "@/app/onboarding/actions";

/**
 * POST /api/onboarding
 * Saves lifestyle selections and returns reveal data in one call.
 * Uses a regular API route (not a server action) to avoid triggering
 * a server-component re-render of the processing page, which would
 * redirect away due to the lastSyncedAt guard.
 */
export async function POST(req: Request) {
  const user = await requireAuth();
  const { lifestyleKeys } = (await req.json()) as {
    lifestyleKeys: string[];
  };

  // Save lifestyle selections (if any)
  if (lifestyleKeys && lifestyleKeys.length > 0) {
    await setLifestyleSelections(user.id!, lifestyleKeys);
  }

  // Fetch reveal data
  const reveal = await getRevealData(user.id!);

  return NextResponse.json({ reveal });
}
