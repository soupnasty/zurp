export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-helpers";
import { OnboardingWizard } from "./_components/OnboardingWizard";
import { getAllCardDefinitions } from "@/lib/cards";

export default async function OnboardingPage() {
  const user = await requireAuth();

  const cards = getAllCardDefinitions();

  return (
    <div className="flex min-h-dvh items-center justify-center overflow-y-auto px-4 py-6">
      <div className="w-full max-w-lg">
        <OnboardingWizard
          userId={user.id!}
          cards={cards.map((c) => ({
            id: c.id,
            name: c.name,
            issuer: c.issuer,
            annualFee: c.annualFee,
          }))}
        />
      </div>
    </div>
  );
}
