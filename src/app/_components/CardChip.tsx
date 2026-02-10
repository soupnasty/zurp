const CARDS = {
  csr: {
    issuer: "Chase",
    name: "Sapphire Reserve",
    bg: "linear-gradient(145deg, #1a1f3a 0%, #0d1129 40%, #1e2651 100%)",
    glow: "rgba(90,100,200,0.15)",
    issuerColor: "#c5cbe8",
    nameColor: "#e0e4f5",
  },
  csp: {
    issuer: "Chase",
    name: "Sapphire Preferred",
    bg: "linear-gradient(145deg, #0f2a4a 0%, #0a1c33 40%, #143d5e 100%)",
    glow: "rgba(40,120,200,0.12)",
    issuerColor: "#a0c4e0",
    nameColor: "#c8dff0",
  },
  gold: {
    issuer: "American Express",
    name: "Gold Card",
    bg: "linear-gradient(145deg, #3d3520 0%, #2a2415 40%, #4a4028 100%)",
    glow: "rgba(200,170,80,0.12)",
    issuerColor: "#c4b07a",
    nameColor: "#e0d0a0",
  },
  plat: {
    issuer: "American Express",
    name: "Platinum Card",
    bg: "linear-gradient(145deg, #2e2e34 0%, #1c1c22 40%, #3a3a42 100%)",
    glow: "rgba(180,180,200,0.1)",
    issuerColor: "#b0b0b8",
    nameColor: "#d4d4dc",
  },
  ventx: {
    issuer: "Capital One",
    name: "Venture X",
    bg: "linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 40%, #262626 100%)",
    glow: "rgba(255,255,255,0.06)",
    issuerColor: "#a0a0a0",
    nameColor: "#d0d0d0",
  },
  strata: {
    issuer: "Citi",
    name: "Strata Elite",
    bg: "linear-gradient(145deg, #0a2a3d 0%, #061c2a 40%, #103850 100%)",
    glow: "rgba(60,160,220,0.1)",
    issuerColor: "#7ab8d8",
    nameColor: "#a0d4ee",
  },
} as const;

export type CardChipId = keyof typeof CARDS;

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

export function CardChip({ cardId }: { cardId: CardChipId }) {
  const card = CARDS[cardId];

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
        {card.issuer}
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
export const MARQUEE_CARDS: CardChipId[] = [
  "csr",
  "csp",
  "gold",
  "plat",
  "ventx",
  "strata",
];
