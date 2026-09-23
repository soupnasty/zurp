import { describe, it, expect } from "vitest";
import { buildNextSteps, type NextStepsInput } from "../next-steps";
import { ISSUER_POLICIES, getIssuerPolicy } from "@/lib/cards/issuer-policies";
import { getAllCardDefinitions } from "@/lib/cards";

const POSTS = new Date("2027-03-03T00:00:00.000Z");
const CSR = { cardId: "chase_sapphire_reserve", cardName: "Sapphire Reserve", annualFee: 795, pointsCurrency: "chase_ur" };
const WFAC = { cardId: "wells_fargo_active_cash", cardName: "Active Cash", annualFee: 0 };

const input = (over: Partial<NextStepsInput> = {}): NextStepsInput => ({
  state: "switch",
  yours: CSR,
  compareTo: WFAC,
  gap: 235,
  feePostsAt: POSTS,
  ...over,
});

describe("buildNextSteps", () => {
  const chase = getIssuerPolicy("chase");

  it("switching away: retention first, apply, then downgrade rather than close", () => {
    const s = buildNextSteps(input(), chase);
    expect(s.steps.map((x) => x.title)).toEqual([
      "Ask Chase for a retention offer first",
      "Apply for the Active Cash",
      "Switch the Sapphire Reserve to Freedom Unlimited instead of closing it",
    ]);
    expect(s.steps[0].body).toContain("$235");
    expect(s.giveUp).toHaveLength(2);
    expect(s.caveat).toContain("about a year");
  });

  it("uses a product change when the recommended card is the downgrade target", () => {
    const s = buildNextSteps(
      input({ compareTo: { cardId: "chase_freedom_unlimited", cardName: "Freedom Unlimited", annualFee: 0 } }),
      chase
    );
    expect(s.steps[1].title).toBe("Ask Chase to switch you to the Freedom Unlimited");
    expect(s.steps.some((x) => x.title.startsWith("Apply"))).toBe(false);
    expect(s.giveUp).toEqual([]);
  });

  it("dates the deadline from the refund window when the issuer publishes one", () => {
    expect(buildNextSteps(input(), chase).deadline).toBe(
      "Decide by about Apr 2. Your $795 fee posts Mar 3, and Chase refunds it if you close or switch cards within 30 days of the statement that shows it."
    );
  });

  it("says to decide before posting when the window is unpublished or absent", () => {
    const citi = buildNextSteps(input({ yours: { ...CSR, cardId: "citi_strata_premier", cardName: "Strata Premier", annualFee: 95 } }), getIssuerPolicy("citi"));
    expect(citi.deadline).toContain("Decide before Mar 3");
    expect(citi.deadline).toContain("don't count on one");
    const wf = buildNextSteps(input({ yours: { ...CSR, cardId: "wells_fargo_autograph_journey", cardName: "Autograph Journey", annualFee: 95 } }), getIssuerPolicy("wells_fargo"));
    expect(wf.deadline).toContain("doesn't publish a refund");
    expect(wf.steps.at(-1)!.title).toBe("Before you close it");
  });

  it("says loyalty points are unaffected for co-brand cards", () => {
    const s = buildNextSteps(input({ yours: { cardId: "united_explorer", cardName: "United Explorer", annualFee: 150, pointsCurrency: "united_miles" } }), chase);
    expect(s.steps.at(-1)!.body).toContain("MileagePlus points live in your MileagePlus account");
  });

  it("keep: nothing to do, no deadline pressure", () => {
    const s = buildNextSteps(input({ state: "keep", gap: -365 }), chase);
    expect(s.steps[0].title).toBe("Nothing to do");
    expect(s.deadline).toBe("Your $795 fee posts Mar 3. Nothing to do if you keep the card.");
    expect(s.giveUp).toEqual([]);
    expect(s.caveat).toBeNull();
  });

  it("toss-up leans to the cheaper card", () => {
    const s = buildNextSteps(input({ state: "toss_up", gap: 15 }), chase);
    expect(s.steps[1].title).toBe("No offer? Lean toward the Active Cash");
    expect(s.steps[1].body).toContain("lack of an annual fee");
  });

  it("not yet: points to Rewards and the ready date", () => {
    const s = buildNextSteps(input({ state: "not_yet", verdictReadyAt: new Date("2027-01-15T00:00:00Z") }), chase);
    expect(s.steps[1].body).toBe("Around Jan, once we have 6 months of your spending.");
  });

  it("never tells a no-fee cardholder to close or race a deadline", () => {
    const noFee = { cardId: "wells_fargo_active_cash", cardName: "Active Cash", annualFee: 0, pointsCurrency: "cash_back" };
    const dc = { cardId: "citi_double_cash", cardName: "Double Cash", annualFee: 0 };
    const sw = buildNextSteps(input({ yours: noFee, compareTo: dc }), getIssuerPolicy("wells_fargo"));
    expect(sw.deadline).toContain("No annual fee");
    expect(sw.steps.map((x) => x.title)).toEqual(["Apply for the Double Cash", "Keep the Active Cash open"]);
    expect(sw.giveUp).toEqual([]);
    const tie = buildNextSteps(input({ state: "toss_up", yours: noFee, compareTo: dc }), getIssuerPolicy("wells_fargo"));
    expect(tie.steps[0].title).toBe("Nothing urgent");
  });

  it("asks for an anniversary when the fee date is unknown", () => {
    expect(buildNextSteps(input({ feePostsAt: null }), chase).deadline).toContain("Set your card anniversary");
  });
});

describe("ISSUER_POLICIES", () => {
  it("covers every fee card's issuer, and every downgrade key is a registered card", () => {
    const cards = getAllCardDefinitions();
    const ids = new Set(cards.map((c) => c.id));
    for (const card of cards.filter((c) => c.annualFee > 0)) {
      expect(ISSUER_POLICIES[card.issuer], card.issuer).toBeDefined();
    }
    for (const policy of Object.values(ISSUER_POLICIES)) {
      for (const [cardId, target] of Object.entries(policy.downgrades)) {
        expect(ids.has(cardId), cardId).toBe(true);
        if (target?.cardId) expect(ids.has(target.cardId), target.cardId).toBe(true);
      }
    }
  });
});
