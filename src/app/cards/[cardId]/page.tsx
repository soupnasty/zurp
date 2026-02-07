export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth-helpers";
import { getBenefitUsageSummaries, getRecentTransactions } from "@/lib/queries";
import { getCardDefinition } from "@/lib/cards";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CreditCard } from "lucide-react";

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const user = await requireAuth();
  const { cardId } = await params;

  const cardDef = getCardDefinition(cardId);
  if (!cardDef) notFound();

  const [benefits, transactions] = await Promise.all([
    getBenefitUsageSummaries(user.id!),
    getRecentTransactions(user.id!),
  ]);

  const cardBenefits = benefits.filter(
    (b) => b.benefitId.startsWith(cardId.replace("chase_sapphire_reserve", "csr"))
  );

  return (
    <div className="p-[var(--space-lg)]">
      {/* Card header */}
      <div className="mb-[var(--space-lg)] flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent)]/10">
          <CreditCard size={28} strokeWidth={1.75} className="text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-h1 font-semibold tracking-tight">
            {cardDef.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            ${cardDef.annualFee}/year &middot;{" "}
            {cardDef.issuer.charAt(0).toUpperCase() + cardDef.issuer.slice(1)}{" "}
            &middot; {cardDef.network.toUpperCase()}
          </p>
        </div>
      </div>

      {/* All benefits */}
      <h2 className="label-caps mb-[var(--space-md)]">All Benefits</h2>
      <div className="space-y-3">
        {cardBenefits.map((b) => (
          <Card key={b.benefitId}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[var(--text-body)] font-semibold text-[var(--text-primary)]">
                  {b.benefitName}
                </h3>
                <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                  {b.cycle} &middot; {b.periodKey}
                </p>
              </div>
              <div className="text-right">
                {b.type === "credit" ? (
                  <p className="font-data font-semibold text-[var(--accent)]">
                    ${b.amountUsed.toFixed(0)} / ${b.creditAmount.toFixed(0)}
                  </p>
                ) : (
                  <Badge variant="neutral">Subscription</Badge>
                )}
              </div>
            </div>
            {b.type === "credit" && (
              <div className="mt-3">
                <ProgressBar value={b.amountUsed} max={b.creditAmount} />
                <div className="mt-1.5 flex justify-between text-[var(--text-caption)] text-[var(--text-secondary)]">
                  <span>${b.amountRemaining.toFixed(0)} remaining</span>
                  <span>{b.daysRemaining}d left</span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
