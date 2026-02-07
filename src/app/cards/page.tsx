export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { redirect } from "next/navigation";
import { getCardDefinition } from "@/lib/cards";
import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";
import { RemoveCardButton } from "./_components/RemoveCardButton";

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

      <div className="mt-[var(--space-lg)] flex flex-col gap-4">
        <Link
          href="/onboarding"
          className="flex items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-[var(--space-md)] text-[var(--text-body)] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <Plus size={18} strokeWidth={1.75} />
          Add Card
        </Link>
        {userCards.map((uc) => {
          const cardDef = getCardDefinition(uc.cardId);
          return (
            <div
              key={uc.id}
              className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-md)]"
            >
              <Link
                href={`/cards/${uc.cardId}`}
                className="flex flex-1 items-center gap-4 transition-colors"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent)]/10">
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
              </Link>
              <RemoveCardButton userCardId={uc.id} cardName={cardDef?.name ?? uc.card.name} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
