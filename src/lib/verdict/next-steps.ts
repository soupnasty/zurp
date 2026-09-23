import type { IssuerPolicy } from "@/lib/cards/issuer-policies";
import type { VerdictDisplay } from "./decide";

export interface NextStep {
  title: string;
  body: string;
}

export interface NextStepsCard {
  cardId: string;
  cardName: string;
  annualFee: number;
}

export interface NextStepsInput {
  state: VerdictDisplay;
  yours: NextStepsCard & { pointsCurrency: string | null };
  compareTo: NextStepsCard;
  /** compareTo.net − yours.net. */
  gap: number;
  /** When the next annual fee posts (the next card anniversary); null when unknown. */
  feePostsAt: Date | null;
  /** For not_yet: when enough history will exist. */
  verdictReadyAt?: Date | null;
}

export interface NextSteps {
  /** The one deadline sentence the page shows. */
  deadline: string;
  steps: NextStep[];
  /** What switching away costs (switch only). */
  giveUp: string[];
  caveat: string | null;
}

const LOYALTY_PROGRAMS: Record<string, string> = {
  united_miles: "MileagePlus",
  hyatt_points: "World of Hyatt",
  ihg_points: "IHG One Rewards",
  southwest_rr: "Rapid Rewards",
  delta_skymiles: "SkyMiles",
  hilton_points: "Hilton Honors",
  bilt_points: "Bilt Rewards",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
const money = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
const DAY_MS = 24 * 60 * 60 * 1000;

function pointsLine(currency: string | null, policy: IssuerPolicy | null): string {
  if (currency && LOYALTY_PROGRAMS[currency]) {
    const program = LOYALTY_PROGRAMS[currency];
    return `Your ${program} points live in your ${program} account and aren't affected.`;
  }
  if (currency === "cash_back") return "Redeem any cash back before the card closes.";
  return policy?.pointsOnClose ?? "Use or move your points before the card closes.";
}

function deadlineFor(input: NextStepsInput, policy: IssuerPolicy | null): string {
  const { state, feePostsAt, yours } = input;
  const fee = money(yours.annualFee);
  if (yours.annualFee === 0) return "No annual fee, so there's no deadline. Keeping the card costs nothing.";
  if (!feePostsAt) return "Set your card anniversary in Settings to see your deadline.";
  const posts = fmtDate(feePostsAt);

  if (state === "keep") return `Your ${fee} fee posts ${posts}. Nothing to do if you keep the card.`;
  if (state === "not_yet") return `Your next ${fee} fee posts ${posts}. You'll have a verdict before then.`;

  const issuer = policy?.displayName ?? "Your issuer";
  const refund = policy?.feeRefund;
  if (refund?.published) {
    const by = fmtDate(new Date(feePostsAt.getTime() + refund.days * DAY_MS));
    const from = refund.from === "fee_statement" ? "of the statement that shows it" : "of it posting";
    return `Decide by about ${by}. Your ${fee} fee posts ${posts}, and ${issuer} refunds it if you close or switch cards within ${refund.days} days ${from}.`;
  }
  if (refund) {
    return `Decide before ${posts}, when your ${fee} fee posts. ${issuer} doesn't publish a refund policy (cardholders report about ${refund.days} days), so don't count on one.`;
  }
  return `Decide before ${posts}, when your ${fee} fee posts. ${issuer} doesn't publish a refund for it.`;
}

/**
 * The checklist under the verdict: what to do, in order, grounded in the
 * issuer's actual rules for refunds, product changes and points.
 */
export function buildNextSteps(input: NextStepsInput, policy: IssuerPolicy | null): NextSteps {
  const { state, yours, compareTo, gap } = input;
  const issuer = policy?.displayName ?? "your issuer";
  const offersRetention = policy?.retentionOffers === "common" || policy?.retentionOffers === "occasional";
  const downgrade = policy?.downgrades[yours.cardId] ?? null;
  const switchIsProductChange = !!downgrade?.cardId && downgrade.cardId === compareTo.cardId;
  const points = pointsLine(yours.pointsCurrency, policy);

  const keepPointsStep = (): NextStep =>
    downgrade
      ? {
          title: `Switch the ${yours.cardName} to ${downgrade.name} instead of closing it`,
          body: `${downgrade.annualFee === 0 ? "No annual fee" : `A ${money(downgrade.annualFee)}/yr fee`}, no new application, and you keep your credit history. ${points}`,
        }
      : { title: "Before you close it", body: points };

  const steps: NextStep[] = [];
  // A no-fee card never needs closing: add the better card alongside it.
  if (yours.annualFee === 0 && (state === "switch" || state === "toss_up")) {
    if (state === "switch") {
      steps.push({ title: `Apply for the ${compareTo.cardName}`, body: "A new application, with a hard credit check. Use it for the spending where it earns more." });
    } else {
      steps.push({ title: "Nothing urgent", body: `The ${compareTo.cardName} is only slightly ahead, and your card costs nothing to keep.` });
    }
    steps.push({ title: `Keep the ${yours.cardName} open`, body: "It has no fee, and an older account helps your credit history." });
    return { deadline: deadlineFor(input, policy), steps, giveUp: [], caveat: null };
  }
  if (state === "switch") {
    if (offersRetention) {
      steps.push({
        title: `Ask ${issuer} for a retention offer first`,
        body: `Call the number on your card. An offer worth about ${money(gap)} or more makes keeping the ${yours.cardName} the better deal.`,
      });
    }
    if (switchIsProductChange) {
      steps.push({
        title: `Ask ${issuer} to switch you to the ${compareTo.cardName}`,
        body: `This is a product change: no new application or credit check. ${points}`,
      });
    } else {
      steps.push({ title: `Apply for the ${compareTo.cardName}`, body: "A new application, with a hard credit check." });
      steps.push(keepPointsStep());
    }
  } else if (state === "toss_up") {
    if (offersRetention) {
      steps.push({
        title: `Ask ${issuer} for a retention offer`,
        body: "On a tie, even a small offer makes keeping the card the better choice.",
      });
    }
    steps.push({
      title: `No offer? Lean toward the ${compareTo.cardName}`,
      body:
        compareTo.annualFee < yours.annualFee
          ? `Its ${compareTo.annualFee === 0 ? "lack of an annual fee" : `lower fee (${money(compareTo.annualFee)})`} carries less risk if your spending changes.`
          : "It edges ahead on your spending.",
    });
    steps.push(keepPointsStep());
  } else if (state === "keep") {
    steps.push({ title: "Nothing to do", body: "Keeping the card needs no action." });
    steps.push({ title: "Use what you're not using yet", body: "Rewards lists the credits and points you're leaving on the table." });
    if (policy?.retentionOffers === "common") {
      steps.push({ title: "Ask for a retention offer anyway", body: `${issuer} offers them to cardholders who plan to keep the card, too.` });
    }
  } else {
    steps.push({ title: "Use your credits", body: "Rewards shows what's available and what resets soon." });
    steps.push({
      title: "We'll tell you when your verdict is ready",
      body: input.verdictReadyAt
        ? `Around ${MONTHS[input.verdictReadyAt.getUTCMonth()]}, once we have 6 months of your spending.`
        : "Once we have 6 months of your spending.",
    });
  }

  return {
    deadline: deadlineFor(input, policy),
    steps,
    giveUp: state === "switch" && !switchIsProductChange ? [`The ${yours.cardName}'s credits and perks.`, points] : [],
    caveat: state === "switch" || state === "toss_up" ? (policy?.caveat ?? null) : null,
  };
}
