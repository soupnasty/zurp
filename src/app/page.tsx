import Link from "next/link";
import {
  Plane,
  Building,
  UtensilsCrossed,
  Ticket,
  Bike,
  Car,
  Dumbbell,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { chaseSapphireReserve } from "@/lib/cards/chase-sapphire-reserve";

// Build display benefits from the real card registry
// Group biannual H1+H2, merge DoorDash sub-credits, annualize monthly
const iconMap: Record<string, React.ComponentType<any>> = {
  Plane,
  Building,
  UtensilsCrossed,
  Ticket,
  Bike,
  Car,
  Dumbbell,
  ShieldCheck,
};

interface DisplayBenefit {
  icon: React.ComponentType<any>;
  name: string;
  amount: number;
  cycle: string;
  annualValue: number;
  used: number;
  pct: number;
}

function buildDisplayBenefits(): {
  benefits: DisplayBenefit[];
  totalAnnual: number;
} {
  const card = chaseSapphireReserve;
  const grouped = new Map<string, DisplayBenefit>();
  const result: DisplayBenefit[] = [];

  // Demo usage to make the card look realistic
  const demoUsage: Record<string, { used: number; pct: number }> = {
    "Travel Credit": { used: 127, pct: 42 },
    "The Edit Hotels": { used: 0, pct: 0 },
    "Exclusive Tables": { used: 150, pct: 50 },
    StubHub: { used: 90, pct: 30 },
    DoorDash: { used: 25, pct: 100 },
    Lyft: { used: 0, pct: 0 },
    Peloton: { used: 10, pct: 100 },
    "Global Entry": { used: 0, pct: 0 },
  };

  for (const b of card.benefits) {
    // Skip subscriptions ($0 value)
    if (b.type === "subscription") continue;

    // DoorDash sub-credits → group into one
    if (b.displayGroup === "csr_doordash") {
      const existing = grouped.get("doordash");
      if (existing) {
        existing.amount += b.creditAmount;
        existing.annualValue += b.creditAmount * 12;
      } else {
        grouped.set("doordash", {
          icon: iconMap[b.icon] || Bike,
          name: "DoorDash",
          amount: b.creditAmount,
          cycle: "/mo",
          annualValue: b.creditAmount * 12,
          ...demoUsage["DoorDash"],
        });
      }
      continue;
    }

    // Biannual H1+H2 → merge into yearly
    if (b.cycle === "biannual_h1") {
      const baseName = b.name.replace(" (H1)", "");
      const displayName = baseName
        .replace("The Edit Hotel Credit", "The Edit Hotels")
        .replace(" Credit", "");
      grouped.set(baseName, {
        icon: iconMap[b.icon] || Plane,
        name: displayName,
        amount: b.creditAmount,
        cycle: "/yr",
        annualValue: b.creditAmount,
        ...(demoUsage[displayName] || { used: 0, pct: 0 }),
      });
      continue;
    }
    if (b.cycle === "biannual_h2") {
      const baseName = b.name.replace(" (H2)", "");
      const existing = grouped.get(baseName);
      if (existing) {
        existing.amount += b.creditAmount;
        existing.annualValue += b.creditAmount;
      }
      continue;
    }

    // Monthly benefits → show per-month amount, annualize for total
    if (b.cycle === "monthly") {
      const displayName = b.name.replace(" Credit", "");
      result.push({
        icon: iconMap[b.icon] || Plane,
        name: displayName,
        amount: b.creditAmount,
        cycle: "/mo",
        annualValue: b.creditAmount * 12,
        ...(demoUsage[displayName] || { used: 0, pct: 0 }),
      });
      continue;
    }

    // Quadrennial (Global Entry) → show face value, use /4yr
    if (b.cycle === "quadrennial") {
      result.push({
        icon: iconMap[b.icon] || ShieldCheck,
        name: "Global Entry",
        amount: b.creditAmount,
        cycle: "/4yr",
        annualValue: b.creditAmount,
        ...demoUsage["Global Entry"],
      });
      continue;
    }

    // Annual → show as-is
    const displayName = b.name.replace(" Credit", "");
    result.push({
      icon: iconMap[b.icon] || Plane,
      name: displayName,
      amount: b.creditAmount,
      cycle: "/yr",
      annualValue: b.creditAmount,
      ...(demoUsage[displayName] || { used: 0, pct: 0 }),
    });
  }

  const allBenefits = [...grouped.values(), ...result];
  const totalAnnual = allBenefits.reduce((sum, b) => sum + b.annualValue, 0);

  return { benefits: allBenefits, totalAnnual };
}

const { benefits, totalAnnual } = buildDisplayBenefits();

// Demo values for the card header
const totalUsed = benefits.reduce((sum, b) => sum + b.used, 0);
const effectiveFee = chaseSapphireReserve.annualFee - totalUsed;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center px-4 pt-[var(--space-3xl)] pb-[var(--space-2xl)]">
        {/* Logo */}
        <div className="mb-[var(--space-xl)] flex items-center gap-[var(--space-sm)]">
          <svg width="56" height="38" viewBox="0 0 50 34" fill="none">
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
          <span className="text-[40px] font-semibold tracking-tight">
            zurp
          </span>
        </div>

        {/* Subheader + CTA */}
        <div className="mb-[var(--space-xl)] max-w-lg text-center">
          <p className="text-[var(--text-h3)] leading-relaxed text-[var(--text-primary)]">
            Zurp tracks your card benefits automatically — so you always know
            what you&apos;ve used, what&apos;s left, and what&apos;s expiring
            soon.
          </p>

          <div className="mt-[var(--space-lg)] flex flex-col items-center gap-[var(--space-sm)]">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-8 py-3.5 text-[16px] font-semibold text-[var(--color-void)] transition-all duration-[var(--duration-fast)] hover:opacity-90 hover:shadow-[var(--shadow-glow)]"
            >
              Connect Your Card
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <span className="text-[var(--text-caption)] text-[var(--text-secondary)]">
              Secure, read-only connection via Plaid
            </span>
          </div>
        </div>

        {/* Card showcase */}
        <div className="mx-auto w-full max-w-lg">
          {/* Headline */}
          <h1 className="mb-[var(--space-lg)] text-center text-[clamp(24px,4vw,36px)] font-bold leading-[1.1] tracking-tight text-[var(--text-primary)]">
            Your card comes with{" "}
            <br />
            <span className="text-[var(--color-success)]">
              ${totalAnnual.toLocaleString()}
            </span>{" "}
            in benefits.
            <br />
            <span className="text-[var(--text-secondary)]">
              Are you using them?
            </span>
          </h1>
          {/* Card header */}
          <div className="rounded-t-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-[var(--space-lg)] py-[var(--space-md)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-caps">Chase Sapphire Reserve</p>
                <p className="mt-1 text-[var(--text-h2)] font-bold tracking-tight text-[var(--text-primary)]">
                  <span className="font-data">${totalUsed.toFixed(2)}</span>
                  <span className="text-[var(--text-body)] font-normal text-[var(--text-secondary)]">
                    {" "}
                    of ${totalAnnual.toLocaleString()} used
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[var(--text-caption)] text-[var(--text-secondary)]">
                  Effective fee
                </p>
                <p className="font-data text-[var(--text-h3)] font-bold text-[var(--color-warning)]">
                  ${effectiveFee.toFixed(2)}
                </p>
              </div>
            </div>
            {/* Overall progress */}
            <div className="mt-[var(--space-sm)] h-2 w-full overflow-hidden rounded-full bg-[var(--border-default)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{
                  width: `${Math.round((totalUsed / totalAnnual) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Benefits list */}
          <div className="rounded-b-[var(--radius-xl)] border border-t-0 border-[var(--border-default)] bg-[var(--bg-secondary)]">
            {benefits.map((b, i) => (
              <div
                key={b.name}
                className={`flex items-center gap-[var(--space-md)] px-[var(--space-lg)] py-[var(--space-sm)] ${
                  i !== benefits.length - 1
                    ? "border-b border-[var(--border-default)]"
                    : ""
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)]/10">
                  <b.icon
                    size={16}
                    strokeWidth={1.75}
                    className="text-[var(--accent)]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-primary)]">{b.name}</span>
                    <span className="font-data text-[var(--text-caption)]">
                      <span
                        className={
                          b.pct === 100
                            ? "text-[var(--color-success)]"
                            : b.pct === 0
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-primary)]"
                        }
                      >
                        ${b.used}
                      </span>
                      <span className="text-[var(--text-secondary)]">
                        {" "}
                        / ${b.amount}
                        {b.cycle}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--border-default)]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.pct === 100
                          ? "bg-[var(--color-success)]"
                          : b.pct >= 50
                          ? "bg-[var(--accent)]"
                          : b.pct > 0
                          ? "bg-[var(--color-warning)]"
                          : "bg-[var(--color-danger)]"
                      }`}
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Urgency nudge */}
          <div className="mt-[var(--space-md)] rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-[var(--space-lg)] py-[var(--space-md)]">
            <p className="text-center text-[var(--text-primary)]">
              <span className="font-semibold text-[var(--color-danger)]">
                $10 in Lyft credits
              </span>{" "}
              expire in 6 days.
              <br />
              <span className="text-[var(--text-secondary)]">
                You&apos;ve left{" "}
                <span className="font-data font-semibold text-[var(--color-warning)]">
                  ${(totalAnnual - totalUsed).toFixed(0)}
                </span>{" "}
                on the table this year.
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] py-[var(--space-lg)] text-center text-[var(--text-caption)] text-[var(--text-secondary)]">
        <p>
          zurp — track your card benefits
          <span className="mx-2">&middot;</span>
          <Link href="/privacy" className="hover:text-[var(--accent)]">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
