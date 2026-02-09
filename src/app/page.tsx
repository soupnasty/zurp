import Link from "next/link";
import { MobileNav } from "./_components/MobileNav";
import { ScrollReveal } from "./_components/ScrollReveal";

/* ── Card marquee data ── */
const cards = [
  {
    name: "Chase Sapphire Reserve",
    swatch:
      "bg-gradient-to-br from-[#1a1a2e] to-[#2d3561] border border-[#3d4571]",
  },
  {
    name: "Chase Sapphire Preferred",
    swatch:
      "bg-gradient-to-br from-[#1a2744] to-[#2c4a7c] border border-[#3c5a8c]",
  },
  {
    name: "Amex Gold",
    swatch:
      "bg-gradient-to-br from-[#8b6914] to-[#c9a227] border border-[#d4b03a]",
    soon: true,
  },
  {
    name: "Amex Platinum",
    swatch:
      "bg-gradient-to-br from-[#6b6b6b] to-[#a8a8a8] border border-[#b8b8b8]",
    soon: true,
  },
  {
    name: "Capital One Venture X",
    swatch:
      "bg-gradient-to-br from-[#1a1a1a] to-[#333333] border border-[#4a4a4a]",
    soon: true,
  },
  {
    name: "Citi Strata Elite",
    swatch:
      "bg-gradient-to-br from-[#0a2e5c] to-[#1a5276] border border-[#2a6286]",
    soon: true,
  },
];

/* ── Tracker mockup rows ── */
const trackerRows = [
  {
    icon: "\u2708",
    name: "Travel Credit",
    used: "$300",
    total: "$300",
    cycle: "/yr",
    pct: 100,
    color: "bg-[var(--color-success)]",
    iconBg: "bg-[rgba(88,166,255,0.1)] text-[var(--color-info)]",
    full: true,
  },
  {
    icon: "\u2715",
    name: "Exclusive Tables",
    used: "$150",
    total: "$300",
    cycle: "/yr",
    pct: 50,
    color: "bg-[var(--color-info)]",
    iconBg: "bg-[rgba(210,153,34,0.1)] text-[var(--color-warning)]",
    full: false,
  },
  {
    icon: "S",
    name: "StubHub",
    used: "$90",
    total: "$300",
    cycle: "/yr",
    pct: 30,
    color: "bg-[var(--color-warning)]",
    iconBg: "bg-[rgba(248,81,73,0.1)] text-[var(--color-danger)]",
    full: false,
  },
  {
    icon: "D",
    name: "DoorDash",
    used: "$25",
    total: "$25",
    cycle: "/mo",
    pct: 100,
    color: "bg-[var(--color-success)]",
    iconBg: "bg-[rgba(63,185,80,0.1)] text-[var(--color-success)]",
    full: true,
  },
  {
    icon: "L",
    name: "Lyft",
    used: "$10",
    total: "$10",
    cycle: "/mo",
    pct: 100,
    color: "bg-[rgba(167,139,250,1)]",
    iconBg: "bg-[rgba(167,139,250,0.1)] text-[#a78bfa]",
    full: true,
  },
];

/* ── Compare diff rows ── */
const diffRows = [
  { name: "Lower annual fee", delta: "+$700", type: "gain" as const },
  {
    name: "Travel credit lost ($300/yr)",
    delta: "\u2212$300",
    type: "lose" as const,
  },
  {
    name: "DoorDash credits lost ($25/mo)",
    delta: "\u2212$300",
    type: "lose" as const,
  },
  {
    name: "Edit Hotel credits lost ($500/yr)",
    delta: "\u2212$420",
    type: "lose" as const,
  },
  {
    name: "Lyft/Peloton credits lost",
    delta: "\u2212$240",
    type: "lose" as const,
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
            <div className="flex h-[22px] w-8 items-center justify-center gap-[3px] rounded border-[2.5px] border-[var(--accent)]">
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
            </div>
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
              href="#track-compare"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Track & Compare
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
            worth.
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
      <div className="relative overflow-hidden border-y border-[var(--border-default)] py-10">
        {/* Fade edges */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-[2] w-20 bg-gradient-to-r from-[var(--bg-primary)] to-transparent" />
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 z-[2] w-20 bg-gradient-to-l from-[var(--bg-primary)] to-transparent" />

        <div className="marquee-track flex w-max items-center gap-12">
          {/* Render cards twice for seamless loop */}
          {[...cards, ...cards].map((card, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center gap-2.5 text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap"
            >
              <div className={`h-6 w-9 shrink-0 rounded ${card.swatch}`} />
              {card.name}
              {card.soon && (
                <span className="rounded bg-[rgba(210,153,34,0.1)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-warning)]">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ════════ DUAL VALUE PROPS ════════ */}
      <section className="py-24" id="track-compare">
        <div className="mx-auto max-w-[1080px] px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* VP1: Track */}
            <ScrollReveal>
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-10 transition-colors hover:border-[var(--border-strong)]">
                <p className="label-caps mb-4">Track</p>
                <h2
                  className="mb-3 text-2xl font-bold leading-tight"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  See every dollar you&apos;re leaving on the table.
                </h2>
                <p className="mb-8 text-[15px] leading-relaxed text-[var(--text-secondary)]">
                  Zurp monitors your transactions and maps them against your
                  card&apos;s full benefit catalog. Credits, promos, multipliers
                  &mdash; tracked automatically.
                </p>

                {/* Tracker mockup */}
                <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[#111820]">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-4">
                    <span className="label-caps">Chase Sapphire Reserve</span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      Net cost{" "}
                      <span className="font-data text-[var(--color-success)]">
                        &minus;$175
                      </span>
                    </span>
                  </div>
                  {/* Total */}
                  <div className="border-b border-[var(--border-default)] px-5 py-4">
                    <div className="font-data text-[22px] font-semibold text-[var(--color-info)]">
                      $970.00
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      of $1,690 available this year
                    </div>
                    <div className="mt-2 h-[3px] overflow-hidden rounded-sm bg-[var(--border-default)]">
                      <div className="h-full w-[57%] rounded-sm bg-[var(--color-info)]" />
                    </div>
                  </div>
                  {/* Rows */}
                  <div className="py-1">
                    {trackerRows.map((row) => (
                      <div
                        key={row.name}
                        className="flex items-center gap-3 px-5 py-3"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${row.iconBg}`}
                        >
                          {row.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-[13px] font-medium text-[var(--text-primary)]">
                            {row.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-data text-xs text-[var(--text-secondary)]">
                            <span
                              className={
                                row.full ? "text-[var(--color-success)]" : ""
                              }
                            >
                              {row.used}
                            </span>{" "}
                            / {row.total}
                            <span className="text-[var(--text-secondary)]">
                              {row.cycle}
                            </span>
                          </div>
                          <div className="mt-1 h-[2px] w-full overflow-hidden rounded-sm bg-[var(--border-default)]">
                            <div
                              className={`h-full rounded-sm ${row.color}`}
                              style={{ width: `${row.pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* VP2: Compare */}
            <ScrollReveal>
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-10 transition-colors hover:border-[var(--border-strong)]">
                <p className="label-caps mb-4">Compare</p>
                <h2
                  className="mb-3 text-2xl font-bold leading-tight"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  See what you&apos;d gain &mdash; or lose &mdash; on another
                  card.
                </h2>
                <p className="mb-8 text-[15px] leading-relaxed text-[var(--text-secondary)]">
                  Based on your real spending, Zurp calculates the exact dollar
                  difference if you switched cards. No guesswork, no affiliate
                  bias.
                </p>

                {/* Compare mockup */}
                <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[#111820]">
                  <div className="border-b border-[var(--border-default)] px-5 py-4">
                    <span className="label-caps">
                      Based on your last 12 months
                    </span>
                  </div>
                  {/* Card comparison row */}
                  <div className="grid grid-cols-2 border-b border-[var(--border-default)]">
                    <div className="border-r border-[var(--border-default)] px-5 py-4 text-center">
                      <div
                        className="label-caps !text-[var(--color-info)] mb-1"
                        style={{ fontSize: "10px" }}
                      >
                        Your card
                      </div>
                      <div className="font-data text-xl font-semibold text-[var(--color-info)]">
                        Sapphire Reserve
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                        $795/yr fee
                      </div>
                    </div>
                    <div className="px-5 py-4 text-center">
                      <div
                        className="label-caps mb-1"
                        style={{ fontSize: "10px" }}
                      >
                        Comparing
                      </div>
                      <div className="font-data text-xl font-semibold text-[var(--color-warning)]">
                        Sapphire Preferred
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                        $95/yr fee
                      </div>
                    </div>
                  </div>
                  {/* Diff rows */}
                  <div className="py-1">
                    {diffRows.map((row) => (
                      <div
                        key={row.name}
                        className="flex items-center justify-between px-5 py-2.5"
                      >
                        <span className="text-[13px] text-[var(--text-secondary)]">
                          {row.name}
                        </span>
                        <span
                          className={`font-data rounded px-2 py-0.5 text-xs font-medium ${
                            row.type === "gain"
                              ? "bg-[rgba(63,185,80,0.08)] text-[var(--color-success)]"
                              : "bg-[rgba(248,81,73,0.08)] text-[var(--color-danger)]"
                          }`}
                        >
                          {row.delta}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Bottom verdict */}
                  <div className="flex items-center justify-between border-t border-[var(--border-default)] px-5 py-3.5">
                    <span className="text-[13px] font-semibold">
                      Net:{" "}
                      <span className="font-data text-[var(--color-danger)]">
                        &minus;$560/yr
                      </span>{" "}
                      on Preferred
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      Keep your Sapphire Reserve
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="py-24" id="how">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-4">How it works</p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-16 text-[clamp(28px,4vw,40px)] font-bold leading-tight"
              style={{ letterSpacing: "-1px" }}
            >
              Three minutes to stop wasting money.
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Connect via Plaid",
                desc: "Read-only access to your transactions. We never see your card number, login, or balance.",
              },
              {
                num: "02",
                title: "We scan your spending",
                desc: "Zurp maps every transaction against your card\u2019s full benefit catalog \u2014 credits, multipliers, promos, partner perks.",
              },
              {
                num: "03",
                title: "Get insights weekly",
                desc: "Missed credits, better merchants, expiring benefits, and what you\u2019d save by switching cards. Personalized to your actual spending.",
              },
            ].map((step) => (
              <ScrollReveal key={step.num}>
                <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-8 transition-colors hover:border-[var(--border-strong)]">
                  <div className="font-data mb-5 text-xs text-[var(--text-secondary)]">
                    {step.num}
                  </div>
                  <h3
                    className="mb-2 text-lg font-semibold"
                    style={{ letterSpacing: "-0.3px" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {step.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ INSIGHT EXAMPLES ════════ */}
      <section className="py-24" id="insights">
        <div className="mx-auto max-w-[1080px] px-6">
          <ScrollReveal>
            <p className="label-caps mb-4">Powered by your real data</p>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              className="mb-16 text-[clamp(28px,4vw,40px)] font-bold leading-tight"
              style={{ letterSpacing: "-1px" }}
            >
              Insights that actually save you money.
            </h2>
          </ScrollReveal>

          <div className="flex max-w-[600px] flex-col gap-3">
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
            <span className="text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-secondary)]">
              Terms
            </span>
            <span className="text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-secondary)]">
              Security
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
