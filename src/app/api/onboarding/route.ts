import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { setLifestyleSelections } from "@/lib/lifestyle-queries";

/**
 * POST /api/onboarding
 * Saves lifestyle selections during onboarding.
 * Uses a regular API route (not a server action) to avoid triggering
 * a server-component re-render of the processing page, which would
 * redirect away due to the lastSyncedAt guard.
 */
export async function POST(req: Request) {
  const user = await requireAuth();
  const { lifestyleKeys } = (await req.json()) as {
    lifestyleKeys: string[];
  };

  if (lifestyleKeys && lifestyleKeys.length > 0) {
    await setLifestyleSelections(user.id!, lifestyleKeys);
  }

  return NextResponse.json({ success: true });
}
