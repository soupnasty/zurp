import { requireAuth } from "@/lib/auth-helpers";
import { getCardProfiles } from "@/lib/queries";
import { computeComparison } from "@/lib/points";
import { resolveActiveCard } from "../_lib/resolve-card";
import { CompareTab } from "../_components/CompareTab";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const cardProfilesList = await getCardProfiles(user.id!);
  const activeCard = resolveActiveCard(cardProfilesList, params.card);

  const comparison = await computeComparison(user.id!);

  const serializedComparison = comparison
    ? {
        ...comparison,
        analysisPeriod: {
          start: comparison.analysisPeriod.start.toISOString(),
          end: comparison.analysisPeriod.end.toISOString(),
        },
      }
    : null;

  return (
    <CompareTab
      comparison={serializedComparison}
      activeCardType={activeCard.cardType}
      activeCardName={activeCard.name}
      activeCardFee={activeCard.annualFee}
    />
  );
}
