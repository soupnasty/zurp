"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Check, Plus, CreditCard } from "lucide-react";
import { updateCardType } from "@/lib/actions";
import Link from "next/link";

interface CardTypeOption {
  id: string;
  name: string;
}

export interface CardProfileData {
  cardProfileId: string;
  cardType: string;
  cardName: string;
  issuer: string;
  accountMask: string | null;
  issuerCards: CardTypeOption[];
}

interface CardSelectorProps {
  cards: CardProfileData[];
  activeCardId: string;
  collapsed: boolean;
}

export function CardSelector({ cards, activeCardId, collapsed }: CardSelectorProps) {
  const pathname = usePathname();
  const [cardOpen, setCardOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  const activeCard = cards.find((c) => c.cardProfileId === activeCardId) ?? cards[0];
  if (!activeCard) return null;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setCardOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCardSwitch = (cardProfileId: string) => {
    setCardOpen(false);
    const base = pathname.split("?")[0];
    window.location.href = `${base}?cardId=${cardProfileId}`;
  };

  const handleCardTypeChange = async (newCardType: string) => {
    if (newCardType === activeCard.cardType) {
      setTypeOpen(false);
      return;
    }
    setSaving(true);
    try {
      await updateCardType(activeCard.cardProfileId, newCardType);
      setTypeOpen(false);
    } catch {
      // Stay open on error
    } finally {
      setSaving(false);
    }
  };

  // Strip issuer prefix from card type names since the card dropdown already shows it
  const stripIssuer = (name: string) => {
    const issuer = activeCard.issuer.toLowerCase();
    const lower = name.replace(/[®™©]/g, "").toLowerCase().trim();
    return lower.startsWith(issuer)
      ? name.replace(new RegExp(`^${activeCard.issuer}\\s*`, "i"), "").trim()
      : name;
  };

  const activeTypeName = stripIssuer(
    activeCard.issuerCards.find((c) => c.id === activeCard.cardType)?.name ??
    activeCard.cardName
  );

  if (collapsed) {
    return (
      <div className="px-2 py-3 border-b border-[var(--border-default)]">
        <div
          className="flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] p-2"
          title={activeCard.cardName}
        >
          <CreditCard size={16} strokeWidth={1.75} className="text-[var(--accent)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-b border-[var(--border-default)] space-y-2">
      {/* Card account selector */}
      <div ref={cardRef} className="relative">
        <button
          onClick={() => { setCardOpen(!cardOpen); setTypeOpen(false); }}
          className="flex w-full items-center gap-2 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] px-3 py-2 text-left transition-colors hover:bg-[var(--border-default)]"
        >
          <CreditCard size={14} strokeWidth={1.75} className="shrink-0 text-[var(--accent)]" />
          <span className="flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
            {activeCard.issuer}
            {activeCard.accountMask
              ? ` \u00b7\u00b7\u00b7\u00b7 ${activeCard.accountMask}`
              : ""}
          </span>
          <ChevronDown
            size={12}
            strokeWidth={2}
            className={`shrink-0 text-[var(--text-secondary)] transition-transform duration-150 ${
              cardOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {cardOpen && (
          <div className="absolute left-0 right-0 z-50 mt-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] py-1 shadow-lg">
            {cards.map((card) => {
              const isActive = card.cardProfileId === activeCardId;
              return (
                <button
                  key={card.cardProfileId}
                  onClick={() => {
                    if (!isActive) handleCardSwitch(card.cardProfileId);
                    else setCardOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  }`}
                >
                  <span className="flex-1 truncate">
                    {card.issuer}
                    {card.accountMask
                      ? ` \u00b7\u00b7\u00b7\u00b7 ${card.accountMask}`
                      : ""}
                  </span>
                  {isActive && <Check size={14} strokeWidth={2.5} className="shrink-0" />}
                </button>
              );
            })}
            <div className="border-t border-[var(--border-default)] mt-1 pt-1">
              <Link
                href="/onboarding"
                onClick={() => setCardOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              >
                <Plus size={14} strokeWidth={2} className="shrink-0" />
                <span>Add Card</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Card type selector */}
      <div ref={typeRef} className="relative">
        <button
          onClick={() => {
            if (activeCard.issuerCards.length > 1) {
              setTypeOpen(!typeOpen);
              setCardOpen(false);
            }
          }}
          disabled={saving}
          className={`flex w-full items-center gap-2 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] px-3 py-2 text-left transition-colors disabled:opacity-50 ${
            activeCard.issuerCards.length > 1
              ? "hover:bg-[var(--border-default)] cursor-pointer"
              : "cursor-default"
          }`}
        >
          <span className="flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
            {activeTypeName}
          </span>
          {activeCard.issuerCards.length > 1 && (
            <ChevronDown
              size={12}
              strokeWidth={2}
              className={`shrink-0 text-[var(--text-secondary)] transition-transform duration-150 ${
                typeOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {typeOpen && activeCard.issuerCards.length > 1 && (
          <div className="absolute left-0 right-0 z-50 mt-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] py-1 shadow-lg">
            {activeCard.issuerCards.map((type) => {
              const isCurrentType = type.id === activeCard.cardType;
              return (
                <button
                  key={type.id}
                  onClick={() => handleCardTypeChange(type.id)}
                  disabled={saving}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    isCurrentType
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  } disabled:opacity-50`}
                >
                  <span className="flex-1 truncate">{stripIssuer(type.name)}</span>
                  {isCurrentType && <Check size={14} strokeWidth={2.5} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
