export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { getCardProfiles } from "@/lib/queries";
import { resolveActiveCard } from "@/lib/resolve-card";
import { CardYearStep } from "./_components/CardYearStep";

/**
 * Last onboarding step: confirm the card anniversary we detected from the
 * annual-fee charge, or ask for it when we couldn't find one. Skipped for
 * no-fee cards and when the user already set it.
 */
export default async function CardYearPage() {
  const user = await requireAuth();
  const profiles = await getCardProfiles(user.id!);
  if (profiles.length === 0) redirect("/onboarding");
  const card = resolveActiveCard(profiles, undefined);

  if (card.annualFee === 0 || card.anniversarySource === "user_provided") {
    redirect("/dashboard/verdict");
  }

  const detected = card.anniversarySource === "auto_detected" && card.anniversaryDate ? card.anniversaryDate.toISOString() : null;

  return (
    <div className="flex min-h-dvh items-center justify-center overflow-y-auto px-4 py-6">
      <div className="w-full max-w-lg">
        <CardYearStep cardProfileId={card.id} cardName={card.name} annualFee={card.annualFee} detectedAt={detected} />
      </div>
    </div>
  );
}
