export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-helpers";
import { OnboardingWizard } from "./_components/OnboardingWizard";
import { getAllCardDefinitions } from "@/lib/cards";

export default async function OnboardingPage() {
  const user = await requireAuth();

  const cards = getAllCardDefinitions();

  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden px-4 md:min-h-screen md:h-auto md:overflow-visible">
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
