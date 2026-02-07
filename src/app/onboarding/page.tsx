export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "./_components/OnboardingWizard";
import { getAllCardDefinitions } from "@/lib/cards";

export default async function OnboardingPage() {
  const user = await requireAuth();

  // Check if user already has a card set up
  const existingCard = await db.query.userCards.findFirst({
    where: eq(schema.userCards.userId, user.id!),
  });

  if (existingCard) {
    redirect("/dashboard");
  }

  const cards = getAllCardDefinitions();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
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
