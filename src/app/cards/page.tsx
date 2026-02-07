export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { redirect } from "next/navigation";
import { getCardDefinition } from "@/lib/cards";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CreditCard } from "lucide-react";

export default async function CardsPage() {
  const user = await requireAuth();

  const userCards = await db.query.userCards.findMany({
    where: eq(schema.userCards.userId, user.id!),
    with: { card: true },
  });

  // If user has exactly one card, go straight to its detail page
  if (userCards.length === 1) {
    redirect(`/cards/${userCards[0].cardId}`);
  }

  // If no cards, redirect to onboarding
  if (userCards.length === 0) {
    redirect("/onboarding");
  }

  return (
    <div className="p-[var(--space-lg)]">
      <h1 className="text-h1 font-semibold tracking-tight">Your Cards</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Manage your tracked credit cards.
      </p>

      <div className="mt-[var(--space-lg)] space-y-3">
        {userCards.map((uc) => {
          const cardDef = getCardDefinition(uc.cardId);
          return (
            <Link key={uc.id} href={`/cards/${uc.cardId}`}>
              <Card className="flex items-center gap-4 transition-colors hover:border-[var(--accent)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent)]/10">
                  <CreditCard
                    size={24}
                    strokeWidth={1.75}
                    className="text-[var(--accent)]"
                  />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {cardDef?.name ?? uc.card.name}
                  </p>
                  <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                    ${cardDef?.annualFee ?? uc.card.annualFee}/year
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
