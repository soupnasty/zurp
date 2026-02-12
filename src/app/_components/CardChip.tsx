import { CARD_VISUALS, type CardVisualId } from "@/lib/card-visuals";
import { ISSUER_LOGOS } from "@/components/issuer-logos";

/** EMV chip icon — shared across all card chips */
function EmvChip() {
  return (
    <svg
      viewBox="0 0 26 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute"
      style={{ width: 32, height: 24, top: 14, left: 16 }}
    >
      <rect
        x="0.5"
        y="0.5"
        width="25"
        height="19"
        rx="3"
        fill="url(#emv)"
        stroke="rgba(255,255,255,0.12)"
      />
      <rect
        x="8"
        y="0.5"
        width="10"
        height="19"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
      />
      <line x1="8" y1="7" x2="0.5" y2="7" stroke="rgba(255,255,255,0.1)" />
      <line x1="8" y1="13" x2="0.5" y2="13" stroke="rgba(255,255,255,0.1)" />
      <line x1="18" y1="7" x2="25.5" y2="7" stroke="rgba(255,255,255,0.1)" />
      <line x1="18" y1="13" x2="25.5" y2="13" stroke="rgba(255,255,255,0.1)" />
      <line x1="13" y1="0.5" x2="13" y2="7" stroke="rgba(255,255,255,0.08)" />
      <line
        x1="13"
        y1="13"
        x2="13"
        y2="19.5"
        stroke="rgba(255,255,255,0.08)"
      />
      <defs>
        <linearGradient id="emv" x1="0" y1="0" x2="26" y2="20">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export { type CardVisualId };

export function CardChip({ cardId }: { cardId: CardVisualId }) {
  const card = CARD_VISUALS[cardId];
  const LogoComponent = ISSUER_LOGOS[card.issuer];

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl flex flex-col justify-end"
      style={{
        width: 200,
        height: 125,
        padding: "14px 16px",
        background: card.bg,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        fontFamily: "'DM Sans', 'Inter', sans-serif",
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${card.glow} 0%, transparent 70%)`,
        }}
      />

      <EmvChip />

      {/* Issuer logo */}
      {LogoComponent && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: 8,
            right: 10,
            width: 32,
            height: 32,
            color: card.issuerColor,
            opacity: 0.15,
          }}
        >
          <LogoComponent />
        </div>
      )}

      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: card.issuerColor,
          opacity: 0.7,
          marginBottom: 2,
        }}
      >
        {card.issuerLabel}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.01em",
          lineHeight: 1.2,
          color: card.nameColor,
        }}
      >
        {card.name}
      </div>
    </div>
  );
}

/** All card IDs in marquee order */
export const MARQUEE_CARDS: CardVisualId[] = [
  "chase_sapphire_reserve",
  "chase_sapphire_preferred",
  "amex_gold",
  "amex_platinum",
  "capital_one_venture_x",
  "citi_strata_elite",
];
