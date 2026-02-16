"use client";

import { useState, useCallback } from "react";
import { Info, Circle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { LIFESTYLE_GROUPS } from "@/lib/lifestyle-keys";
import type { BenefitAssumptionMode } from "@/lib/points/types";

interface BenefitAssumptionToggleProps {
  mode: BenefitAssumptionMode;
  onChange: (mode: BenefitAssumptionMode) => void;
  lifestyleKeys: string[];
  onLifestyleChange: (keys: string[]) => Promise<void>;
}

const OPTIONS: {
  value: BenefitAssumptionMode;
  label: string;
  sub: string;
}[] = [
  { value: "proven", label: "Proven", sub: "transaction-matched" },
  { value: "my_picks", label: "My Lifestyle", sub: "your picks + proven" },
  { value: "all_credits", label: "Full Value", sub: "assume all used" },
];

function LucideIcon({ name, size = 16 }: { name: string; size?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as any;
  const Icon = icons[name];
  if (!Icon)
    return <Circle size={size} style={{ color: "rgba(255,255,255,0.85)" }} />;
  return <Icon size={size} style={{ color: "rgba(255,255,255,0.85)" }} />;
}

const BENEFITS_TIP_CONTENT = (
  <div className="space-y-2 text-[11px] text-[var(--text-secondary)]">
    <p><span className="font-semibold text-[var(--text-primary)]">Proven</span> — Only counts benefits matched to real transactions on your statement.</p>
    <p><span className="font-semibold text-[var(--text-primary)]">My Lifestyle</span> — Includes your proven benefits plus credits you&apos;d likely use based on your lifestyle picks.</p>
    <p><span className="font-semibold text-[var(--text-primary)]">Full Value</span> — Assumes every available benefit credit is fully used.</p>
  </div>
);


export function BenefitAssumptionToggle({
  mode,
  onChange,
  lifestyleKeys,
  onLifestyleChange,
}: BenefitAssumptionToggleProps) {
  const [showTip, setShowTip] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(lifestyleKeys));
  const [saving, setSaving] = useState(false);

  const toggle = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleOpen = useCallback(() => {
    setSelected(new Set(lifestyleKeys));
    setEditOpen(true);
  }, [lifestyleKeys]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onLifestyleChange(Array.from(selected));
    } finally {
      setSaving(false);
      setEditOpen(false);
    }
  }, [selected, onLifestyleChange]);

  return (
    <div>
      <div className="flex items-center mb-2.5">
        <span
          className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Benefits mode
        </span>
        {/* Desktop: hover tooltip */}
        <div
          className="relative ml-1.5 hidden md:block"
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
        >
          <Info
            size={12}
            strokeWidth={2}
            className="cursor-help text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
          />
          {showTip && (
            <div className="absolute left-1/2 bottom-full z-50 mb-2 w-[280px] -translate-x-1/2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-3 shadow-lg">
              <p
                className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--text-secondary)] mb-2"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                How benefits are counted
              </p>
              {BENEFITS_TIP_CONTENT}
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[var(--bg-elevated)]" />
            </div>
          )}
        </div>
        {/* Mobile: tap opens modal */}
        <button
          className="ml-1.5 md:hidden"
          onClick={() => setShowInfoModal(true)}
          aria-label="How benefits are counted"
        >
          <Info
            size={12}
            strokeWidth={2}
            className="text-[var(--text-dim)]"
          />
        </button>
        <button
          onClick={handleOpen}
          className="flex items-center transition-colors ml-auto"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.5px",
            color: "rgba(167,139,250,0.6)",
            background: "transparent",
            border: "1px solid rgba(167,139,250,0.15)",
            borderRadius: 6,
            cursor: "pointer",
            padding: "2px 8px",
          }}
        >
          edit picks
        </button>
      </div>
      <div className="flex w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1">
        {OPTIONS.map((opt) => {
          const active = mode === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="relative flex-1 rounded-lg px-3 py-1.5 transition-all duration-200"
              style={{
                background: active ? "rgba(167,139,250,0.08)" : "transparent",
                border: active
                  ? "1px solid rgba(167,139,250,0.15)"
                  : "1px solid transparent",
              }}
            >
              <span
                className="block text-[11px] font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: active
                    ? "var(--color-accent-purple)"
                    : "var(--text-secondary)",
                }}
              >
                {opt.label}
              </span>
              <span
                className="hidden md:block text-[9px] mt-0.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  color: active ? "rgba(167,139,250,0.6)" : "var(--text-dim)",
                }}
              >
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile info modal */}
      <Modal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="How benefits are counted"
      >
        {BENEFITS_TIP_CONTENT}
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit your benefit picks"
      >
        <p
          style={{
            fontSize: 15,
            color: "var(--text-secondary)",
            marginBottom: 28,
            lineHeight: 1.5,
          }}
        >
          This helps us estimate benefit value for My Picks mode.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            maxHeight: "50vh",
            overflowY: "auto",
            paddingRight: 4,
            marginBottom: 24,
          }}
        >
          {LIFESTYLE_GROUPS.map((group) => (
            <div key={group.key}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: "var(--text-secondary)",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                {group.label}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {group.items.map((item) => {
                  const isSelected = selected.has(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggle(item.key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 18px",
                        borderRadius: 12,
                        border: isSelected
                          ? "1px solid rgba(34,211,238,0.3)"
                          : "1px solid var(--border-subtle)",
                        background: isSelected
                          ? "rgba(34,211,238,0.06)"
                          : "var(--bg-card)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        color: isSelected
                          ? "var(--color-accent-cyan)"
                          : "var(--text-secondary)",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <LucideIcon name={item.iconSlug} size={20} />
                      </span>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 28px",
            width: "100%",
            background: "var(--accent)",
            color: "var(--bg-primary)",
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            borderRadius: 12,
            cursor: saving ? "wait" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {saving ? "Saving..." : `Save (${selected.size} selected)`}
        </button>
      </Modal>
    </div>
  );
}
