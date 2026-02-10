import Link from "next/link";
import { MobileNav } from "./_components/MobileNav";
import { ScrollReveal } from "./_components/ScrollReveal";
import { CardChip, MARQUEE_CARDS } from "./_components/CardChip";

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
    period: "$0 remaining \u00b7 resets Jul 1",
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

/* ── Compare card rows ── */
const compareCards = [
  {
    rank: 1,
    name: "Sapphire Preferred",
    fee: "$95/yr fee",
    badge: "best" as const,
    pointsPct: 72,
    pointsLabel: "Points $798",
    pointsColor: "linear-gradient(90deg, #3b82f6, #2563eb)",
    benefitsPct: 15,
    benefitsLabel: "$170",
    feePct: 8,
    feeLabel: "\u2212$95",
    net: "+$873",
    netColor: "#34d399",
    rowBg: "rgba(52,211,153,0.03)",
  },
  {
    rank: 2,
    name: "Amex Gold",
    fee: "$325/yr fee",
    badge: null,
    pointsPct: 57,
    pointsLabel: "Points $656",
    pointsColor: "linear-gradient(90deg, #b8860b, #996515)",
    benefitsPct: 26,
    benefitsLabel: "$304",
    feePct: 12,
    feeLabel: "\u2212$325",
    net: "+$635",
    netColor: "#fbbf24",
    rowBg: undefined,
  },
  {
    rank: 3,
    name: "Sapphire Reserve",
    fee: "$795/yr fee",
    badge: "current" as const,
    pointsPct: 69,
    pointsLabel: "Points $838",
    pointsColor: "linear-gradient(90deg, #1e3a5f, #162d4a)",
    benefitsPct: 6,
    benefitsLabel: "",
    feePct: 20,
    feeLabel: "\u2212$795",
    net: "+$118",
    netColor: "#6b7280",
    rowBg: "rgba(59,130,246,0.03)",
  },
];

/* ── Insight examples ── */
const insights = [
  {
    tag: "A1",
    tagColor: "bg-[rgba(88,166,255,0.12)] text-[var(--color-info)]",
    text: (
      <>
        You spent <span className="font-semibold">$87 on Lyft</span> last month
        but only used{" "}
        <span className="font-data text-[var(--color-warning)]">$10</span> of
        your monthly credit. Schedule rides on your Reserve card to capture the
        full{" "}
        <span className="font-data text-[var(--color-success)]">$10/mo</span>.
      </>
    ),
    meta: "Chase Sapphire Reserve \u00b7 Underused credit",
  },
  {
    tag: "B1",
    tagColor: "bg-[rgba(210,153,34,0.12)] text-[var(--color-warning)]",
    text: (
      <>
        Your{" "}
        <span className="font-data text-[var(--color-warning)]">
          $25 DoorDash credit
        </span>{" "}
        resets in 3 days. You&apos;ve only used the $5 restaurant promo this
        month.
      </>
    ),
    meta: "Chase Sapphire Reserve \u00b7 Monthly credit expiring",
  },
  {
    tag: "C2",
    tagColor: "bg-[rgba(63,185,80,0.12)] text-[var(--color-success)]",
    text: (
      <>
        You&apos;ve captured{" "}
        <span className="font-data text-[var(--color-success)]">$970</span> of
        $1,690 in Chase Sapphire Reserve benefits. Your net cost is{" "}
        <span className="font-data text-[var(--color-success)]">
          &minus;$175
        </span>
        . The card is paying for itself.
      </>
    ),
    meta: "Chase Sapphire Reserve \u00b7 ROI check",
  },
  {
    tag: "A1",
    tagColor: "bg-[rgba(88,166,255,0.12)] text-[var(--color-info)]",
    text: (
      <>
        You booked a hotel on Expedia for{" "}
        <span className="font-semibold">$340</span>. Booking through{" "}
        <span className="font-semibold">
          Chase Travel&apos;s Edit collection
        </span>{" "}
        could have earned you a{" "}
        <span className="font-data text-[var(--color-success)]">
          $250 statement credit
        </span>
        .
      </>
    ),
    meta: "Chase Sapphire Reserve \u00b7 Competitor redirect",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ════════ NAV ════════ */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[var(--bg-primary)]/80 backdrop-blur-[20px] border-b border-[var(--border-default)]/50">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <svg width="32" height="22" viewBox="0 0 50 34" fill="none">
              <rect
                x="0"
                y="0"
                width="50"
                height="34"
                rx="5"
                stroke="var(--accent)"
                strokeWidth="2.5"
                opacity="0.4"
              />
              <line
                x1="0"
                y1="12"
                x2="50"
                y2="12"
                stroke="var(--accent)"
                strokeWidth="1.2"
                opacity="0.2"
              />
              <circle cx="12" cy="24" r="2.5" fill="var(--accent)" />
              <circle
                cx="21"
                cy="24"
                r="2.5"
                fill="var(--accent)"
                opacity="0.55"
              />
              <circle
                cx="30"
                cy="24"
                r="2.5"
                fill="var(--accent)"
                opacity="0.2"
              />
            </svg>
            <span
              className="text-xl font-bold tracking-tight text-[var(--text-primary)]"
              style={{ letterSpacing: "-0.5px" }}
            >
              zurp
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
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
              href="#compare"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Compare
            </a>
            <a
              href="#insights"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Insights
            </a>
            <Link
              href="/login"
              className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-90"
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
        <div className="pointer-events-none absolute top-[-200px] left-1/2 h-[600px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(88,166,255,0.06)_0%,transparent_70%)]" />

        <div className="mx-auto max-w-[1080px] px-6">
          <h1
            className="mx-auto mb-6 text-[clamp(40px,6vw,68px)] font-bold leading-[1.08] animate-[fadeUp_0.6s_ease_0.1s_both]"
            style={{ letterSpacing: "-2px" }}
          >
            Know what your
            <br />
            card is{" "}
            <span className="bg-gradient-to-r from-[#58A6FF] to-[#3FB950] bg-clip-text text-transparent">
              actually
            </span>{" "}
            worth
          </h1>

          <p className="mx-auto mb-10 max-w-[520px] text-lg leading-relaxed text-[var(--text-secondary)] animate-[fadeUp_0.6s_ease_0.2s_both]">
            Zurp tracks your credit card benefits automatically &mdash; and
            shows you what you&apos;d gain or lose on every other card.
          </p>

          <div className="mb-3 flex flex-col items-center justify-center gap-4 sm:flex-row animate-[fadeUp_0.6s_ease_0.3s_both]">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-[var(--bg-primary)] transition-all hover:-translate-y-px hover:shadow-[var(--shadow-glow)] hover:opacity-90"
            >
              zurp your card &rarr;
            </Link>
          </div>

          <p className="text-[13px] text-[var(--text-secondary)] animate-[fadeUp_0.6s_ease_0.4s_both]">
            Free to use. Secure, read-only connection via Plaid.
          </p>
        </div>
      </section>

      {/* ════════ CARD MARQUEE STRIP ════════ */}
      <div className="relative overflow-hidden py-10">
        {/* Fade edges */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-[2] w-20 bg-gradient-to-r from-[var(--bg-primary)] to-transparent" />
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 z-[2] w-20 bg-gradient-to-l from-[var(--bg-primary)] to-transparent" />

        <div className="marquee-track flex w-max items-center gap-6">
          {/* Render cards twice for seamless loop */}
          {[...MARQUEE_CARDS, ...MARQUEE_CARDS].map((cardId, i) => (
            <CardChip key={i} cardId={cardId} />
          ))}
        </div>
      </div>

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
                <div className="text-[13px] font-semibold mb-5" style={{ color: "#4b5563" }}>
                  01
                </div>

                {/* Animation: Card → Shield */}
                <div className="relative mb-6 h-[180px] w-full overflow-hidden rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative" style={{ width: 160, height: 120 }}>
                      {/* Card */}
                      <div
                        className="absolute rounded-md"
                        style={{
                          width: 72,
                          height: 46,
                          background: "linear-gradient(145deg, #1a1f3a, #0d1129)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
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
                        <div className="absolute" style={{ bottom: 8, left: 10, right: 10 }}>
                          <div className="mb-[3px] h-[2px] rounded-sm bg-[rgba(255,255,255,0.08)]" />
                          <div className="mb-[3px] h-[2px] rounded-sm bg-[rgba(255,255,255,0.08)]" />
                          <div className="h-[2px] w-[60%] rounded-sm bg-[rgba(255,255,255,0.08)]" />
                        </div>
                      </div>

                      {/* Connection line */}
                      <div
                        className="absolute"
                        style={{ top: "50%", left: 72, right: 66, height: 2, transform: "translateY(-50%)" }}
                      >
                        <div className="relative h-full w-full overflow-hidden rounded-sm bg-[rgba(255,255,255,0.06)]">
                          <div
                            className="absolute top-0 h-full rounded-sm"
                            style={{
                              width: "30%",
                              background: "linear-gradient(90deg, transparent, #58A6FF, transparent)",
                              animation: "hiw-pulse-slide 3.5s ease-in-out infinite",
                            }}
                          />
                        </div>
                      </div>

                      {/* Shield */}
                      <div
                        className="absolute flex items-center justify-center"
                        style={{ right: 10, top: "50%", transform: "translateY(-50%)", width: 56, height: 64 }}
                      >
                        <div className="relative" style={{ width: 48, height: 56 }}>
                          <svg viewBox="0 0 48 56" fill="none" className="h-full w-full">
                            <path
                              d="M24 2L4 12V28C4 40 14 50 24 54C34 50 44 40 44 28V12L24 2Z"
                              fill="rgba(88,166,255,0.08)"
                              stroke="rgba(88,166,255,0.3)"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <div
                            className="absolute"
                            style={{
                              top: "50%",
                              left: "50%",
                              animation: "hiw-check-pop 3.5s ease-in-out infinite",
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M5 10L9 14L15 6" stroke="#58A6FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="mb-2 text-[20px] font-bold">Connect via Plaid</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "#8b95a8" }}>
                  Read-only access to your transactions. We never see your card
                  number, login, or balance.
                </p>
              </div>
            </ScrollReveal>

            {/* Step 2: Scan */}
            <ScrollReveal className="flex">
              <div className="flex-1 flex flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827] p-7 pt-8">
                <div className="text-[13px] font-semibold mb-5" style={{ color: "#4b5563" }}>
                  02
                </div>

                {/* Animation: Transaction scanning */}
                <div className="relative mb-6 h-[180px] w-full overflow-hidden rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] flex flex-col justify-center px-5 py-4 gap-0">
                  {[
                    { merchant: "Uber", amount: "$32.40", match: true, delay: "0s" },
                    { merchant: "DoorDash", amount: "$24.80", match: true, delay: "0.4s" },
                    { merchant: "Whole Foods", amount: "$67.32", match: false, delay: "0.8s" },
                    { merchant: "StubHub", amount: "$95.00", match: true, delay: "1.2s" },
                  ].map((row) => (
                    <div
                      key={row.merchant}
                      className="flex items-center gap-2.5 rounded-md px-2 h-9"
                      style={{
                        opacity: 0,
                        animation: `${row.match ? "hiw-scan-row-match" : "hiw-scan-row-in"} 4s ease-in-out infinite`,
                        animationDelay: row.delay,
                      }}
                    >
                      <span className="flex-1 text-[12px] whitespace-nowrap" style={{ color: "#8b95a8" }}>
                        {row.merchant}
                      </span>
                      <span
                        className="shrink-0 w-[50px] text-right text-[12px]"
                        style={{ color: "#6b7280", fontVariantNumeric: "tabular-nums" }}
                      >
                        {row.amount}
                      </span>
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]"
                        style={{
                          background: row.match ? "rgba(88,166,255,0.15)" : "rgba(255,255,255,0.04)",
                          color: row.match ? "#58A6FF" : "#4b5563",
                          opacity: 0,
                          animation: `${row.match ? "hiw-match-pop" : "hiw-nomatch-pop"} 4s ease-in-out infinite`,
                          animationDelay: `${parseFloat(row.delay) + 0.6}s`,
                        }}
                      >
                        {row.match ? "\u2713" : "\u2014"}
                      </span>
                    </div>
                  ))}
                </div>

                <h3 className="mb-2 text-[20px] font-bold">We scan your spending</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "#8b95a8" }}>
                  Every transaction is matched against your card&apos;s full benefit
                  catalog &mdash; credits, multipliers, promos, partner perks.
                </p>
              </div>
            </ScrollReveal>

            {/* Step 3: Insights */}
            <ScrollReveal className="flex">
              <div className="flex-1 flex flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827] p-7 pt-8">
                <div className="text-[13px] font-semibold mb-5" style={{ color: "#4b5563" }}>
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
                      style={{ color: "#fbbf24", background: "rgba(251,191,36,0.1)" }}
                    >
                      &uarr; Redirect spending
                    </div>
                    <div className="mb-3 text-[13px] leading-relaxed" style={{ color: "#c9d1d9" }}>
                      You spent <strong className="font-semibold text-white">$87 on Uber</strong> last
                      month. Your{" "}
                      <span className="font-bold" style={{ color: "#58A6FF" }}>
                        $10/mo Lyft credit
                      </span>{" "}
                      is sitting unused.
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="font-data font-bold"
                        style={{
                          fontSize: 28,
                          color: "#58A6FF",
                          letterSpacing: "-0.02em",
                          fontVariantNumeric: "tabular-nums",
                          opacity: 0,
                          animation: "hiw-amount-count 4.5s ease-in-out infinite",
                        }}
                      >
                        $120
                      </span>
                      <span
                        className="text-[12px]"
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

                <h3 className="mb-2 text-[20px] font-bold">Get personalized insights</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "#8b95a8" }}>
                  Missed credits, better merchants, expiring benefits, and what
                  you&apos;d save by switching cards. Tailored to your actual spending.
                </p>
              </div>
            </ScrollReveal>
          </div>
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
              className="mb-4 text-center text-[clamp(28px,4vw,42px)] font-bold leading-[1.15]"
              style={{ letterSpacing: "-0.02em" }}
            >
              See every dollar you&apos;re
              <br className="hidden sm:block" />
              leaving on the table
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p className="mx-auto mb-12 max-w-[540px] text-center text-[17px] leading-relaxed text-[var(--text-secondary)]">
              Zurp maps your transactions against your card&apos;s full benefit
              catalog &mdash; credits, promos, multipliers &mdash; and shows
              exactly what you&apos;ve captured and what you&apos;re missing.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="mx-auto max-w-[680px] overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827]">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[rgba(255,255,255,0.06)] px-7 py-6">
                <div>
                  <div
                    className="text-[13px] font-semibold uppercase tracking-[0.06em]"
                    style={{ color: "#c5cbe8" }}
                  >
                    Chase Sapphire Reserve
                  </div>
                  <div
                    className="mt-1 text-[12px]"
                    style={{ color: "#6b7280" }}
                  >
                    $795/yr annual fee
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="font-data text-[28px] font-bold"
                    style={{ color: "#34d399", letterSpacing: "-0.02em" }}
                  >
                    +$175
                  </div>
                  <div
                    className="mt-0.5 text-[11px]"
                    style={{ color: "#6b7280" }}
                  >
                    net value this year
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="border-b border-[rgba(255,255,255,0.06)] px-7 py-5">
                <div className="mb-2.5 flex items-baseline justify-between">
                  <div className="text-[15px] font-medium text-[#e5e7eb]">
                    <span className="font-bold text-[#34d399]">$970</span>{" "}
                    captured
                  </div>
                  <div className="text-[13px]" style={{ color: "#6b7280" }}>
                    of $1,690 available
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded bg-[rgba(255,255,255,0.06)]">
                  <div
                    className="h-full rounded"
                    style={{
                      width: "57%",
                      background: "linear-gradient(90deg, #34d399, #22d3ee)",
                    }}
                  />
                </div>
              </div>

              {/* Benefit rows */}
              <div className="py-2">
                {trackerRows.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center gap-3.5 px-7 py-3.5 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
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
                          className="h-full rounded-sm"
                          style={{
                            width: `${row.pct}%`,
                            background:
                              row.status === "full"
                                ? "#34d399"
                                : row.status === "partial"
                                ? "#fbbf24"
                                : "#4b5563",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="border-t border-[rgba(255,255,255,0.06)] px-7 py-4 text-[11px]"
                style={{ color: "#4b5563" }}
              >
                6 of 12 benefits tracked &middot; Updated today
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-[1080px] px-6">
        <hr className="border-t border-[rgba(255,255,255,0.06)]" />
      </div>

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
              See what you&apos;d gain &mdash; or lose
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p className="mx-auto mb-12 max-w-[540px] text-center text-[17px] leading-relaxed text-[var(--text-secondary)]">
              Based on your real spending, Zurp calculates the exact dollar
              difference if you switched cards. No guesswork, no affiliate bias.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="mx-auto max-w-[780px] overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827]">
              {/* Headline */}
              <div className="border-b border-[rgba(255,255,255,0.06)] px-7 py-6">
                <div className="text-[20px] font-bold text-white mb-1">
                  The{" "}
                  <span style={{ color: "#34d399" }}>Sapphire Preferred</span>{" "}
                  would save you $755/yr
                </div>
                <div className="text-[13px]" style={{ color: "#6b7280" }}>
                  Based on your $47,411 in spending over the last 12 months
                </div>
              </div>

              {/* Card rows */}
              <div className="py-2">
                {compareCards.map((card) => (
                  <div
                    key={card.rank}
                    className="flex items-center gap-5 px-7 py-5 border-b border-[rgba(255,255,255,0.04)] last:border-b-0"
                    style={{ background: card.rowBg }}
                  >
                    {/* Rank */}
                    <div
                      className="text-[14px] font-bold shrink-0 w-5"
                      style={{ color: "#4b5563" }}
                    >
                      {card.rank}
                    </div>

                    {/* Card info */}
                    <div className="shrink-0 min-w-[160px]">
                      <div className="flex items-center gap-2 text-[15px] font-semibold text-[#e5e7eb]">
                        {card.name}
                        {card.badge === "best" && (
                          <span className="inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] bg-[rgba(52,211,153,0.15)] text-[#34d399]">
                            Best value
                          </span>
                        )}
                        {card.badge === "current" && (
                          <span className="inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] bg-[rgba(59,130,246,0.15)] text-[#60a5fa]">
                            Your card
                          </span>
                        )}
                      </div>
                      <div
                        className="mt-0.5 text-[12px]"
                        style={{ color: "#6b7280" }}
                      >
                        {card.fee}
                      </div>
                    </div>

                    {/* Stacked bar */}
                    <div className="flex-1 min-w-0 hidden sm:block">
                      <div className="flex h-7 overflow-hidden rounded-md bg-[rgba(255,255,255,0.04)]">
                        <div
                          className="flex items-center justify-center text-[11px] font-semibold text-white/90 whitespace-nowrap"
                          style={{
                            width: `${card.pointsPct}%`,
                            background: card.pointsColor,
                          }}
                        >
                          {card.pointsPct > 15 ? card.pointsLabel : ""}
                        </div>
                        <div
                          className="flex items-center justify-center text-[11px] font-semibold text-white/90 whitespace-nowrap"
                          style={{
                            width: `${card.benefitsPct}%`,
                            background: "rgba(52,211,153,0.5)",
                          }}
                        >
                          {card.benefitsPct > 10 ? card.benefitsLabel : ""}
                        </div>
                        <div
                          className="flex items-center justify-center text-[11px] font-semibold text-white/70 whitespace-nowrap"
                          style={{
                            width: `${card.feePct}%`,
                            background: "rgba(239,68,68,0.25)",
                          }}
                        >
                          {card.feePct > 6 ? card.feeLabel : ""}
                        </div>
                      </div>
                      {/* Legend dots */}
                      <div
                        className="mt-1.5 flex gap-1 text-[11px]"
                        style={{
                          color: "#6b7280",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                          Points
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                          Benefits
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                          Fee
                        </span>
                      </div>
                    </div>

                    {/* Net value */}
                    <div className="text-right shrink-0 min-w-[70px]">
                      <div
                        className="font-data text-[22px] font-bold"
                        style={{
                          color: card.netColor,
                          letterSpacing: "-0.02em",
                          fontVariantNumeric: "tabular-nums",
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
                ))}
              </div>

              {/* Footer */}
              <div
                className="border-t border-[rgba(255,255,255,0.06)] px-7 py-4 text-[11px] leading-relaxed"
                style={{ color: "#4b5563" }}
              >
                Points valued conservatively (Chase UR: 1.25&cent;, Amex MR:
                1.0&cent;). Transfer partner redemptions can yield higher value.
                Your card shows benefits actually captured; other cards show
                total available benefits.
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════ INSIGHT EXAMPLES ════════ */}
      <section className="py-24" id="insights">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-4 text-center">
              Powered by your real data
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-16 text-center text-[clamp(28px,4vw,40px)] font-bold leading-tight"
              style={{ letterSpacing: "-1px" }}
            >
              Insights that actually save you money
            </h2>
          </ScrollReveal>

          <div className="mx-auto flex max-w-[600px] flex-col gap-3">
            {insights.map((insight, i) => (
              <ScrollReveal key={i}>
                <div className="flex gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-5 transition-all hover:border-[var(--border-strong)] hover:translate-x-1">
                  <span
                    className={`mt-0.5 shrink-0 rounded px-2 py-1 text-[10px] font-bold tracking-wide ${insight.tagColor}`}
                  >
                    {insight.tag}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                      {insight.text}
                    </p>
                    <p className="mt-1.5 text-[11px] text-[var(--text-secondary)]">
                      {insight.meta}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
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
              Your card has more value
              <br />
              than you think.
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p className="mb-10 text-base text-[var(--text-secondary)]">
              Connect in 2 minutes. See what you&apos;re missing today.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <div className="mb-3 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-[var(--bg-primary)] transition-all hover:-translate-y-px hover:shadow-[var(--shadow-glow)] hover:opacity-90"
              >
                zurp your card &rarr;
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <p className="mt-3 text-[13px] text-[var(--text-secondary)]">
              Free to use. Secure, read-only connection via Plaid.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-[var(--border-default)] py-10">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="text-[13px] text-[var(--text-secondary)]">
            &copy; 2026 Zurp
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
