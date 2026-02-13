export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getCardDefinition } from "@/lib/cards";
import { getAllEarnConfigs } from "@/lib/points/earn-configs";
import { ProcessingReveal } from "./_components/ProcessingReveal";

export default async function ProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ connectionId?: string; cardType?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const { connectionId, cardType } = params;

  if (!connectionId || !cardType) {
    redirect("/onboarding");
  }

  // Validate connection belongs to user
  const connection = await db.query.plaidConnections.findFirst({
    where: eq(schema.plaidConnections.id, connectionId),
  });

  if (!connection || connection.userId !== user.id!) {
    redirect("/onboarding");
  }

  // Already-synced guard: skip processing if sync already ran
  if (connection.lastSyncedAt) {
    redirect("/dashboard");
  }

  // Get card metadata
  const card = getCardDefinition(cardType);
  if (!card) {
    redirect("/onboarding");
  }

  const totalCards = getAllEarnConfigs().length;

  return (
    <ProcessingReveal
      userId={user.id!}
      connectionId={connectionId}
      cardType={cardType}
      benefitCount={card.benefits.length}
      totalCards={totalCards}
    />
  );
}
