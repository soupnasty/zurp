"use client";

import { useState, useCallback } from "react";
import { LIFESTYLE_GROUPS } from "@/lib/lifestyle-keys";
import * as LucideIcons from "lucide-react";

interface LifestylePickerProps {
  onComplete: (selectedKeys: string[]) => void;
}

/** Dynamically resolve a Lucide icon by name. */
function LucideIcon({ name, size = 20 }: { name: string; size?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as any;
  const Icon = icons[name];
  if (!Icon) return <LucideIcons.Circle size={size} />;
  return <Icon size={size} />;
}

/** Brand icon from Simple Icons CDN. */
function BrandIcon({ slug, size = 20 }: { slug: string; size?: number }) {
  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}/ffffff`}
      alt=""
      width={size}
      height={size}
      style={{ opacity: 0.85 }}
      loading="lazy"
    />
  );
}

export function LifestylePicker({ onComplete }: LifestylePickerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
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

  const handleContinue = useCallback(() => {
    setSaving(true);
    onComplete(Array.from(selected));
  }, [selected, onComplete]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: 580,
        padding: "0 16px",
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontSize: "clamp(22px, 4vw, 32px)",
          fontWeight: 700,
          textAlign: "left",
          color: "var(--text-primary)",
          marginBottom: 10,
          width: "100%",
          lineHeight: 1.25,
        }}
      >
        If a card gave you free credits, what would you actually use?
      </h2>
      <p
        style={{
          fontSize: 15,
          color: "var(--text-secondary)",
          textAlign: "left",
          marginBottom: 32,
          width: "100%",
          lineHeight: 1.5,
        }}
      >
        This helps us estimate benefit value for cards you don&apos;t have yet.
      </p>

      {/* Groups */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          marginBottom: 32,
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
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
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
                      {item.iconType === "brand" ? (
                        <BrandIcon slug={item.iconSlug} size={20} />
                      ) : (
                        <LucideIcon name={item.iconSlug} size={20} />
                      )}
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

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={saving}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "14px 32px",
          minWidth: 200,
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
        {saving
          ? "Saving..."
          : selected.size === 0
          ? "Skip for now"
          : `Continue (${selected.size} selected)`}
      </button>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-dim)",
          marginTop: 12,
        }}
      >
        These can be changed anytime
      </span>
    </div>
  );
}
