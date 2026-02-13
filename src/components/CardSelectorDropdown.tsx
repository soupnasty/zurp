"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const activeCardId = searchParams.get("card") ?? cardProfiles[0]?.id;
  const activeCard = cardProfiles.find((c) => c.id === activeCardId) ?? cardProfiles[0];

  // Total items: cards + "Add another card" button
  const totalItems = cardProfiles.length + 1;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Reset focus index when opening
  useEffect(() => {
    if (open) {
      const activeIndex = cardProfiles.findIndex((c) => c.id === activeCardId);
      setFocusedIndex(activeIndex >= 0 ? activeIndex : 0);
    }
  }, [open, activeCardId, cardProfiles]);

  function selectCard(id: string) {
    setOpen(false);
    setFocusedIndex(-1);
    if (id !== activeCardId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("card", id);
      router.push(`${pathname}?${params.toString()}`);
    }
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
          return;
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % totalItems);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < cardProfiles.length) {
            selectCard(cardProfiles[focusedIndex].id);
          } else if (focusedIndex === cardProfiles.length) {
            setOpen(false);
            setFocusedIndex(-1);
            router.push("/onboarding");
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setFocusedIndex(-1);
          triggerRef.current?.focus();
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(totalItems - 1);
          break;
      }
    },
    [open, focusedIndex, totalItems, cardProfiles, activeCardId, pathname, searchParams, router]
  );

  // Scroll focused item into view
  useEffect(() => {
    if (open && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[role='option'], [data-add-card]");
      items[focusedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, open]);

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

  const listboxId = "card-selector-listbox";

  return (
    <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && focusedIndex >= 0
            ? focusedIndex < cardProfiles.length
              ? `card-option-${cardProfiles[focusedIndex].id}`
              : "card-option-add"
            : undefined
        }
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
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Select a card"
          className="absolute left-0 top-full z-50 mt-1 w-full min-w-[220px] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-lg"
        >
          {cardProfiles.map((card, i) => {
            const isActive = card.id === activeCardId;
            const isFocused = i === focusedIndex;
            return (
              <button
                key={card.id}
                id={`card-option-${card.id}`}
                role="option"
                aria-selected={isActive}
                onClick={() => selectCard(card.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-card-hover)] ${
                  isActive ? "bg-[rgba(34,211,238,0.04)]" : ""
                } ${isFocused ? "outline outline-2 outline-[var(--color-accent-cyan)] -outline-offset-2" : ""}`}
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
              id="card-option-add"
              data-add-card
              role="option"
              aria-selected={false}
              onClick={() => {
                setOpen(false);
                router.push("/onboarding");
              }}
              className={`flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--color-accent-cyan)] transition-colors hover:bg-[var(--bg-card-hover)] ${
                focusedIndex === cardProfiles.length
                  ? "outline outline-2 outline-[var(--color-accent-cyan)] -outline-offset-2"
                  : ""
              }`}
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
