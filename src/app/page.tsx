import Link from "next/link";
import { CreditCard, TrendingUp, Bell, Shield } from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Track Every Benefit",
    description:
      "See all your card credits in one place — travel, dining, subscriptions, and more.",
  },
  {
    icon: TrendingUp,
    title: "Know Your ROI",
    description:
      "Real-time tracking of how much value you've captured versus your annual fee.",
  },
  {
    icon: Bell,
    title: "Never Miss a Credit",
    description:
      "Countdown timers and alerts so expiring benefits don't slip through the cracks.",
  },
  {
    icon: Shield,
    title: "Secure Bank Linking",
    description:
      "Powered by Plaid with encrypted access tokens. We never store your credentials.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-[var(--space-3xl)]">
        <div className="text-center">
          {/* Logo icon */}
          <div className="mb-6 flex justify-center">
            <svg width="50" height="34" viewBox="0 0 50 34" fill="none">
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
          </div>

          {/* Wordmark */}
          <h1 className="text-h1 font-semibold tracking-tight text-[var(--text-primary)]">
            zurp
          </h1>

          {/* Tagline */}
          <p className="label-caps mt-3">Your Card Benefits</p>

          {/* Headline */}
          <p className="mx-auto mt-[var(--space-lg)] max-w-md text-[var(--text-h3)] leading-snug text-[var(--text-secondary)]">
            Stop losing money on unused card benefits. Track credits, see
            what&apos;s expiring, and know if your card is paying for itself.
          </p>

          {/* CTA */}
          <div className="mt-[var(--space-xl)]">
            <Link
              href="/login"
              className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--accent)] px-8 py-3 text-[var(--text-body)] font-medium text-[var(--color-void)] transition-all duration-[var(--duration-fast)] hover:opacity-90 hover:shadow-[var(--shadow-glow)]"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-[var(--space-3xl)] grid max-w-3xl grid-cols-1 gap-[var(--space-lg)] sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-[var(--space-lg)] transition-shadow duration-[var(--duration-default)] hover:shadow-[var(--shadow-md)]"
            >
              <feature.icon
                size={20}
                strokeWidth={1.75}
                className="text-[var(--accent)]"
              />
              <h3 className="mt-[var(--space-sm)] font-semibold text-[var(--text-primary)]">
                {feature.title}
              </h3>
              <p className="mt-1 text-[var(--text-caption)] leading-relaxed text-[var(--text-secondary)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] py-[var(--space-lg)] text-center text-[var(--text-caption)] text-[var(--text-secondary)]">
        <p>zurp — track your card benefits</p>
      </footer>
    </div>
  );
}
