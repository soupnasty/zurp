import { requireAuth } from "@/lib/auth-helpers";
import { getCardProfiles } from "@/lib/queries";
import { computeComparison } from "@/lib/points";
import { getUnclassifiedMerchants } from "@/lib/points/overrides";
import { getLifestyleSelections } from "@/lib/lifestyle-queries";
import { resolveActiveCard } from "@/lib/resolve-card";
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

  const [comparison, lifestyleKeys, unclassifiedMerchants] = await Promise.all([
    computeComparison(user.id!),
    getLifestyleSelections(user.id!),
    getUnclassifiedMerchants(user.id!),
  ]);

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
      lifestyleKeys={lifestyleKeys}
      syncStatus={activeCard.syncStatus}
      unclassifiedMerchants={unclassifiedMerchants}
    />
  );
}
