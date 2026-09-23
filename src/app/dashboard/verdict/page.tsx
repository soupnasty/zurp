import { requireAuth } from "@/lib/auth-helpers";
import { getCardProfiles } from "@/lib/queries";
import { computeComparison } from "@/lib/points";
import { getUnclassifiedMerchants } from "@/lib/points/overrides";
import { getEarnConfig } from "@/lib/points/earn-configs";
import { getLifestyleSelections } from "@/lib/lifestyle-queries";
import { getIssuerPolicy } from "@/lib/cards/issuer-policies";
import { resolveActiveCard } from "@/lib/resolve-card";
import { VerdictTab } from "../_components/VerdictTab";

export const dynamic = "force-dynamic";

/** The next date the annual fee posts: the coming card anniversary. */
function nextAnniversary(anniversary: Date | null, now = new Date()): Date | null {
  if (!anniversary) return null;
  const month = anniversary.getUTCMonth();
  const day = anniversary.getUTCDate();
  const next = new Date(Date.UTC(now.getUTCFullYear(), month, day));
  if (next <= now) next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

export default async function VerdictPage({
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
    <VerdictTab
      comparison={serializedComparison}
      activeCardType={activeCard.cardType}
      activeCardName={activeCard.name}
      lifestyleKeys={lifestyleKeys}
      syncStatus={activeCard.syncStatus}
      unclassifiedMerchants={unclassifiedMerchants}
      yourPointsCurrency={getEarnConfig(activeCard.cardType)?.pointsCurrency ?? null}
      issuerPolicy={getIssuerPolicy(activeCard.issuer)}
      feePostsAt={nextAnniversary(activeCard.anniversaryDate)?.toISOString() ?? null}
    />
  );
}
