"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { CardSimulation, CategoryWinner } from "@/lib/points/types";
import type { PerkSection, CardReferenceLinks } from "@/lib/points/perk-matrix";
import { TotalValueChart } from "./TotalValueChart";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { BenefitMatrix } from "./BenefitMatrix";
import { CardSourceLinks } from "./CardSourceLinks";

interface CompareContentProps {
  cards: CardSimulation[];
  categoryBreakdown: CategoryWinner[];
  monthCount: number;
  totalSpend: number;
  totalTransactions: number;
  portalMode: boolean;
  perkSections: PerkSection[];
  cardLinks: CardReferenceLinks[];
}

function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export function CompareContent({
  cards,
  categoryBreakdown,
  monthCount,
  totalSpend,
  totalTransactions,
  portalMode,
  perkSections,
  cardLinks,
}: CompareContentProps) {
  const [activeTab, setActiveTab] = useState<"value" | "categories" | "perks">(
    "value"
  );
  const router = useRouter();
  const pathname = usePathname();

  const usersCard = cards.find((c) => c.isUsersCard)!;
  const sorted = [...cards].sort((a, b) => b.netActual - a.netActual);
  const bestCard = sorted[0];
  const userWins = usersCard.cardId === bestCard.cardId;
  const nextBestAlt = sorted.find((c) => c.cardId !== usersCard.cardId);

  // Win: margin over next best alternative
  // Lose: how much more the best card earns vs user's card
  const margin = userWins
    ? usersCard.netActual - (nextBestAlt?.netActual ?? 0)
    : bestCard.netActual - usersCard.netActual;

  const tabs = [
    { id: "value" as const, label: "Total Value" },
    { id: "categories" as const, label: "By Category" },
    { id: "perks" as const, label: "Benefits & Perks" },
  ];

  const cardOrder = cards.map((c) => c.cardId);
  const cardNames = Object.fromEntries(
    cards.map((c) => [c.cardId, c.cardName])
  );
  const cardFees = Object.fromEntries(
    cards.map((c) => [c.cardId, c.annualFee])
  );
  const cardBenefitsTotal = Object.fromEntries(
    cards.map((c) => [c.cardId, c.benefitsValue])
  );

  // Filter to only compared cards and match their order
  const orderedLinks = cardOrder
    .map((id) => cardLinks.find((l) => l.cardId === id))
    .filter(Boolean) as typeof cardLinks;

  function handlePortalToggle() {
    const next = !portalMode;
    const url = next ? `${pathname}?portal=true` : pathname;
    router.push(url);
  }

  const disclaimer = (
    <p className="hidden md:block mt-4 text-[12px] text-[var(--text-secondary)]/60 leading-relaxed">
      Points valued at conservative rates (Chase UR: 1.25¢, Amex MR: 1.0¢, Citi TP: 1.0¢).
      Transfer partner redemptions can yield higher value.
      {" "}Your card shows benefits actually captured; other cards show benefits simulated from your spending history.
    </p>
  );

  return (
    <>
      {/* Headline */}
      <div className="pb-8 border-b border-[var(--border-default)]">
        <h1 className="text-[28px] font-bold text-[var(--text-primary)] leading-tight mb-2.5 tracking-tight">
          {userWins ? (
            <>
              Your {usersCard.cardName} earned you{" "}
              <span className="text-[var(--color-success)]">
                {formatDollars(usersCard.netActual)}
              </span>{" "}
              in net value
            </>
          ) : (
            <>
              The{" "}
              {bestCard.cardName}{" "}
              could earn you up to{" "}
              <span className="text-[var(--color-success)]">
                {formatDollars(margin)} more
              </span>
            </>
          )}
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          {userWins
            ? `That's ${formatDollars(margin)} more than the next best card. Based on ${formatDollars(totalSpend)} in spending over ${monthCount} month${monthCount !== 1 ? "s" : ""}.`
            : `Based on your ${formatDollars(totalSpend)} in spending over ${monthCount} month${monthCount !== 1 ? "s" : ""}, you'd earn ${formatDollars(margin)} more with the ${bestCard.cardName}.`}
        </p>
      </div>

      {/* Tab Navigation + Portal Toggle */}
      <div className="flex items-center justify-between py-4 border-b border-[var(--border-default)]">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-[var(--radius-md)] text-[14px] font-medium transition-colors duration-[var(--duration-fast)] ${
                activeTab === tab.id
                  ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Portal Mode Toggle */}
        <button
          onClick={handlePortalToggle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] text-[13px] font-medium transition-colors duration-[var(--duration-fast)] border ${
            portalMode
              ? "border-[var(--color-signal)] text-[var(--color-signal)] bg-[var(--color-signal)]/10"
              : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
          }`}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: portalMode ? "var(--color-signal)" : "var(--text-muted)" }}
          />
          Portal booking
        </button>
      </div>

      {/* Portal mode note */}
      {portalMode && (
        <div className="mt-3 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-signal)]/5 border border-[var(--color-signal)]/20 text-[13px] text-[var(--text-secondary)] leading-relaxed">
          Assumes all travel booked through each card's portal.
          Flights, hotels, and other travel earn portal rates for all cards.
        </div>
      )}

      {/* Tab Content */}
      <div className="pt-6">
        {activeTab === "value" && (
          <>
            <TotalValueChart
              cards={cards}
              bestCardId={bestCard.cardId}
              monthCount={monthCount}
            />

            {disclaimer}

            <CardSourceLinks links={orderedLinks} />
          </>
        )}

        {activeTab === "categories" && (
          <>
            <CategoryBreakdown
              categories={categoryBreakdown}
              cards={cards}
            />

            {disclaimer}

            <CardSourceLinks links={orderedLinks} />
          </>
        )}

        {activeTab === "perks" && (
          <>
            <BenefitMatrix
              sections={perkSections}
              usersCardId={usersCard.cardId}
              cardOrder={cardOrder}
              cardNames={cardNames}
              cardFees={cardFees}
              cardBenefitsTotal={cardBenefitsTotal}
            />

            {disclaimer}

            <CardSourceLinks links={orderedLinks} />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-5 border-t border-[var(--border-default)] text-[12px] text-[var(--text-secondary)]/50 leading-relaxed">
        Based on {monthCount} month{monthCount !== 1 ? "s" : ""} of transaction
        data {" · "} {totalTransactions.toLocaleString()} transactions {" · "}{" "}
        {formatDollars(totalSpend)} total spend
        {portalMode && " · Portal booking mode"}
        <br />
        zurp shows the math — you make the call. No affiliate links. No card
        recommendations.
      </div>
    </>
  );
}
