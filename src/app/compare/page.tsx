import { requireAuth } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getCardProfiles } from "@/lib/queries";
import {
  computeComparison,
  PERK_SECTIONS,
  CARD_REFERENCE_LINKS,
} from "@/lib/points";
import { CompareContent } from "./_components/CompareContent";
import { BenefitMatrix } from "./_components/BenefitMatrix";
import { CardSourceLinks } from "./_components/CardSourceLinks";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const user = await requireAuth();

  const cardProfiles = await getCardProfiles(user.id!);
  if (cardProfiles.length === 0) {
    redirect("/onboarding");
  }

  const comparison = await computeComparison(user.id!);

  // Empty state: no data or < 1 month
  if (!comparison) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <h1 className="text-h1 font-semibold text-[var(--text-primary)] mb-6">
          Compare Cards
        </h1>
        <Card>
          <div className="py-12 text-center">
            <p className="text-[var(--text-h3)] font-medium text-[var(--text-primary)] mb-2">
              Not enough data yet
            </p>
            <p className="text-[var(--text-body)] text-[var(--text-secondary)] max-w-md mx-auto">
              Connect your card for at least a month to see how it compares
              against other cards for your actual spending.
            </p>
          </div>
        </Card>

        <div className="mt-6">
          <Card>
            <BenefitMatrix
              sections={PERK_SECTIONS}
              usersCardId={cardProfiles[0].cardType}
              cardOrder={CARD_REFERENCE_LINKS.map((c) => c.cardId)}
              cardNames={Object.fromEntries(
                CARD_REFERENCE_LINKS.map((c) => [c.cardId, c.cardName])
              )}
            />
            <CardSourceLinks links={CARD_REFERENCE_LINKS} />
          </Card>
        </div>
      </div>
    );
  }

  const { cards, categoryBreakdown, monthCount, totalSpend, totalTransactions } =
    comparison;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <CompareContent
        cards={cards}
        categoryBreakdown={categoryBreakdown}
        monthCount={monthCount}
        totalSpend={totalSpend}
        totalTransactions={totalTransactions}
        perkSections={PERK_SECTIONS}
        cardLinks={CARD_REFERENCE_LINKS}
      />
    </div>
  );
}
