import Link from "next/link";
import { MobileNav } from "./_components/MobileNav";
import { ScrollReveal } from "./_components/ScrollReveal";
import {
  CardChip,
  MARQUEE_CARDS,
  MARQUEE_CARDS_T2,
} from "./_components/CardChip";
import { AnimatedMockup } from "./_components/AnimatedMockup";
import { CountUp } from "./_components/CountUp";

/* ── Tracker mockup rows ── */
const trackerRows = [
  {
    icon: "plane",
    name: "Travel Credit",
    detail: "Resets on anniversary",
    used: "$300",
    total: "$300",
    pct: 100,
    status: "full" as const,
  },
  {
    icon: "ticket",
    name: "StubHub",
    detail: "$60 remaining \u00b7 resets Jul 1",
    used: "$90",
    total: "$150",
    pct: 60,
    status: "partial" as const,
  },
  {
    icon: "utensils",
    name: "Exclusive Tables",
    detail: "$150 remaining \u00b7 resets Jul 1",
    used: "$150",
    total: "$300",
    pct: 50,
    status: "partial" as const,
  },
  {
    icon: "bag",
    name: "DoorDash",
    detail: "$25/mo \u00b7 resets in 8 days",
    used: "$25",
    total: "$25",
    pct: 100,
    status: "full" as const,
  },
  {
    icon: "car",
    name: "Lyft",
    detail: "$10/mo \u00b7 resets in 8 days",
    used: "$10",
    total: "$10",
    pct: 100,
    status: "full" as const,
  },
  {
    icon: "bike",
    name: "Peloton",
    detail: "$10/mo \u00b7 never used",
    used: "$0",
    total: "$10",
    pct: 0,
    status: "unused" as const,
  },
];

/* ── SVG icons for tracker rows ── */
function TrackerIcon({
  icon,
  status,
}: {
  icon: string;
  status: "full" | "partial" | "unused";
}) {
  const colorMap = {
    full: {
      bg: "rgba(52,211,153,0.08)",
      border: "rgba(52,211,153,0.12)",
      color: "#34d399",
    },
    partial: {
      bg: "rgba(248,113,113,0.08)",
      border: "rgba(248,113,113,0.12)",
      color: "#f87171",
    },
    unused: {
      bg: "rgba(255,255,255,0.03)",
      border: "rgba(255,255,255,0.06)",
      color: "#4a5568",
    },
  };
  const c = colorMap[status];
  const svgProps = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const icons: Record<string, React.ReactNode> = {
    plane: (
      <svg {...svgProps}>
        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    ),
    ticket: (
      <svg {...svgProps}>
        <path d="M2 7a2 2 0 012-2h16a2 2 0 012 2v3a2 2 0 100 4v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3a2 2 0 100-4V7z" />
        <path d="M9 5v2" />
        <path d="M9 11v2" />
        <path d="M9 17v2" />
      </svg>
    ),
    utensils: (
      <svg {...svgProps}>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 00-5 5v6h3a2 2 0 012 2z" />
        <path d="M18 15v7" />
      </svg>
    ),
    bag: (
      <svg {...svgProps}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    car: (
      <svg {...svgProps}>
        <path d="M19 17h2l.64-2.54a6 6 0 00-1.22-5.63L18 6H6L3.58 8.83a6 6 0 00-1.22 5.63L3 17h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path d="M9 17h6" />
      </svg>
    ),
    bike: (
      <svg {...svgProps}>
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path
          d="M15 6a1 1 0 100-2 1 1 0 000 2z"
          fill="currentColor"
          stroke="none"
        />
        <path d="M12 17.5V14l-3-3 4-3 2 3h3" />
      </svg>
    ),
  };
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      {icons[icon]}
    </div>
  );
}

/* ── Compare card rows ──
   Grid layout: 32px rank | 1fr body (stacked bar + legend) | 90px net.
   Segments use flex proportions matching real dollar values.
   #1 gets green treatment, #3 gets "YOUR CARD" tag. */
const compareCards = [
  {
    rank: 1,
    name: "Robinhood Gold Card",
    fee: "$0/yr fee",
    tag: "best" as const,
    segments: [{ flex: 1, label: "Points $1,273", type: "points" as const }],
    legend: [
      { color: "#60a5fa", text: "Points $1,273" },
      { color: "#a78bfa", text: "Benefits $0" },
      { color: "#f87171", text: "Fee $0" },
    ],
    net: "+$1,273",
    top: true,
    locked: false,
  },
  {
    rank: 2,
    name: "Amex Gold",
    fee: "$325/yr fee",
    tag: null,
    segments: [
      { flex: 656, label: "Points $656", type: "points" as const },
      { flex: 304, label: "~$304", type: "benefits" as const },
      { flex: 325, label: "-$325", type: "fees" as const },
    ],
    legend: [
      { color: "#60a5fa", text: "Points $656" },
      { color: "#a78bfa", text: "Benefits ~$304" },
      { color: "#f87171", text: "Fee -$325" },
    ],
    net: "+$635",
    top: false,
    locked: false,
  },
  {
    rank: 3,
    name: "Sapphire Reserve",
    fee: "$795/yr fee",
    tag: "yours" as const,
    segments: [
      { flex: 838, label: "Points $838", type: "points" as const },
      { flex: 475, label: "$475", type: "benefits" as const },
      { flex: 795, label: "-$795", type: "fees" as const },
    ],
    legend: [
      { color: "#60a5fa", text: "Points $838" },
      { color: "#a78bfa", text: "Benefits $475" },
      { color: "#f87171", text: "Fee -$795" },
    ],
    net: "+$518",
    top: false,
    locked: false,
  },
];

/* ── Insight examples ── */
const insightCards = [
  {
    variant: "blue" as const,
    typeLabel: "Redirect spending",
    body: (
      <>
        You spent <strong className="font-bold text-white">$87 on Uber</strong>{" "}
        last month but only used{" "}
        <span className="font-bold" style={{ color: "#60a5fa" }}>
          $10
        </span>{" "}
        of your monthly Lyft credit. Switch your rides to Lyft to capture the
        full{" "}
        <span className="font-bold" style={{ color: "#60a5fa" }}>
          $120/yr
        </span>
        .
      </>
    ),
    savingsValue: "$120",
    savingsLabel: "per year in unused credit",
    meta: "Chase Sapphire Reserve \u00b7 Lyft credit",
  },
  {
    variant: "red" as const,
    typeLabel: "Credit expiring",
    body: (
      <>
        You&apos;ve only used{" "}
        <span className="font-bold" style={{ color: "#f87171" }}>
          $5
        </span>{" "}
        of your{" "}
        <strong className="font-bold text-white">$25 DoorDash credit</strong>{" "}
        &mdash;{" "}
        <span className="font-bold" style={{ color: "#f87171" }}>
          3 days
        </span>{" "}
        left to use the rest. Order now or lose $20.
      </>
    ),
    savingsValue: "$20",
    savingsLabel: "expiring in 3 days",
    meta: "Chase Sapphire Reserve \u00b7 Monthly credit",
  },
  {
    variant: "green" as const,
    typeLabel: "ROI milestone",
    body: (
      <>
        You&apos;ve captured{" "}
        <span className="font-bold" style={{ color: "#34d399" }}>
          $970
        </span>{" "}
        of $2,700 in benefits this year. Your net value is{" "}
        <span className="font-bold" style={{ color: "#34d399" }}>
          +$175
        </span>{" "}
        after the annual fee &mdash; your card is paying for itself.
      </>
    ),
    savingsValue: "+$175",
    savingsLabel: "net value after $795 fee",
    meta: "Chase Sapphire Reserve \u00b7 Annual value",
  },
];

/* ── Insight variant colors ── */
const insightVariants = {
  blue: {
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.15)",
    glow: "rgba(96,165,250,0.25)",
  },
  red: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.15)",
    glow: "rgba(248,113,113,0.25)",
  },
  green: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.15)",
    glow: "rgba(52,211,153,0.25)",
  },
};

/* ── Insight SVG icons ── */
function InsightIcon({ variant }: { variant: "blue" | "red" | "green" }) {
  const v = insightVariants[variant];
  const svgProps = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const icons = {
    blue: (
      <svg {...svgProps}>
        <path d="M18 8L22 12L18 16" />
        <path d="M2 12H22" />
        <path d="M6 16L2 12L6 8" />
      </svg>
    ),
    red: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    green: (
      <svg {...svgProps}>
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
  };
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[10px]"
      style={{
        width: 36,
        height: 36,
        background: v.bg,
        border: `1px solid ${v.border}`,
        color: v.color,
      }}
    >
      {icons[variant]}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ════════ NAV ════════ */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[var(--bg-primary)] sm:bg-[var(--bg-primary)]/80 backdrop-blur-[20px] border-b border-[var(--border-default)]/50">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <svg width="32" height="24" viewBox="0 0 46 36" fill="none">
              <rect
                x="2"
                y="2"
                width="42"
                height="30"
                rx="5"
                fill="#0a0e17"
                stroke="#22d3ee"
                strokeWidth="1.5"
              />
              <clipPath id="lp-t">
                <rect x="8" y="9" width="30" height="6" rx="3" />
              </clipPath>
              <g clipPath="url(#lp-t)">
                <rect x="8" y="9" width="18" height="6" fill="#60a5fa" />
                <rect x="26" y="9" width="6.5" height="6" fill="#a78bfa" />
                <rect x="32.5" y="9" width="5.5" height="6" fill="#f87171" />
              </g>
              <clipPath id="lp-b">
                <rect x="8" y="19" width="30" height="6" rx="3" />
              </clipPath>
              <g clipPath="url(#lp-b)">
                <rect
                  x="8"
                  y="19"
                  width="5.5"
                  height="6"
                  fill="#f87171"
                  opacity="0.5"
                />
                <rect
                  x="13.5"
                  y="19"
                  width="6.5"
                  height="6"
                  fill="#a78bfa"
                  opacity="0.5"
                />
                <rect
                  x="20"
                  y="19"
                  width="18"
                  height="6"
                  fill="#60a5fa"
                  opacity="0.5"
                />
              </g>
            </svg>
            <span
              className="text-xl font-bold text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-space-mono)",
                letterSpacing: "0",
              }}
            >
              zurp
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#compare"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Compare
            </a>
            <a
              href="#how"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              How it works
            </a>
            <a
              href="#track"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Track
            </a>
            <a
              href="#insights"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Insights
            </a>
            <Link
              href="/login"
              className="rounded-lg px-[18px] py-2 text-sm font-semibold transition-all"
              style={{
                background: "rgba(34,211,238,0.1)",
                color: "#22d3ee",
                border: "1px solid rgba(34,211,238,0.2)",
              }}
            >
              Get started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <MobileNav />
        </div>
      </nav>

      {/* ════════ HERO ════════ */}
      <section className="relative pt-40 pb-24 text-center">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-[-200px] left-1/2 h-[600px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(96,165,250,0.08)_0%,transparent_70%)]" />

        <div className="mx-auto max-w-[1080px] px-6">
          <h1
            className="mx-auto mb-6 text-[clamp(40px,6vw,68px)] font-bold leading-[1.08] animate-[fadeUp_0.6s_ease_0.15s_both]"
            style={{ letterSpacing: "-2px" }}
          >
            Know what your
            <br />
            card is{" "}
            <span className="bg-gradient-to-r from-[#60a5fa] via-[#22d3ee] to-[#34d399] bg-clip-text text-transparent">
              actually
            </span>{" "}
            worth
            <span
              className="block mt-2 font-medium text-[var(--text-secondary)]"
              style={{ fontSize: "0.65em", letterSpacing: "-1px" }}
            >
              &mdash; and which card beats it.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-[600px] text-lg leading-relaxed text-[var(--text-secondary)] animate-[fadeUp_0.6s_ease_0.3s_both]">
            Zurp simulates your real spending across{" "}
            <strong className="font-medium text-[var(--text-primary)]">
              30 top cards
            </strong>{" "}
            &mdash; factoring in points, perks, and fees &mdash; to find your
            best fit.
          </p>

          <div className="mb-3 flex flex-col items-center justify-center gap-4 sm:flex-row animate-[fadeUp_0.6s_ease_0.4s_both]">
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-[14px] px-9 py-4 text-base font-semibold transition-all hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, #60a5fa, #22d3ee)",
                color: "#0a0e17",
              }}
            >
              <span className="relative z-[1]">zurp your card</span>
              <span className="relative z-[1] transition-transform group-hover:translate-x-[3px]">
                &rarr;
              </span>
              {/* Hover gradient overlay */}
              <span
                className="absolute inset-0 rounded-[14px] opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: "linear-gradient(135deg, #22d3ee, #34d399)",
                }}
              />
            </Link>
          </div>

          <p className="text-[13px] text-[var(--text-secondary)] animate-[fadeUp_0.6s_ease_0.4s_both]">
            Free to use. Secure, read-only connection{" "}
            <a
              href="https://plaid.com/what-is-plaid/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors"
            >
              via Plaid
            </a>
            .
          </p>
        </div>
      </section>

      {/* ════════ CARD MARQUEE STRIPS ════════ */}
      <div className="relative overflow-hidden py-10">
        {/* Fade edges */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-[2] w-20 bg-gradient-to-r from-[var(--bg-primary)] to-transparent" />
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 z-[2] w-20 bg-gradient-to-l from-[var(--bg-primary)] to-transparent" />

        {/* Tier 1 — left to right */}
        <div className="marquee-track flex w-max items-center">
          {[...MARQUEE_CARDS, ...MARQUEE_CARDS].map((cardId, i) => (
            <div key={i} className="mr-6">
              <CardChip cardId={cardId} />
            </div>
          ))}
        </div>

        {/* Tier 2 — right to left */}
        <div className="marquee-track-reverse mt-6 flex w-max items-center">
          {[...MARQUEE_CARDS_T2, ...MARQUEE_CARDS_T2].map((cardId, i) => (
            <div key={i} className="mr-6">
              <CardChip cardId={cardId} />
            </div>
          ))}
        </div>
      </div>

      {/* ════════ COMPARE SECTION ════════ */}
      <section className="py-24" id="compare">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-4 text-center">Compare</p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-4 text-center font-bold leading-[1.1]"
              style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                letterSpacing: "-2px",
              }}
            >
              See what you&apos;d gain &mdash; or lose &mdash;
              <br className="hidden sm:block" />
              on another card.
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p
              className="mx-auto mb-12 max-w-[540px] text-center leading-relaxed text-[var(--text-secondary)]"
              style={{ fontSize: "clamp(15px, 1.6vw, 18px)" }}
            >
              Based on your real spending, zurp calculates the exact dollar
              difference if you switched cards. No guesswork, no affiliate bias.
            </p>
          </ScrollReveal>

          <AnimatedMockup className="relative mx-auto max-w-[900px] overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#111827] px-3 py-5 sm:p-8">
            {/* Top edge glow */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(52,211,153,0.3), rgba(96,165,250,0.3), transparent)",
              }}
            />

            {/* Personalized header */}
            <div
              className="mb-6 pb-5 px-2 sm:px-0 border-b border-[rgba(255,255,255,0.06)]"
              style={{
                opacity: 0,
                animation: "mock-fade-in 0.6s ease forwards",
                animationDelay: "0.2s",
                animationPlayState: "var(--play)",
              }}
            >
              <h3
                className="text-[18px] sm:text-[22px] font-bold mb-1.5"
                style={{ letterSpacing: "-0.5px" }}
              >
                The <span className="text-white">Robinhood Gold Card</span>{" "}
                could save you{" "}
                <CountUp
                  target={755}
                  prefix="$"
                  delay={2800}
                  duration={1400}
                  style={{ color: "#34d399" }}
                />
                /yr
              </h3>
              <div className="text-[14px]" style={{ color: "#4a5568" }}>
                Based on your{" "}
                <span className="font-medium" style={{ color: "#7a8ba8" }}>
                  $47,411
                </span>{" "}
                in spending over the last 12 months
              </div>
            </div>

            {/* Card rows */}
            <div className="flex flex-col">
              {compareCards.map((card, i) => {
                const rowDelay = 0.5 + i * 0.3;
                const barDelay = 0.8 + i * 0.3;
                const legendDelay = barDelay + 0.8;
                const netDelay = barDelay + 0.6;
                const segColors = {
                  points: "#60a5fa",
                  benefits: "#a78bfa",
                  fees: "#f87171",
                };
                return (
                  <div
                    key={card.rank}
                    className="compare-row-grid rounded-[14px] transition-colors"
                    style={
                      {
                        opacity: card.locked ? 0.3 : 0,
                        animation: card.locked
                          ? undefined
                          : "mock-row-enter 0.5s ease forwards",
                        animationDelay: card.locked
                          ? undefined
                          : `${rowDelay}s`,
                        animationPlayState: "var(--play)",
                        ...(card.top
                          ? {
                              background: "rgba(52,211,153,0.035)",
                              border: "1px solid rgba(52,211,153,0.08)",
                            }
                          : {}),
                        ...(!card.top && !card.locked && i > 0
                          ? { borderTop: "1px solid rgba(255,255,255,0.06)" }
                          : {}),
                        ...(card.top ? { marginBottom: 4 } : {}),
                      } as React.CSSProperties
                    }
                  >
                    {/* Rank */}
                    <div
                      style={{
                        fontFamily: "var(--font-space-mono)",
                        fontSize: 14,
                        fontWeight: 700,
                        color: card.top ? "#34d399" : "#4a5568",
                        textAlign: "center",
                      }}
                    >
                      {card.rank}
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-2.5 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                          <span
                            className={
                              card.locked ? "blur-[5px] select-none" : ""
                            }
                          >
                            {card.name}
                          </span>
                          {card.tag === "best" && (
                            <span
                              className="mock-badge inline-flex px-2 py-[2px] rounded-[5px] text-[9px] font-bold uppercase tracking-[0.8px]"
                              style={{
                                background: "rgba(52,211,153,0.1)",
                                color: "#34d399",
                                animationDelay: `${rowDelay + 0.4}s`,
                                animationPlayState: "var(--play)",
                              }}
                            >
                              Best fit
                            </span>
                          )}
                          {card.tag === "yours" && (
                            <span
                              className="mock-badge inline-flex px-2 py-[2px] rounded-[5px] text-[9px] font-bold uppercase tracking-[0.8px]"
                              style={{
                                background: "rgba(34,211,238,0.1)",
                                color: "#22d3ee",
                                animationDelay: `${rowDelay + 0.4}s`,
                                animationPlayState: "var(--play)",
                              }}
                            >
                              Your card
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stacked bar */}
                      <div className="flex h-[30px] overflow-hidden rounded-[7px] bg-[rgba(255,255,255,0.02)]">
                        {card.segments.map((seg, si) => (
                          <div
                            key={si}
                            className="flex items-center justify-center overflow-hidden whitespace-nowrap"
                            style={
                              {
                                flex: seg.flex,
                                background: card.locked
                                  ? "rgba(255,255,255,0.06)"
                                  : segColors[seg.type],
                                color:
                                  seg.type === "fees"
                                    ? "rgba(255,255,255,0.9)"
                                    : "#0a0e17",
                                fontFamily: "var(--font-space-mono)",
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "0 8px",
                                width: 0,
                                animation: card.locked
                                  ? undefined
                                  : "mock-fill-bar 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
                                animationDelay: `${barDelay + si * 0.15}s`,
                                animationPlayState: "var(--play)",
                                "--fill": `${seg.flex}`,
                              } as React.CSSProperties
                            }
                          >
                            {card.locked ? "" : seg.label}
                          </div>
                        ))}
                      </div>

                      {/* Legend */}
                      <div
                        className="flex flex-wrap gap-4"
                        style={{
                          opacity: card.locked ? 1 : 0,
                          animation: card.locked
                            ? undefined
                            : "mock-fade-in 0.4s ease forwards",
                          animationDelay: `${legendDelay}s`,
                          animationPlayState: "var(--play)",
                          ...(card.locked
                            ? {
                                filter: "blur(4px)",
                                userSelect: "none" as const,
                              }
                            : {}),
                        }}
                      >
                        {card.legend.map((item, li) => (
                          <span
                            key={li}
                            className="flex items-center gap-1.5 text-[11px]"
                            style={{ color: "#4a5568" }}
                          >
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-sm shrink-0"
                              style={{ background: item.color }}
                            />
                            {item.text}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Net value */}
                    <div className="hidden sm:flex flex-col items-end gap-px text-right">
                      <div
                        className={card.locked ? "blur-[6px] select-none" : ""}
                        style={{
                          fontFamily: "var(--font-space-mono)",
                          fontSize: 17,
                          fontWeight: 700,
                          color: card.top ? "#34d399" : "#7a8ba8",
                          opacity: card.locked ? 1 : 0,
                          animation: card.locked
                            ? undefined
                            : "mock-net-reveal 0.5s ease forwards",
                          animationDelay: `${netDelay}s`,
                          animationPlayState: "var(--play)",
                        }}
                      >
                        {card.net}
                      </div>
                      <div className="text-[10px]" style={{ color: "#4a5568" }}>
                        net / year
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Formula legend */}
            <div
              className="flex items-center justify-center gap-4 sm:gap-[18px] flex-wrap pt-3.5 mt-4 border-t border-[rgba(255,255,255,0.06)] text-[11px]"
              style={{
                fontFamily: "var(--font-space-mono)",
                color: "#4a5568",
                opacity: 0,
                animation: "mock-fade-in 0.4s ease forwards",
                animationDelay: "3.0s",
                animationPlayState: "var(--play)",
              }}
            >
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-[7px] h-[7px] rounded-sm bg-[#60a5fa]" />
                Points earned
              </span>
              <span className="font-bold text-[13px]">+</span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-[7px] h-[7px] rounded-sm bg-[#a78bfa]" />
                Benefits used
              </span>
              <span className="font-bold text-[13px]">&minus;</span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-[7px] h-[7px] rounded-sm bg-[#f87171]" />
                Annual fee
              </span>
              <span className="font-bold text-[13px]">=</span>
              <span className="font-semibold" style={{ color: "#7a8ba8" }}>
                Net value
              </span>
            </div>

            {/* Footer */}
            <div
              className="flex items-start justify-between gap-6 pt-4 mt-5 border-t border-[rgba(255,255,255,0.06)]"
              style={{
                opacity: 0,
                animation: "mock-fade-in 0.5s ease forwards",
                animationDelay: "3.2s",
                animationPlayState: "var(--play)",
              }}
            >
              <div
                className="text-[12px] leading-relaxed max-w-[580px]"
                style={{ color: "#4a5568" }}
              >
                Points valued conservatively. Transfer partner redemptions can
                yield higher value. Your card shows benefits actually captured;
                other cards show benefits simulated from your spending history.
              </div>
              <Link
                href="/login"
                className="flex items-center gap-2 text-[13px] font-medium shrink-0 whitespace-nowrap transition-colors hover:opacity-80"
                style={{ color: "#22d3ee" }}
              >
                See all 30 cards
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </AnimatedMockup>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="py-24" id="how">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-5 text-center">How it works</p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-5 text-center font-bold leading-[1.1]"
              style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                letterSpacing: "-2px",
              }}
            >
              Connect once. We&nbsp;do&nbsp;the&nbsp;math.
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p
              className="mx-auto mb-16 max-w-[520px] text-center leading-relaxed text-[var(--text-secondary)]"
              style={{ fontSize: "clamp(15px, 1.6vw, 18px)" }}
            >
              Read-only access to your transactions. We simulate every card,
              track every benefit, and surface what you&apos;re missing.
            </p>
          </ScrollReveal>

          <AnimatedMockup
            className="grid gap-5 md:grid-cols-3 items-stretch"
            style={{ maxWidth: 1000, margin: "0 auto" }}
          >
            {/* Step 1: Link your card */}
            <div
              className="relative flex flex-col overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#111827]"
              style={{
                opacity: 0,
                transform: "translateY(30px)",
                animation: "fadeUp 0.7s ease forwards",
                animationDelay: "0.45s",
                animationPlayState: "var(--play)",
              }}
            >
              {/* Top edge glow */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(34,211,238,0.15), transparent)",
                }}
              />
              <div
                className="px-6 pt-5"
                style={{
                  fontFamily: "var(--font-space-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#4a5568",
                }}
              >
                01
              </div>

              {/* Plaid preview */}
              <div className="flex-1 px-5 py-5">
                <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[var(--bg-primary)] px-6 py-10 flex flex-col items-center justify-center gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Card icon */}
                    <div
                      className="flex items-center justify-center rounded-md"
                      style={{
                        width: 48,
                        height: 32,
                        background: "#1a2236",
                        border: "1px solid rgba(96,165,250,0.2)",
                        opacity: 0,
                        transform: "translateX(-12px)",
                        animation: "hiw-slide-right 0.5s ease forwards",
                        animationDelay: "0.9s",
                        animationPlayState: "var(--play)",
                      }}
                    >
                      <svg
                        width="24"
                        height="16"
                        viewBox="0 0 24 16"
                        fill="none"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="23"
                          height="15"
                          rx="2.5"
                          stroke="#60a5fa"
                          strokeWidth="1"
                          fill="none"
                          opacity="0.4"
                        />
                        <rect
                          x="3"
                          y="4"
                          width="8"
                          height="2"
                          rx="1"
                          fill="#60a5fa"
                          opacity="0.3"
                        />
                        <rect
                          x="3"
                          y="8"
                          width="5"
                          height="2"
                          rx="1"
                          fill="#60a5fa"
                          opacity="0.2"
                        />
                        <circle
                          cx="18"
                          cy="10"
                          r="2"
                          fill="#60a5fa"
                          opacity="0.25"
                        />
                      </svg>
                    </div>
                    {/* Arrow */}
                    <span
                      style={{
                        color: "#4a5568",
                        fontSize: 16,
                        opacity: 0,
                        animation: "hiw-fade-in 0.4s ease forwards",
                        animationDelay: "1.1s",
                        animationPlayState: "var(--play)",
                      }}
                    >
                      &rarr;
                    </span>
                    {/* Shield */}
                    <div
                      className="flex items-center justify-center rounded-[10px]"
                      style={{
                        width: 40,
                        height: 40,
                        background: "rgba(34,211,238,0.08)",
                        border: "1px solid rgba(34,211,238,0.15)",
                        opacity: 0,
                        transform: "translateX(12px)",
                        animation: "hiw-slide-left 0.5s ease forwards",
                        animationDelay: "1.0s",
                        animationPlayState: "var(--play)",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline
                          points="9 12 11 14 15 10"
                          strokeWidth="2"
                          style={{
                            strokeDasharray: 20,
                            strokeDashoffset: 20,
                            animation: "hiw-draw-check 0.4s ease forwards",
                            animationDelay: "1.4s",
                            animationPlayState: "var(--play)",
                          }}
                        />
                      </svg>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-space-mono)",
                      fontSize: 10,
                      color: "#4a5568",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      opacity: 0,
                      animation: "hiw-fade-in 0.5s ease forwards",
                      animationDelay: "1.3s",
                      animationPlayState: "var(--play)",
                    }}
                  >
                    Read-only via Plaid
                  </div>
                </div>
              </div>

              <div className="mt-auto px-6 pb-6">
                <div
                  className="text-[18px] font-bold mb-2"
                  style={{ letterSpacing: "-0.3px" }}
                >
                  Link your card
                </div>
                <div
                  className="text-[14px] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Secure, read-only access to your transactions. We never see
                  your card number, login, or balance.
                </div>
              </div>
            </div>

            {/* Step 2: We simulate 30 cards */}
            <div
              className="relative flex flex-col overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#111827]"
              style={{
                opacity: 0,
                transform: "translateY(30px)",
                animation: "fadeUp 0.7s ease forwards",
                animationDelay: "0.6s",
                animationPlayState: "var(--play)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(34,211,238,0.15), transparent)",
                }}
              />
              <div
                className="px-6 pt-5"
                style={{
                  fontFamily: "var(--font-space-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#4a5568",
                }}
              >
                02
              </div>

              {/* Mini simulation */}
              <div className="flex-1 px-5 py-5">
                <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[var(--bg-primary)] p-4 flex flex-col gap-2">
                  {[
                    {
                      rank: 1,
                      segs: [
                        { flex: 18, color: "#60a5fa" },
                        { flex: 5, color: "#a78bfa" },
                        { flex: 4, color: "#f87171" },
                      ],
                      net: "+$1,273",
                      top: true,
                      dim: false,
                    },
                    {
                      rank: 2,
                      segs: [
                        { flex: 14, color: "#60a5fa" },
                        { flex: 6, color: "#a78bfa" },
                        { flex: 7, color: "#f87171" },
                      ],
                      net: "+$635",
                      top: false,
                      dim: false,
                    },
                    {
                      rank: 3,
                      segs: [
                        { flex: 16, color: "#60a5fa" },
                        { flex: 3, color: "#a78bfa" },
                        { flex: 14, color: "#f87171" },
                      ],
                      net: "+$518",
                      top: false,
                      dim: false,
                    },
                    {
                      rank: 4,
                      segs: [
                        { flex: 12, color: "#60a5fa" },
                        { flex: 4, color: "#a78bfa" },
                        { flex: 10, color: "#f87171" },
                      ],
                      net: "+$412",
                      top: false,
                      dim: true,
                    },
                  ].map((row, i) => (
                    <div key={row.rank} className="flex items-center gap-2.5">
                      <div
                        style={{
                          fontFamily: "var(--font-space-mono)",
                          fontSize: 10,
                          fontWeight: 700,
                          color: row.top ? "#34d399" : "#4a5568",
                          width: 16,
                          textAlign: "center",
                          flexShrink: 0,
                        }}
                      >
                        {row.rank}
                      </div>
                      <div className="flex-1 flex h-3.5 overflow-hidden rounded bg-[rgba(255,255,255,0.02)]">
                        {row.segs.map((seg, si) => (
                          <div
                            key={si}
                            style={{
                              flex: seg.flex,
                              height: "100%",
                              background: seg.color,
                              opacity: row.dim ? 0.35 : 1,
                              transformOrigin: "left",
                              transform: "scaleX(0)",
                              animation: "hiw-bar-grow 0.7s ease forwards",
                              animationDelay: `${1.0 + i * 0.15}s`,
                              animationPlayState: "var(--play)",
                              borderRadius:
                                si === 0
                                  ? "4px 0 0 4px"
                                  : si === row.segs.length - 1
                                  ? "0 4px 4px 0"
                                  : undefined,
                            }}
                          />
                        ))}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-space-mono)",
                          fontSize: 10,
                          fontWeight: 700,
                          color: row.top ? "#34d399" : "var(--text-secondary)",
                          width: 44,
                          textAlign: "right",
                          flexShrink: 0,
                          opacity: 0,
                          animation: row.dim
                            ? `hiw-fade-dim 0.4s ease forwards`
                            : "hiw-fade-in 0.4s ease forwards",
                          animationDelay: `${1.5 + i * 0.1}s`,
                          animationPlayState: "var(--play)",
                        }}
                      >
                        {row.net}
                      </div>
                    </div>
                  ))}
                  {/* Footer label */}
                  <div
                    className="flex items-center justify-between pt-1.5 mt-1 border-t border-[rgba(255,255,255,0.06)]"
                    style={{
                      opacity: 0,
                      animation: "hiw-fade-in 0.4s ease forwards",
                      animationDelay: "1.9s",
                      animationPlayState: "var(--play)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-space-mono)",
                        fontSize: 9,
                        color: "#4a5568",
                      }}
                    >
                      Your spending &times; 30 cards
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-space-mono)",
                        fontSize: 9,
                        color: "#22d3ee",
                      }}
                    >
                      30 simulated
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto px-6 pb-6">
                <div
                  className="text-[18px] font-bold mb-2"
                  style={{ letterSpacing: "-0.3px" }}
                >
                  We simulate 30 cards
                </div>
                <div
                  className="text-[14px] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Every transaction replayed across 30 top cards &mdash;
                  factoring in points, benefits, and fees &mdash; ranked by net
                  value.
                </div>
              </div>
            </div>

            {/* Step 3: We track your benefits */}
            <div
              className="relative flex flex-col overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#111827]"
              style={{
                opacity: 0,
                transform: "translateY(30px)",
                animation: "fadeUp 0.7s ease forwards",
                animationDelay: "0.75s",
                animationPlayState: "var(--play)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(34,211,238,0.15), transparent)",
                }}
              />
              <div
                className="px-6 pt-5"
                style={{
                  fontFamily: "var(--font-space-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#4a5568",
                }}
              >
                03
              </div>

              {/* Mini benefits */}
              <div className="flex-1 px-5 py-5">
                <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[var(--bg-primary)] p-4 flex flex-col gap-2.5">
                  {/* Header */}
                  <div
                    className="flex items-baseline justify-between"
                    style={{
                      opacity: 0,
                      animation: "hiw-fade-in 0.5s ease forwards",
                      animationDelay: "1.1s",
                      animationPlayState: "var(--play)",
                    }}
                  >
                    <div className="text-[14px] font-bold">
                      <span
                        style={{
                          color: "#a78bfa",
                          fontFamily: "var(--font-space-mono)",
                        }}
                      >
                        $970
                      </span>{" "}
                      <span>captured</span>
                    </div>
                    <div className="text-[11px]" style={{ color: "#4a5568" }}>
                      of $2,628
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-sm overflow-hidden bg-[rgba(255,255,255,0.04)]">
                    <div
                      className="h-full rounded-sm"
                      style={
                        {
                          background:
                            "linear-gradient(90deg, #a78bfa, #60a5fa)",
                          width: 0,
                          animation: "hiw-fill-bar 1s ease forwards",
                          animationDelay: "1.3s",
                          animationPlayState: "var(--play)",
                          "--fill-to": "37%",
                        } as React.CSSProperties
                      }
                    />
                  </div>
                  {/* Benefit rows */}
                  <div className="flex flex-col mt-0.5">
                    {[
                      {
                        name: "Travel Credit",
                        used: "$300",
                        total: "$300",
                        status: "full" as const,
                        fillPct: "100%",
                      },
                      {
                        name: "DoorDash",
                        used: "$5",
                        total: "$25",
                        status: "partial" as const,
                        fillPct: "20%",
                      },
                    ].map((b, bi) => (
                      <div
                        key={b.name}
                        className="flex items-center justify-between py-2"
                        style={{
                          borderTop:
                            bi > 0
                              ? "1px solid rgba(255,255,255,0.06)"
                              : undefined,
                          opacity: 0,
                          transform: "translateY(8px)",
                          animation: "fadeUp 0.4s ease forwards",
                          animationDelay: `${1.5 + bi * 0.15}s`,
                          animationPlayState: "var(--play)",
                        }}
                      >
                        <span
                          className="text-[12px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {b.name}
                        </span>
                        <div
                          className="flex items-center gap-1"
                          style={{
                            fontFamily: "var(--font-space-mono)",
                            fontSize: 11,
                          }}
                        >
                          <span
                            className="font-bold"
                            style={{
                              color:
                                b.status === "full" ? "#34d399" : "#f87171",
                            }}
                          >
                            {b.used}
                          </span>
                          <span style={{ color: "#4a5568" }}>/</span>
                          <span style={{ color: "#4a5568" }}>{b.total}</span>
                          <div
                            className="ml-1.5 w-8 h-[3px] rounded-sm overflow-hidden bg-[rgba(255,255,255,0.06)]"
                            style={{ flexShrink: 0 }}
                          >
                            <div
                              className="h-full rounded-sm"
                              style={
                                {
                                  background:
                                    b.status === "full" ? "#34d399" : "#f87171",
                                  width: 0,
                                  animation: "benefit-fill 0.5s ease forwards",
                                  animationDelay: `${1.7 + bi * 0.15}s`,
                                  animationPlayState: "var(--play)",
                                  "--fill-to": b.fillPct,
                                } as React.CSSProperties
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-auto px-6 pb-6">
                <div
                  className="text-[18px] font-bold mb-2"
                  style={{ letterSpacing: "-0.3px" }}
                >
                  We track your benefits
                </div>
                <div
                  className="text-[14px] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Every credit, perk, and multiplier mapped against your real
                  transactions. See what you&apos;ve captured and what&apos;s
                  expiring soon.
                </div>
              </div>
            </div>
          </AnimatedMockup>
        </div>
      </section>

      {/* ════════ TRACK SECTION ════════ */}
      <section className="py-24" id="track">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-4 text-center">Track</p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-4 text-center font-bold leading-[1.1]"
              style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                letterSpacing: "-2px",
              }}
            >
              You&apos;re paying for benefits <br className="hidden sm:block" />
              you&apos;ve never&nbsp;touched
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p
              className="mx-auto mb-12 max-w-[560px] text-center leading-relaxed text-[var(--text-secondary)]"
              style={{ fontSize: "clamp(15px, 1.6vw, 18px)" }}
            >
              Zurp maps your transactions against your card&apos;s full benefit
              catalog &mdash; credits, perks, multipliers &mdash; and shows
              exactly what you&apos;ve captured and what you&apos;re missing.
            </p>
          </ScrollReveal>

          <AnimatedMockup className="relative mx-auto max-w-[640px] overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#111827]">
            {/* Top edge glow */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(167,139,250,0.25), transparent)",
              }}
            />

            {/* Card header */}
            <div
              className="flex items-start justify-between border-b border-[rgba(255,255,255,0.06)] px-7 py-6"
              style={{
                opacity: 0,
                animation: "mock-fade-in 0.5s ease forwards",
                animationDelay: "0.2s",
                animationPlayState: "var(--play)",
              }}
            >
              <div>
                <div
                  className="text-[12px] font-bold uppercase tracking-[1.2px]"
                  style={{
                    fontFamily: "var(--font-space-mono)",
                    color: "var(--text-primary)",
                  }}
                >
                  Chase Sapphire Reserve
                </div>
                <div className="mt-1 text-[13px]" style={{ color: "#4a5568" }}>
                  $795/yr annual fee
                </div>
              </div>
              <div className="text-right">
                <CountUp
                  target={175}
                  prefix="+$"
                  delay={3800}
                  duration={1800}
                  className="text-[22px] font-bold"
                  style={{
                    fontFamily: "var(--font-space-mono)",
                    color: "#34d399",
                  }}
                />
                <div
                  className="mt-0.5 text-[12px]"
                  style={{ color: "#4a5568" }}
                >
                  net value this year
                </div>
              </div>
            </div>

            {/* Captured summary */}
            <div
              className="border-b border-[rgba(255,255,255,0.06)] px-7 py-5"
              style={{
                opacity: 0,
                animation: "mock-fade-in 0.5s ease forwards",
                animationDelay: "0.5s",
                animationPlayState: "var(--play)",
              }}
            >
              <div className="mb-3 flex items-baseline justify-between">
                <div className="text-[15px] font-semibold">
                  <span
                    style={{
                      fontFamily: "var(--font-space-mono)",
                      fontWeight: 700,
                      color: "#a78bfa",
                    }}
                  >
                    $970
                  </span>{" "}
                  captured
                </div>
                <div className="text-[13px]" style={{ color: "#4a5568" }}>
                  of $2,628 available
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded bg-[rgba(255,255,255,0.04)]">
                <div
                  className="h-full rounded"
                  style={
                    {
                      background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
                      width: 0,
                      animation: "tracker-fill 1.2s ease forwards",
                      animationDelay: "1.1s",
                      animationPlayState: "var(--play)",
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>

            {/* Benefits list */}
            <div className="py-2">
              {trackerRows.map((row, i) => {
                const isUnused = row.status === "unused";
                const rowDelay = 1.3 + i * 0.12;
                const barDelay = rowDelay + 0.25;
                return (
                  <div
                    key={row.name}
                    className="flex items-center gap-3.5 px-7 py-3.5 transition-colors hover:bg-[var(--bg-card-hover)]"
                    style={
                      {
                        opacity: 0,
                        transform: "translateY(10px)",
                        animation: `fadeUp 0.4s ease forwards${
                          isUnused
                            ? ", mock-unused-pulse 2s ease-in-out " +
                              (rowDelay + 0.8) +
                              "s 1"
                            : ""
                        }`,
                        animationDelay: `${rowDelay}s`,
                        animationPlayState: "var(--play)",
                        borderTop:
                          i > 0
                            ? "1px solid rgba(255,255,255,0.06)"
                            : undefined,
                      } as React.CSSProperties
                    }
                  >
                    <TrackerIcon icon={row.icon} status={row.status} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold">
                        {row.name}
                      </div>
                      <div
                        className="mt-0.5 text-[12px]"
                        style={{ color: "#4a5568" }}
                      >
                        {row.detail}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="flex items-center gap-[3px] justify-end"
                        style={{
                          fontFamily: "var(--font-space-mono)",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        <span
                          style={{
                            color:
                              row.status === "full"
                                ? "#34d399"
                                : row.status === "partial"
                                ? "#f87171"
                                : "#4a5568",
                          }}
                        >
                          {row.used}
                        </span>
                        <span style={{ color: "#4a5568", fontWeight: 400 }}>
                          /
                        </span>
                        <span style={{ color: "#4a5568", fontWeight: 400 }}>
                          {row.total}
                        </span>
                      </div>
                      <div className="mt-1.5 ml-auto h-[3px] w-16 overflow-hidden rounded-sm bg-[rgba(255,255,255,0.06)]">
                        <div
                          className="h-full rounded-sm"
                          style={
                            {
                              background:
                                row.status === "full"
                                  ? "#34d399"
                                  : row.status === "partial"
                                  ? "#f87171"
                                  : "transparent",
                              width: 0,
                              animation: `benefit-fill 0.5s ease forwards`,
                              animationDelay: `${barDelay}s`,
                              animationPlayState: "var(--play)",
                              "--fill-to": `${row.pct}%`,
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] px-7 py-4"
              style={{
                opacity: 0,
                animation: "mock-fade-in 0.4s ease forwards",
                animationDelay: "2.1s",
                animationPlayState: "var(--play)",
              }}
            >
              <span className="text-[12px]" style={{ color: "#4a5568" }}>
                6 of 12 benefits tracked &middot; Updated today
              </span>
              <Link
                href="/login"
                className="text-[12px] font-semibold"
                style={{ color: "#22d3ee" }}
              >
                See all 12 benefits &rarr;
              </Link>
            </div>
          </AnimatedMockup>
        </div>
      </section>

      {/* ════════ INSIGHT EXAMPLES ════════ */}
      <section className="py-24" id="insights">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-5 text-center">Insights</p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-5 text-center font-bold leading-[1.1]"
              style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                letterSpacing: "-2px",
              }}
            >
              Insights that pay for&nbsp;themselves
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p
              className="mx-auto mb-14 max-w-[550px] text-center leading-relaxed text-[var(--text-secondary)]"
              style={{ fontSize: "clamp(15px, 1.6vw, 18px)" }}
            >
              Every insight is based on your card, your transactions, your
              perks. No generic tips.
            </p>
          </ScrollReveal>

          <AnimatedMockup className="mx-auto flex max-w-[680px] flex-col gap-4">
            {insightCards.map((card, i) => {
              const v = insightVariants[card.variant];
              return (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[#111827]"
                  style={{
                    opacity: 0,
                    transform: "translateY(24px)",
                    animation: "ins-card-enter 0.6s ease forwards",
                    animationDelay: `${0.5 + i * 0.2}s`,
                    animationPlayState: "var(--play)",
                  }}
                >
                  {/* Left edge accent bar */}
                  <div
                    className="absolute left-0 rounded-r-sm"
                    style={{
                      top: 12,
                      bottom: 12,
                      width: 3,
                      background: v.color,
                    }}
                  />
                  {/* Top edge glow */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, ${v.glow}, transparent 60%)`,
                    }}
                  />

                  <div className="px-6 pt-5 pb-0">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <InsightIcon variant={card.variant} />
                      <div
                        style={{
                          fontFamily: "var(--font-space-mono)",
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "1.2px",
                          color: v.color,
                        }}
                      >
                        {card.typeLabel}
                      </div>
                    </div>

                    {/* Body */}
                    <div
                      className="text-[14px] leading-[1.6] mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {card.body}
                    </div>

                    {/* Savings callout */}
                    <div className="inline-flex items-baseline gap-2">
                      <span
                        style={{
                          fontFamily: "var(--font-space-mono)",
                          fontSize: 20,
                          fontWeight: 700,
                          color: v.color,
                        }}
                      >
                        {card.savingsValue}
                      </span>
                      <span
                        className="text-[12px]"
                        style={{ color: "#4a5568" }}
                      >
                        {card.savingsLabel}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    className="mx-6 mt-3 border-t border-[rgba(255,255,255,0.06)] py-3 text-[12px]"
                    style={{ color: "#4a5568" }}
                  >
                    {card.meta}
                  </div>
                </div>
              );
            })}
          </AnimatedMockup>
        </div>
      </section>

      {/* ════════ TRUST BAR ════════ */}
      <ScrollReveal>
        <div className="py-12 px-6 sm:px-10">
          <div className="mx-auto flex max-w-[900px] items-center justify-center gap-8 flex-wrap py-5 border-t border-b border-[rgba(255,255,255,0.06)]">
            {[
              {
                label: "Bank-level encryption",
                icon: (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                ),
              },
              {
                label: "Read-only via Plaid",
                icon: (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
              },
              {
                label: "No card numbers stored",
                icon: (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                    <path d="M7 15h4" />
                  </svg>
                ),
              },
              {
                label: "SOC 2 compliant",
                icon: (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className="hidden sm:block w-[3px] h-[3px] rounded-full mr-6 shrink-0"
                    style={{ background: "#4a5568", opacity: 0.3 }}
                  />
                )}
                <span
                  className="shrink-0 opacity-70"
                  style={{ color: "#4a5568" }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[13px] whitespace-nowrap"
                  style={{ color: "#4a5568" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ════════ BOTTOM CTA ════════ */}
      <section className="relative py-24 text-center" id="cta">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(34,211,238,0.04)_0%,rgba(96,165,250,0.02)_40%,transparent_70%)]" />

        <div className="relative z-[2] mx-auto max-w-[1080px] px-6 flex flex-col items-center">
          {/* Animated logo mark */}
          <ScrollReveal>
            <div className="mb-10">
              <svg width="56" height="42" viewBox="0 0 46 36" fill="none">
                <rect
                  x="2"
                  y="2"
                  width="42"
                  height="30"
                  rx="5"
                  fill="#0a0e17"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />
                <clipPath id="cta-t">
                  <rect x="8" y="9" width="30" height="6" rx="3" />
                </clipPath>
                <g clipPath="url(#cta-t)">
                  <rect
                    className="animate-[z-fill_2.4s_ease-in-out_infinite]"
                    x="8"
                    y="9"
                    width="18"
                    height="6"
                    fill="#60a5fa"
                  />
                  <rect
                    className="animate-[z-fill_2.4s_ease-in-out_infinite_0.24s]"
                    x="26"
                    y="9"
                    width="6.5"
                    height="6"
                    fill="#a78bfa"
                  />
                  <rect
                    className="animate-[z-fill_2.4s_ease-in-out_infinite_0.48s]"
                    x="32.5"
                    y="9"
                    width="5.5"
                    height="6"
                    fill="#f87171"
                  />
                </g>
                <clipPath id="cta-b">
                  <rect x="8" y="19" width="30" height="6" rx="3" />
                </clipPath>
                <g clipPath="url(#cta-b)">
                  <rect
                    className="animate-[z-fill_2.4s_ease-in-out_infinite_0.72s]"
                    x="8"
                    y="19"
                    width="5.5"
                    height="6"
                    fill="#f87171"
                    opacity="0.5"
                  />
                  <rect
                    className="animate-[z-fill_2.4s_ease-in-out_infinite_0.96s]"
                    x="13.5"
                    y="19"
                    width="6.5"
                    height="6"
                    fill="#a78bfa"
                    opacity="0.5"
                  />
                  <rect
                    className="animate-[z-fill_2.4s_ease-in-out_infinite_1.2s]"
                    x="20"
                    y="19"
                    width="18"
                    height="6"
                    fill="#60a5fa"
                    opacity="0.5"
                  />
                </g>
              </svg>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h2
              className="mb-5 font-bold leading-[1.08]"
              style={{
                fontSize: "clamp(36px, 4.5vw, 56px)",
                letterSpacing: "-2px",
                maxWidth: 600,
              }}
            >
              See what your card is really&nbsp;worth
            </h2>
          </ScrollReveal>

          <ScrollReveal>
            <p
              className="mb-10 text-[var(--text-secondary)]"
              style={{ fontSize: "clamp(15px, 1.6vw, 18px)", maxWidth: 420 }}
            >
              Two minutes to connect. We&apos;ll take it from there.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 rounded-[12px] px-9 py-4 text-[16px] font-bold transition-all hover:-translate-y-px"
              style={{
                background: "#22d3ee",
                color: "#0a0e17",
                letterSpacing: "-0.2px",
              }}
            >
              zurp your card
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </ScrollReveal>

          <ScrollReveal>
            <div
              className="mt-5 flex items-center gap-4 flex-wrap justify-center text-[13px]"
              style={{ color: "#4a5568" }}
            >
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Takes 2 minutes
              </span>
              <span className="w-[3px] h-[3px] rounded-full bg-[#4a5568] opacity-30 hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Read-only access
              </span>
              <span className="w-[3px] h-[3px] rounded-full bg-[#4a5568] opacity-30 hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Free to connect
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-[var(--border-default)] py-10">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="text-[13px] text-[var(--text-secondary)]">
            &copy; 2026 zurp
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-secondary)]"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-secondary)]"
            >
              Terms
            </Link>
            <Link
              href="/security"
              className="text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-secondary)]"
            >
              Security
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
