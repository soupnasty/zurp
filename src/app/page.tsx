import Link from "next/link";
import { MobileNav } from "./_components/MobileNav";
import { ScrollReveal } from "./_components/ScrollReveal";
import { CardChip, MARQUEE_CARDS, MARQUEE_CARDS_T2 } from "./_components/CardChip";
import { AnimatedMockup } from "./_components/AnimatedMockup";
import { CountUp } from "./_components/CountUp";

/* ── Tracker mockup rows ── */
const trackerRows = [
  {
    icon: "\u2708",
    name: "Travel Credit",
    period: "Resets on anniversary",
    used: "$300",
    total: "$300",
    pct: 100,
    status: "full" as const,
    iconStyle: "bg-[rgba(59,130,246,0.15)] text-[#60a5fa]",
  },
  {
    icon: "S",
    name: "StubHub",
    period: "$60 remaining \u00b7 resets Jul 1",
    used: "$90",
    total: "$150",
    pct: 60,
    status: "partial" as const,
    iconStyle: "bg-[rgba(244,63,94,0.15)] text-[#fb7185]",
  },
  {
    icon: "E",
    name: "Exclusive Tables",
    period: "$150 remaining \u00b7 resets Jul 1",
    used: "$150",
    total: "$300",
    pct: 50,
    status: "partial" as const,
    iconStyle: "bg-[rgba(251,146,60,0.15)] text-[#fb923c]",
  },
  {
    icon: "D",
    name: "DoorDash",
    period: "$25/mo \u00b7 resets in 8 days",
    used: "$25",
    total: "$25",
    pct: 100,
    status: "full" as const,
    iconStyle: "bg-[rgba(251,191,36,0.15)] text-[#fbbf24]",
  },
  {
    icon: "L",
    name: "Lyft",
    period: "$10/mo \u00b7 resets in 8 days",
    used: "$10",
    total: "$10",
    pct: 100,
    status: "full" as const,
    iconStyle: "bg-[rgba(168,85,247,0.15)] text-[#c084fc]",
  },
  {
    icon: "P",
    name: "Peloton",
    period: "$10/mo \u00b7 never used",
    used: "$0",
    total: "$10",
    pct: 0,
    status: "unused" as const,
    iconStyle: "bg-[rgba(52,211,153,0.15)] text-[#34d399]",
  },
];

/* ── Compare card rows ──
   All bars fill to the same total width (95%) so they line up visually.
   Segments are proportional within each card (value / total × 95).
   Detailed labels show absolute dollar amounts for honest cross-row comparison. */
const compareCards = [
  {
    rank: 1,
    name: "Sapphire Preferred",
    fee: "$95/yr fee",
    badge: null,
    pointsPct: 71,
    pointsLabel: "Points $798",
    benefitsPct: 15,
    benefitsLabel: "~$170",
    feePct: 9,
    feeLabel: "-$95",
    net: "+$873",
    netColor: "#34d399",
    rowBg: "rgba(52,211,153,0.03)",
    detailedLabels: {
      points: "Points $798",
      benefits: "~$170 simulated",
      fee: "Fee -$95",
    },
  },
  {
    rank: 2,
    name: "Amex Gold",
    fee: "$325/yr fee",
    badge: null,
    pointsPct: 48,
    pointsLabel: "Points $656",
    benefitsPct: 23,
    benefitsLabel: "~$304",
    feePct: 24,
    feeLabel: "-$325",
    net: "+$635",
    netColor: "#7a8ba8",
    rowBg: undefined,
    detailedLabels: {
      points: "Points $656",
      benefits: "~$304 simulated",
      fee: "Fee -$325",
    },
  },
  {
    rank: 3,
    name: "Sapphire Reserve",
    fee: "$795/yr fee",
    badge: null,
    pointsPct: 47,
    pointsLabel: "Points $838",
    benefitsPct: 4,
    benefitsLabel: "",
    feePct: 44,
    feeLabel: "-$795",
    net: "+$118",
    netColor: "#7a8ba8",
    rowBg: "rgba(96,165,250,0.03)",
    detailedLabels: {
      points: "Points $838",
      benefits: "$75 captured of $2,628",
      fee: "Fee -$795",
    },
  },
];

/* ── Insight examples ── */
const insightCards = [
  {
    accentColor: "#22d3ee",
    iconBg: "rgba(34,211,238,0.1)",
    icon: "\u2197",
    typeLabel: "Redirect spending",
    typeColor: "#22d3ee",
    body: (
      <>
        You spent{" "}
        <strong className="font-semibold text-white">$87 on Uber</strong> last
        month but only used{" "}
        <span className="ins-hl-blue font-bold" style={{ color: "#22d3ee" }}>
          $10
        </span>{" "}
        of your monthly Lyft credit. Switch your rides to Lyft to capture the
        full{" "}
        <span className="ins-hl-blue font-bold" style={{ color: "#22d3ee" }}>
          $120/yr
        </span>
        .
      </>
    ),
    meta: "Chase Sapphire Reserve \u00b7 Lyft credit",
    enterDelay: "0s",
    glowClass: "ins-hl-blue",
    glowDelay: "0.8s",
    borderAnim: "ins-border-blue",
  },
  {
    accentColor: "#fbbf24",
    iconBg: "rgba(251,191,36,0.1)",
    icon: "\u23F1",
    typeLabel: "Credit expiring",
    typeColor: "#fbbf24",
    body: (
      <>
        You&apos;ve only used{" "}
        <span className="ins-hl-yellow font-bold" style={{ color: "#fbbf24" }}>
          $5
        </span>{" "}
        of your{" "}
        <strong className="font-semibold text-white">
          $25 DoorDash credit
        </strong>{" "}
        &mdash;{" "}
        <span className="ins-hl-yellow font-bold" style={{ color: "#fbbf24" }}>
          3 days
        </span>{" "}
        left to use the rest.
      </>
    ),
    meta: "Chase Sapphire Reserve \u00b7 Monthly credit",
    enterDelay: "1.2s",
    glowClass: "ins-hl-yellow",
    glowDelay: "2.0s",
    borderAnim: "ins-border-yellow",
  },
  {
    accentColor: "#34d399",
    iconBg: "rgba(52,211,153,0.1)",
    icon: "\u2726",
    typeLabel: "ROI milestone",
    typeColor: "#34d399",
    body: (
      <>
        You&apos;ve captured{" "}
        <strong className="font-semibold text-white">$970</strong> of $2,700 in
        benefits this year. Your net value is{" "}
        <span className="ins-hl-green font-bold" style={{ color: "#34d399" }}>
          +$175
        </span>{" "}
        after the annual fee &mdash; your card is paying for itself.
      </>
    ),
    meta: "Chase Sapphire Reserve \u00b7 Annual value",
    enterDelay: "2.4s",
    glowClass: "ins-hl-green",
    glowDelay: "3.2s",
    borderAnim: "ins-border-green",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ════════ NAV ════════ */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[var(--bg-primary)]/80 backdrop-blur-[20px] border-b border-[var(--border-default)]/50">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <svg width="32" height="24" viewBox="0 0 46 36" fill="none">
              <rect x="2" y="2" width="42" height="30" rx="5" fill="#0a0e17" stroke="#22d3ee" strokeWidth="1.5"/>
              <clipPath id="lp-t">
                <rect x="8" y="9" width="30" height="6" rx="3"/>
              </clipPath>
              <g clipPath="url(#lp-t)">
                <rect x="8" y="9" width="18" height="6" fill="#60a5fa"/>
                <rect x="26" y="9" width="6.5" height="6" fill="#a78bfa"/>
                <rect x="32.5" y="9" width="5.5" height="6" fill="#f87171"/>
              </g>
              <clipPath id="lp-b">
                <rect x="8" y="19" width="30" height="6" rx="3"/>
              </clipPath>
              <g clipPath="url(#lp-b)">
                <rect x="8" y="19" width="5.5" height="6" fill="#f87171" opacity="0.5"/>
                <rect x="13.5" y="19" width="6.5" height="6" fill="#a78bfa" opacity="0.5"/>
                <rect x="20" y="19" width="18" height="6" fill="#60a5fa" opacity="0.5"/>
              </g>
            </svg>
            <span
              className="text-xl font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0" }}
            >
              zurp
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#track"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Track
            </a>
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

      {/* ════════ TRACK SECTION ════════ */}
      <section className="py-24" id="track">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-4 text-center">Track</p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-4 text-center text-[clamp(28px,4vw,42px)] font-bold leading-[1.15]"
              style={{ letterSpacing: "-0.02em" }}
            >
              You&apos;re paying for benefits <br className="hidden sm:block" />
              you&apos;ve never touched
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p
              className="mx-auto mb-12 max-w-[540px] text-center leading-relaxed"
              style={{ fontSize: 17, color: "#8b95a8" }}
            >
              Zurp maps your transactions against your card&apos;s full benefit
              catalog &mdash; credits, perks, multipliers &mdash; and shows
              exactly what you&apos;ve captured and what you&apos;re missing.
            </p>
          </ScrollReveal>

          <AnimatedMockup className="mx-auto max-w-[680px] overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827]">
            {/* Header */}
            <div
              className="mock-fade flex items-start justify-between border-b border-[rgba(255,255,255,0.06)] px-7 py-6"
              style={{ "--delay": "0.2s" } as React.CSSProperties}
            >
              <div>
                <div
                  className="text-[13px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: "#c5cbe8" }}
                >
                  Chase Sapphire Reserve
                </div>
                <div className="mt-1 text-[12px]" style={{ color: "#6b7280" }}>
                  $795/yr annual fee
                </div>
              </div>
              <div className="text-right">
                <CountUp
                  target={175}
                  prefix="+$"
                  delay={3800}
                  duration={1800}
                  className="font-data text-[28px] font-bold"
                  style={{ color: "#34d399", letterSpacing: "-0.02em" }}
                />
                <div
                  className="mt-0.5 text-[11px]"
                  style={{ color: "#6b7280" }}
                >
                  net value this year
                </div>
              </div>
            </div>

            {/* Progress */}
            <div
              className="mock-fade border-b border-[rgba(255,255,255,0.06)] px-7 py-5"
              style={{ "--delay": "0.5s" } as React.CSSProperties}
            >
              <div className="mb-2.5 flex items-baseline justify-between">
                <div className="text-[15px] font-medium text-[#e5e7eb]">
                  <CountUp
                    target={970}
                    prefix="$"
                    delay={3800}
                    duration={1800}
                    className="font-bold text-[#34d399]"
                  />{" "}
                  captured
                </div>
                <div className="text-[13px]" style={{ color: "#6b7280" }}>
                  of $2,628 available
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded bg-[rgba(255,255,255,0.06)]">
                <div
                  className="mock-bar h-full rounded"
                  style={
                    {
                      background: "linear-gradient(90deg, #34d399, #5eead4)",
                      "--fill": "37%",
                      "--dur": "1.8s",
                      "--delay": "3.8s",
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>

            {/* Benefit rows */}
            <div className="py-2">
              {trackerRows.map((row, i) => {
                const isUnused = row.status === "unused";
                const rowDelay = 0.8 + i * 0.4;
                const barDelay = rowDelay + 0.4;
                return (
                  <div
                    key={row.name}
                    className={`${
                      isUnused ? "mock-row-unused" : "mock-row"
                    } flex items-center gap-3.5 px-7 py-3.5 transition-colors hover:bg-[rgba(255,255,255,0.02)]`}
                    style={
                      {
                        "--delay": `${rowDelay}s`,
                        ...(isUnused
                          ? { "--delay2": `${rowDelay + 0.8}s` }
                          : {}),
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold ${row.iconStyle}`}
                    >
                      {row.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[#e5e7eb]">
                        {row.name}
                      </div>
                      <div
                        className="mt-0.5 text-[11px]"
                        style={{ color: "#6b7280" }}
                      >
                        {row.period}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="font-data text-[14px] font-semibold"
                        style={{
                          color:
                            row.status === "full"
                              ? "#34d399"
                              : row.status === "partial"
                              ? "#fbbf24"
                              : "#6b7280",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {row.used} / {row.total}
                      </div>
                      <div className="mt-1 ml-auto h-1 w-[60px] overflow-hidden rounded-sm bg-[rgba(255,255,255,0.06)]">
                        <div
                          className="mock-bar h-full rounded-sm"
                          style={
                            {
                              background:
                                row.status === "full"
                                  ? "#34d399"
                                  : row.status === "partial"
                                  ? "#fbbf24"
                                  : "#4b5563",
                              "--fill": `${row.pct}%`,
                              "--delay": `${barDelay}s`,
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
              className="mock-fade border-t border-[rgba(255,255,255,0.06)] px-7 py-4 text-[11px]"
              style={
                {
                  color: "#4b5563",
                  "--delay": "3.6s",
                  "--dur": "0.5s",
                } as React.CSSProperties
              }
            >
              6 of 12 benefits tracked &middot; Updated today
            </div>
          </AnimatedMockup>
        </div>
      </section>

      {/* ════════ COMPARE SECTION ════════ */}
      <section className="py-24" id="compare">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-4 text-center">Compare</p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-4 text-center text-[clamp(28px,4vw,42px)] font-bold leading-[1.15]"
              style={{ letterSpacing: "-0.02em" }}
            >
              See what you&apos;d gain &mdash; or lose &mdash;
              <br className="hidden sm:block" />
              on another card.
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p
              className="mx-auto mb-12 max-w-[540px] text-center leading-relaxed"
              style={{ fontSize: 17, color: "#8b95a8" }}
            >
              Based on your real spending, zurp calculates the exact dollar
              difference if you switched cards. No guesswork, no affiliate bias.
            </p>
          </ScrollReveal>

          <AnimatedMockup className="mx-auto max-w-[780px] overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827]">
            {/* Headline */}
            <div
              className="border-b border-[rgba(255,255,255,0.06)] px-4 py-6 sm:px-7"
              style={{
                opacity: 0,
                animation: "mock-fade-in 0.6s ease forwards",
                animationDelay: "0.2s",
                animationPlayState: "var(--play)",
              }}
            >
              <div className="text-[20px] font-bold text-white mb-1">
                The <span style={{ color: "#34d399" }}>Sapphire Preferred</span>{" "}
                could save you{" "}
                <CountUp
                  target={755}
                  prefix="$"
                  delay={2800}
                  duration={1400}
                  className="text-[#34d399]"
                />
                /yr
              </div>
              <div className="text-[13px]" style={{ color: "#6b7280" }}>
                Based on your $47,411 in spending over the last 12 months
              </div>
            </div>

            {/* Card rows */}
            <div className="py-2">
              {compareCards.map((card, i) => {
                const rowDelay = 0.6 + i * 0.5;
                const barBase = 1.0 + i * 0.5;
                const labelsDelay = barBase + 1.0;
                const netDelay = barBase + 1.0;
                const badgeDelay = card.badge === "best" ? 2.4 : 2.6;
                const dl = ("detailedLabels" in card && card.detailedLabels) as
                  | { points: string; benefits: string; fee: string }
                  | false;

                return (
                  <div
                    key={card.rank}
                    className="relative px-4 py-5 border-b border-[rgba(255,255,255,0.04)] last:border-b-0 sm:px-7"
                    style={
                      {
                        background: card.rowBg,
                        opacity: 0,
                        animation: "mock-row-enter 0.5s ease forwards",
                        animationDelay: `${rowDelay}s`,
                        animationPlayState: "var(--play)",
                      } as React.CSSProperties
                    }
                  >
                    {/* Top row: rank + card info + net value */}
                    <div className="flex items-center gap-3 sm:gap-5">
                      {/* Rank */}
                      <div
                        className="text-[14px] font-bold shrink-0 w-5"
                        style={{ color: "#4b5563" }}
                      >
                        {card.rank}
                      </div>

                      {/* Card info */}
                      <div className="min-w-0 flex-1 sm:shrink-0 sm:flex-none sm:min-w-[180px]">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold text-[#e5e7eb]">
                          <span className="sm:inline">{card.name}</span>
                          {card.badge === "best" && (
                            <span
                              className="inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] bg-[rgba(52,211,153,0.15)] text-[#34d399]"
                              style={{
                                opacity: 0,
                                transform: "scale(0.7)",
                                animation:
                                  "mock-badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
                                animationDelay: `${badgeDelay}s`,
                                animationPlayState: "var(--play)",
                              }}
                            >
                              Best value
                            </span>
                          )}
                          {card.badge === "current" && (
                            <span
                              className="inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] bg-[rgba(34,211,238,0.15)] text-[#22d3ee]"
                              style={{
                                opacity: 0,
                                transform: "scale(0.7)",
                                animation:
                                  "mock-badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
                                animationDelay: `${badgeDelay}s`,
                                animationPlayState: "var(--play)",
                              }}
                            >
                              Your card
                            </span>
                          )}
                        </div>
                        <div
                          className="mt-1 text-[12px]"
                          style={{ color: "#6b7280" }}
                        >
                          {card.fee}
                        </div>
                      </div>

                      {/* Stacked bar — desktop only (inline) */}
                      <div className="hidden sm:block flex-1 min-w-0">
                        <div className="flex h-7 overflow-hidden rounded-md bg-[rgba(255,255,255,0.04)]">
                          <div
                            className="flex items-center justify-center text-[11px] font-semibold text-white/90 whitespace-nowrap overflow-hidden"
                            style={
                              {
                                width: 0,
                                background:
                                  "linear-gradient(90deg, #3b82f6, #2563eb)",
                                animation:
                                  "mock-fill-bar 1s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
                                animationDelay: `${barBase}s`,
                                animationPlayState: "var(--play)",
                                "--fill": `${card.pointsPct}%`,
                              } as React.CSSProperties
                            }
                          >
                            {card.pointsPct > 25 ? card.pointsLabel : ""}
                          </div>
                          <div
                            className="flex items-center justify-center text-[11px] font-semibold text-white/90 whitespace-nowrap overflow-hidden"
                            style={
                              {
                                width: 0,
                                background: "rgba(167,139,250,0.5)",
                                animation:
                                  "mock-fill-bar 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
                                animationDelay: `${barBase + 0.4}s`,
                                animationPlayState: "var(--play)",
                                "--fill": `${card.benefitsPct}%`,
                              } as React.CSSProperties
                            }
                          >
                            {card.benefitsPct > 12 ? card.benefitsLabel : ""}
                          </div>
                          <div
                            className="flex items-center justify-center text-[11px] font-semibold text-white/70 whitespace-nowrap overflow-hidden"
                            style={
                              {
                                width: 0,
                                background: "rgba(239,68,68,0.25)",
                                animation:
                                  "mock-fill-bar 0.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
                                animationDelay: `${barBase + 0.7}s`,
                                animationPlayState: "var(--play)",
                                "--fill": `${card.feePct}%`,
                              } as React.CSSProperties
                            }
                          >
                            {card.feePct > 8 ? card.feeLabel : ""}
                          </div>
                        </div>
                        {/* Legend dots */}
                        <div
                          className="mt-1.5 flex gap-3 text-[11px]"
                          style={{
                            color: "#6b7280",
                            fontVariantNumeric: "tabular-nums",
                            opacity: 0,
                            animation: "mock-fade-in 0.4s ease forwards",
                            animationDelay: `${labelsDelay}s`,
                            animationPlayState: "var(--play)",
                          }}
                        >
                          <span className="flex items-center gap-1">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                            {dl ? dl.points : "Points"}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
                            {dl ? dl.benefits : "Benefits"}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                            {dl ? dl.fee : "Fee"}
                          </span>
                        </div>
                      </div>

                      {/* Net value */}
                      <div className="text-right shrink-0 ml-auto">
                        <div
                          className="font-data text-[18px] font-bold sm:text-[22px]"
                          style={{
                            color: card.netColor,
                            letterSpacing: "-0.02em",
                            fontVariantNumeric: "tabular-nums",
                            opacity: 0,
                            animation: "mock-net-reveal 0.5s ease forwards",
                            animationDelay: `${netDelay}s`,
                            animationPlayState: "var(--play)",
                          }}
                        >
                          {card.net}
                        </div>
                        <div
                          className="mt-0.5 text-[11px]"
                          style={{ color: "#6b7280" }}
                        >
                          net / year
                        </div>
                      </div>
                    </div>

                    {/* Stacked bar — mobile only (full width below) */}
                    <div className="mt-3 pl-8 sm:hidden">
                      <div className="flex h-6 overflow-hidden rounded-md bg-[rgba(255,255,255,0.04)]">
                        <div
                          className="flex items-center justify-center text-[10px] font-semibold text-white/90 whitespace-nowrap overflow-hidden"
                          style={
                            {
                              width: 0,
                              background:
                                "linear-gradient(90deg, #3b82f6, #2563eb)",
                              animation:
                                "mock-fill-bar 1s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
                              animationDelay: `${barBase}s`,
                              animationPlayState: "var(--play)",
                              "--fill": `${card.pointsPct}%`,
                            } as React.CSSProperties
                          }
                        >
                          {card.pointsPct > 25 ? card.pointsLabel : ""}
                        </div>
                        <div
                          className="flex items-center justify-center text-[10px] font-semibold text-white/90 whitespace-nowrap overflow-hidden"
                          style={
                            {
                              width: 0,
                              background: "rgba(167,139,250,0.5)",
                              animation:
                                "mock-fill-bar 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
                              animationDelay: `${barBase + 0.4}s`,
                              animationPlayState: "var(--play)",
                              "--fill": `${card.benefitsPct}%`,
                            } as React.CSSProperties
                          }
                        >
                          {card.benefitsPct > 15 ? card.benefitsLabel : ""}
                        </div>
                        <div
                          className="flex items-center justify-center text-[10px] font-semibold text-white/70 whitespace-nowrap overflow-hidden"
                          style={
                            {
                              width: 0,
                              background: "rgba(239,68,68,0.25)",
                              animation:
                                "mock-fill-bar 0.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
                              animationDelay: `${barBase + 0.7}s`,
                              animationPlayState: "var(--play)",
                              "--fill": `${card.feePct}%`,
                            } as React.CSSProperties
                          }
                        >
                          {card.feePct > 8 ? card.feeLabel : ""}
                        </div>
                      </div>
                      {/* Legend dots */}
                      <div
                        className="mt-1.5 flex gap-3 text-[10px]"
                        style={{
                          color: "#6b7280",
                          fontVariantNumeric: "tabular-nums",
                          opacity: 0,
                          animation: "mock-fade-in 0.4s ease forwards",
                          animationDelay: `${labelsDelay}s`,
                          animationPlayState: "var(--play)",
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                          {dl ? dl.points : "Points"}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
                          {dl ? dl.benefits : "Benefits"}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                          {dl ? dl.fee : "Fee"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="border-t border-[rgba(255,255,255,0.06)] px-4 py-4 text-[11px] leading-relaxed sm:px-7"
              style={{
                color: "#4b5563",
                opacity: 0,
                animation: "mock-fade-in 0.5s ease forwards",
                animationDelay: "3.2s",
                animationPlayState: "var(--play)",
              }}
            >
              Points valued conservatively (Chase UR: 1.25&cent;, Amex MR:
              1.0&cent;). Transfer partner redemptions can yield higher value.
              Your card shows benefits actually captured; other cards show
              benefits simulated from your spending history.
            </div>
          </AnimatedMockup>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="py-24" id="how">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-4 text-center">How it works</p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-16 text-center text-[clamp(28px,4vw,42px)] font-bold leading-[1.15]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Two minutes to stop wasting money
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3 items-stretch">
            {/* Step 1: Connect */}
            <ScrollReveal className="flex">
              <div className="flex-1 flex flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827] p-7 pt-8">
                <div
                  className="text-[13px] font-semibold mb-5"
                  style={{ color: "#4b5563" }}
                >
                  01
                </div>

                {/* Animation: Card → Shield */}
                <div className="relative mb-6 h-[180px] w-full overflow-hidden rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="relative"
                      style={{ width: 160, height: 120 }}
                    >
                      {/* Card */}
                      <div
                        className="absolute rounded-md"
                        style={{
                          width: 72,
                          height: 46,
                          background:
                            "linear-gradient(145deg, #1a1f3a, #0d1129)",
                          boxShadow:
                            "0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
                          left: 0,
                          top: "50%",
                          animation: "hiw-card-slide 3.5s ease-in-out infinite",
                        }}
                      >
                        <div
                          className="absolute rounded-sm"
                          style={{
                            top: 10,
                            left: 10,
                            width: 14,
                            height: 10,
                            background: "rgba(255,255,255,0.15)",
                            border: "0.5px solid rgba(255,255,255,0.1)",
                          }}
                        />
                        <div
                          className="absolute"
                          style={{ bottom: 8, left: 10, right: 10 }}
                        >
                          <div className="mb-[3px] h-[2px] rounded-sm bg-[rgba(255,255,255,0.08)]" />
                          <div className="mb-[3px] h-[2px] rounded-sm bg-[rgba(255,255,255,0.08)]" />
                          <div className="h-[2px] w-[60%] rounded-sm bg-[rgba(255,255,255,0.08)]" />
                        </div>
                      </div>

                      {/* Connection line */}
                      <div
                        className="absolute"
                        style={{
                          top: "50%",
                          left: 72,
                          right: 66,
                          height: 2,
                          transform: "translateY(-50%)",
                        }}
                      >
                        <div className="relative h-full w-full overflow-hidden rounded-sm bg-[rgba(255,255,255,0.06)]">
                          <div
                            className="absolute top-0 h-full rounded-sm"
                            style={{
                              width: "30%",
                              background:
                                "linear-gradient(90deg, transparent, #22d3ee, transparent)",
                              animation:
                                "hiw-pulse-slide 3.5s ease-in-out infinite",
                            }}
                          />
                        </div>
                      </div>

                      {/* Shield */}
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 56,
                          height: 64,
                        }}
                      >
                        <div
                          className="relative"
                          style={{ width: 48, height: 56 }}
                        >
                          <svg
                            viewBox="0 0 48 56"
                            fill="none"
                            className="h-full w-full"
                          >
                            <path
                              d="M24 2L4 12V28C4 40 14 50 24 54C34 50 44 40 44 28V12L24 2Z"
                              fill="rgba(34,211,238,0.08)"
                              stroke="rgba(34,211,238,0.3)"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <div
                            className="absolute"
                            style={{
                              top: "50%",
                              left: "50%",
                              animation:
                                "hiw-check-pop 3.5s ease-in-out infinite",
                            }}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M5 10L9 14L15 6"
                                stroke="#22d3ee"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="mb-2 text-[20px] font-bold">
                  Connect via Plaid
                </h3>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "#8b95a8" }}
                >
                  Read-only access to your transactions. We never see your card
                  number, login, or balance.{" "}
                  <a
                    href="https://plaid.com/what-is-plaid/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors"
                  >
                    Learn more about Plaid
                  </a>
                  .
                </p>
              </div>
            </ScrollReveal>

            {/* Step 2: Scan */}
            <ScrollReveal className="flex">
              <div className="flex-1 flex flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827] p-7 pt-8">
                <div
                  className="text-[13px] font-semibold mb-5"
                  style={{ color: "#4b5563" }}
                >
                  02
                </div>

                {/* Animation: Transaction scanning */}
                <div className="relative mb-6 h-[180px] w-full overflow-hidden rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] flex flex-col justify-center px-5 py-4 gap-0">
                  {[
                    {
                      merchant: "Uber",
                      amount: "$32.40",
                      match: true,
                      delay: "0s",
                    },
                    {
                      merchant: "DoorDash",
                      amount: "$24.80",
                      match: true,
                      delay: "0.4s",
                    },
                    {
                      merchant: "Whole Foods",
                      amount: "$67.32",
                      match: false,
                      delay: "0.8s",
                    },
                    {
                      merchant: "StubHub",
                      amount: "$95.00",
                      match: true,
                      delay: "1.2s",
                    },
                  ].map((row) => (
                    <div
                      key={row.merchant}
                      className="flex items-center gap-2.5 rounded-md px-2 h-9"
                      style={{
                        opacity: 0,
                        animation: `${
                          row.match ? "hiw-scan-row-match" : "hiw-scan-row-in"
                        } 4s ease-in-out infinite`,
                        animationDelay: row.delay,
                      }}
                    >
                      <span
                        className="flex-1 text-[12px] whitespace-nowrap"
                        style={{ color: "#8b95a8" }}
                      >
                        {row.merchant}
                      </span>
                      <span
                        className="shrink-0 w-[50px] text-right text-[12px]"
                        style={{
                          color: "#6b7280",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {row.amount}
                      </span>
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]"
                        style={{
                          background: row.match
                            ? "rgba(34,211,238,0.15)"
                            : "rgba(255,255,255,0.04)",
                          color: row.match ? "#22d3ee" : "#4b5563",
                          opacity: 0,
                          animation: `${
                            row.match ? "hiw-match-pop" : "hiw-nomatch-pop"
                          } 4s ease-in-out infinite`,
                          animationDelay: `${parseFloat(row.delay) + 0.6}s`,
                        }}
                      >
                        {row.match ? "\u2713" : "\u2014"}
                      </span>
                    </div>
                  ))}
                </div>

                <h3 className="mb-2 text-[20px] font-bold">
                  We scan your spending
                </h3>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "#8b95a8" }}
                >
                  Every transaction is matched against your card&apos;s full
                  benefit catalog &mdash; credits, multipliers, and perks.
                </p>
              </div>
            </ScrollReveal>

            {/* Step 3: Insights */}
            <ScrollReveal className="flex">
              <div className="flex-1 flex flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827] p-7 pt-8">
                <div
                  className="text-[13px] font-semibold mb-5"
                  style={{ color: "#4b5563" }}
                >
                  03
                </div>

                {/* Animation: Insight card */}
                <div className="relative mb-6 h-[180px] w-full overflow-hidden rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] flex items-center justify-center p-5">
                  <div
                    className="w-full max-w-[260px] rounded-[10px] border border-[rgba(255,255,255,0.08)] p-4"
                    style={{
                      background: "#1a2332",
                      opacity: 0,
                      animation: "hiw-insight-slide 4.5s ease-in-out infinite",
                    }}
                  >
                    <div
                      className="mb-2.5 inline-flex items-center gap-1 rounded px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.06em]"
                      style={{
                        color: "#fbbf24",
                        background: "rgba(251,191,36,0.1)",
                      }}
                    >
                      &uarr; Redirect spending
                    </div>
                    <div
                      className="mb-3 text-[13px] leading-relaxed"
                      style={{ color: "#c9d1d9" }}
                    >
                      You spent{" "}
                      <strong className="font-semibold text-white">
                        $87 on Uber
                      </strong>{" "}
                      last month. Your{" "}
                      <span className="font-bold" style={{ color: "#22d3ee" }}>
                        $10/mo Lyft credit
                      </span>{" "}
                      is sitting unused.
                    </div>
                    <div className="flex items-end gap-1.5">
                      <span
                        className="font-data font-bold leading-none"
                        style={{
                          fontSize: 28,
                          color: "#22d3ee",
                          letterSpacing: "-0.02em",
                          fontVariantNumeric: "tabular-nums",
                          opacity: 0,
                          animation:
                            "hiw-amount-count 4.5s ease-in-out infinite",
                        }}
                      >
                        $120
                      </span>
                      <span
                        className="text-[12px] leading-none mb-[3px]"
                        style={{
                          color: "#6b7280",
                          opacity: 0,
                          animation: "hiw-label-fade 4.5s ease-in-out infinite",
                        }}
                      >
                        per year in unused credit
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="mb-2 text-[20px] font-bold">
                  Get personalized insights
                </h3>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "#8b95a8" }}
                >
                  Missed credits, better merchants, expiring benefits, and what
                  you&apos;d save by switching cards. spending.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════ INSIGHT EXAMPLES ════════ */}
      <section className="py-24" id="insights">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-4 text-center">Insights</p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-4 text-center text-[clamp(28px,4vw,42px)] font-bold leading-[1.15]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Smart insights. Real dollars.
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p
              className="mx-auto mb-14 max-w-[540px] text-center leading-relaxed"
              style={{ fontSize: 17, color: "#8b95a8" }}
            >
              Every insight is based on your card, your transactions, your
              perks. No generic tips.
            </p>
          </ScrollReveal>

          <AnimatedMockup className="mx-auto flex max-w-[640px] flex-col items-center gap-4">
            {insightCards.map((card, i) => (
              <div
                key={i}
                className="relative w-full overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.06)]"
                style={{
                  background: "#111827",
                  opacity: 0,
                  animation: "ins-card-enter 0.6s ease forwards",
                  animationDelay: `${0.2 + i * 0.3}s`,
                  animationPlayState: "var(--play)",
                }}
              >
                {/* Border flash overlay */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[14px]"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    animation: `${card.borderAnim} 1.5s ease-in-out 1`,
                    animationDelay: `${0.5 + i * 0.3}s`,
                    animationPlayState: "var(--play)",
                  }}
                />

                <div className="flex items-start gap-4 px-6 py-[22px]">
                  {/* Accent bar */}
                  <div
                    className="shrink-0 self-stretch rounded-sm"
                    style={{
                      width: 4,
                      minHeight: 48,
                      background: card.accentColor,
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="flex shrink-0 items-center justify-center rounded-[10px]"
                    style={{
                      width: 36,
                      height: 36,
                      background: card.iconBg,
                      fontSize: 16,
                    }}
                  >
                    {card.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div
                      className="mb-1.5 text-[11px] font-semibold uppercase"
                      style={{ letterSpacing: "0.06em", color: card.typeColor }}
                    >
                      {card.typeLabel}
                    </div>
                    <div
                      className="text-[15px] leading-[1.55]"
                      style={{ color: "#c9d1d9" }}
                    >
                      {card.body}
                    </div>
                    <div
                      className="mt-2 text-[12px]"
                      style={{ color: "#4b5563" }}
                    >
                      {card.meta}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </AnimatedMockup>
        </div>
      </section>

      {/* ════════ BOTTOM CTA ════════ */}
      <section className="py-24 text-center" id="cta">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <h2
              className="mb-4 text-[clamp(28px,4vw,40px)] font-bold leading-tight"
              style={{ letterSpacing: "-1px" }}
            >
              You already paid the annual fee. Get what&apos;s yours.
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p className="mb-10 text-base text-[var(--text-secondary)]">
              Connect your card. See what you&apos;re missing today.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <div className="mb-3 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
                <span
                  className="absolute inset-0 rounded-[14px] opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(135deg, #22d3ee, #34d399)",
                  }}
                />
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <p className="mt-3 text-[13px] text-[var(--text-secondary)]">
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
