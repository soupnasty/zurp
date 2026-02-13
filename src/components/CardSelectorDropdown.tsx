"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Check, Plus } from "lucide-react";

interface CardProfile {
  id: string;
  cardType: string;
  name: string;
  annualFee: number;
}

interface CardSelectorDropdownProps {
  cardProfiles: CardProfile[];
  collapsed?: boolean;
}

export function CardSelectorDropdown({
  cardProfiles,
  collapsed = false,
}: CardSelectorDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeCardId = searchParams.get("card") ?? cardProfiles[0]?.id;
  const activeCard = cardProfiles.find((c) => c.id === activeCardId) ?? cardProfiles[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  function selectCard(id: string) {
    setOpen(false);
    if (id !== activeCardId) {
      // Preserve current pathname, update card param
      const params = new URLSearchParams(searchParams.toString());
      params.set("card", id);
      router.push(`${pathname}?${params.toString()}`);
    }
  }

  // Collapsed: green dot indicator only
  if (collapsed) {
    return (
      <div className="flex justify-center px-3 py-2" title={activeCard?.name}>
        <span
          className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]"
          style={{ opacity: 0.6 }}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)]"
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-success)]"
          style={{ opacity: 0.6 }}
        />
        <span className="min-w-0 flex-1 truncate text-left">{activeCard?.name}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`shrink-0 text-[var(--text-secondary)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[220px] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-lg">
          {cardProfiles.map((card, i) => {
            const isActive = card.id === activeCardId;
            return (
              <button
                key={card.id}
                onClick={() => selectCard(card.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-card-hover)] ${
                  isActive ? "bg-[rgba(34,211,238,0.04)]" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate text-sm font-semibold ${
                      isActive ? "text-[var(--color-accent-cyan)]" : "text-[var(--text-primary)]"
                    }`}
                  >
                    {card.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>
                    {card.annualFee > 0 ? `$${card.annualFee}/yr fee` : "$0 fee"}
                    {" \u00b7 "}
                    #{i + 1}
                  </div>
                </div>
                {isActive && (
                  <Check size={16} strokeWidth={2} className="shrink-0 text-[var(--color-accent-cyan)]" />
                )}
              </button>
            );
          })}

          <div className="border-t border-[var(--border-subtle)]">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/onboarding");
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--color-accent-cyan)] transition-colors hover:bg-[var(--bg-card-hover)]"
            >
              <Plus size={14} strokeWidth={2} />
              Add another card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
