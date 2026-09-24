/**
 * What happens when you cancel or downgrade a fee card, per issuer — the
 * facts behind the Verdict page's next steps. Researched 2026-09-23 from
 * issuer agreements and terms where they exist; secondary sources are
 * marked `primary: false`. Re-verify alongside the card audit.
 */

export interface FeeRefundPolicy {
  days: number;
  /** "fee_statement": counted from the statement showing the fee; "fee_posting": from the charge date. */
  from: "fee_statement" | "fee_posting";
  /** False when the window is only reported by cardholders, not published by the issuer. */
  published: boolean;
}

export interface DowngradeTarget {
  name: string;
  /** Registry id when zurp supports the target card. */
  cardId?: string;
  annualFee: number;
}

export interface IssuerPolicy {
  issuer: string;
  displayName: string;
  /** Null when the issuer publishes none and cardholder reports are unreliable. */
  feeRefund: FeeRefundPolicy | null;
  /** Product change without a new application, keyed by the card being changed. */
  downgrades: Record<string, DowngradeTarget | null>;
  /** One user-facing sentence on what closing does to the issuer's own points. */
  pointsOnClose: string;
  retentionOffers: "common" | "occasional" | "rare" | "unknown";
  /** Extra caution the steps must mention. */
  caveat?: string;
  sources: { url: string; primary: boolean; claim: string }[];
  verifiedAt: string;
}

export const ISSUER_POLICIES: Record<string, IssuerPolicy> = {
  chase: {
    issuer: "chase",
    displayName: "Chase",
    feeRefund: { days: 30, from: "fee_statement", published: true },
    downgrades: {
      chase_sapphire_reserve: { name: "Freedom Unlimited", cardId: "chase_freedom_unlimited", annualFee: 0 },
      chase_sapphire_preferred: { name: "Freedom Unlimited", cardId: "chase_freedom_unlimited", annualFee: 0 },
      ink_business_preferred: { name: "Ink Business Unlimited", annualFee: 0 },
      united_explorer: { name: "United Gateway", annualFee: 0 },
      ihg_premier: { name: "IHG One Rewards Traveler", annualFee: 0 },
      world_of_hyatt: null,
      southwest_priority: null,
    },
    pointsOnClose:
      "Ultimate Rewards points are lost if the card closes with points on it. Switch cards instead, or move them to another Chase card first. On a Freedom card they can't be transferred to airline and hotel partners.",
    retentionOffers: "occasional",
    caveat: "Chase usually requires the card to be open about a year before a product change.",
    sources: [
      { url: "https://travelwithgrant.boardingarea.com/2020/09/29/keep-cancel-or-convert-chase-sapphire-reserve-credit-card-tonei/", primary: false, claim: "Statement notice: refund if closed within 30 days or one billing cycle (whichever is less) after the fee statement" },
      { url: "https://www.chase.com/content/feed/public/creditcards/cma/Chase/COL00095.pdf", primary: true, claim: "Agreement defers to the statement for how to avoid annual fees" },
      { url: "https://asset.chase.com/content/dam/card/rulesregulations/en/RPA0511_0518_Web.pdf", primary: true, claim: "Points move only to your own/household UR card" },
      { url: "https://www.chase.com/personal/credit-cards/education/rewards-benefits/do-credit-card-points-expire", primary: true, claim: "Move points before closing or lose them" },
      { url: "https://frequentmiler.com/downgrade-paths-how-to-keep-your-card-but-break-up-with-your-annual-fee-or-find-a-better-fit/", primary: false, claim: "Downgrade paths and the 12-month rule" },
    ],
    verifiedAt: "2026-09-23",
  },
  amex: {
    issuer: "amex",
    displayName: "Amex",
    feeRefund: { days: 30, from: "fee_statement", published: true },
    downgrades: {
      amex_platinum: { name: "Amex Green", annualFee: 150 },
      amex_business_platinum: { name: "Business Green", annualFee: 95 },
      amex_gold: { name: "Amex Green", annualFee: 150 },
      amex_blue_cash_preferred: { name: "Blue Cash Everyday", cardId: "amex_blue_cash_everyday", annualFee: 0 },
      delta_platinum: { name: "Delta SkyMiles Blue", annualFee: 0 },
      hilton_aspire: { name: "Hilton Honors", annualFee: 0 },
    },
    pointsOnClose:
      "Membership Rewards points are lost the moment your last Membership Rewards card closes. Keep another one open, or use the points first.",
    retentionOffers: "common",
    caveat: "Amex charge cards (Platinum, Gold) can only switch to other charge cards, so there's no no-fee option.",
    sources: [
      { url: "https://www.americanexpress.com/content/dam/amex/en-us/company/legal/cardmember-agreements/public-site-2025-q1-pdf-cmas/cps-charge/american-express-gold-card-03-31-2025.pdf", primary: true, claim: "Refund if closed within 30 days of the Closing Date of the statement showing the fee" },
      { url: "https://www.americanexpress.com/content/dam/amex/us/rewards/membership-rewards/mr-terms-conditions-september-2026.pdf", primary: true, claim: "Points lost when the last linked card closes" },
      { url: "https://www.doctorofcredit.com/get-amex-annual-fee-pro-rated-downgrading-card/", primary: false, claim: "Downgrades prorated after 30 days" },
    ],
    verifiedAt: "2026-09-23",
  },
  citi: {
    issuer: "citi",
    displayName: "Citi",
    feeRefund: { days: 30, from: "fee_posting", published: false },
    downgrades: {
      citi_strata_elite: { name: "Double Cash", cardId: "citi_double_cash", annualFee: 0 },
      citi_strata_premier: { name: "Double Cash", cardId: "citi_double_cash", annualFee: 0 },
    },
    pointsOnClose:
      "ThankYou points earned on a closed card must be used within 60 days. Switching to Double Cash or Custom Cash keeps them, since both earn ThankYou points.",
    retentionOffers: "common",
    caveat: "Citi usually requires the card to be open a year before a product change.",
    sources: [
      { url: "https://www.citi.com/CRD/PDF/CMA/cardAgreement/CMA_PID90.pdf", primary: true, claim: "No annual-fee refund language in the agreement" },
      { url: "https://www.citi.com/CRD/PDF/DoubleCashThankyouTC.pdf", primary: true, claim: "60 days to use points after closing or converting" },
      { url: "https://www.doctorofcredit.com/annual-fee-refund-rules-for-each-card-issuer/", primary: false, claim: "Refunds reported within 30 days of the fee posting" },
    ],
    verifiedAt: "2026-09-23",
  },
  capital_one: {
    issuer: "capital_one",
    displayName: "Capital One",
    feeRefund: { days: 30, from: "fee_posting", published: false },
    downgrades: {
      capital_one_venture_x: { name: "VentureOne", annualFee: 0 },
      capital_one_venture: { name: "VentureOne", annualFee: 0 },
    },
    pointsOnClose:
      "Miles on a closed card can be lost. A product change keeps them, since rewards carry over to the new card.",
    retentionOffers: "occasional",
    caveat: "A downgrade after the fee posts may not refund it, so switch at least 60 days before your anniversary.",
    sources: [
      { url: "https://www.capitalone.com/help-center/credit-cards/close-your-account/", primary: true, claim: "Closed accounts may lose unredeemed rewards" },
      { url: "https://www.capitalone.com/learn-grow/money-management/credit-card-product-change/", primary: true, claim: "Product change: no hard inquiry, rewards typically transfer" },
      { url: "https://www.doctorofcredit.com/downgrading-capital-one-cards-60-days-before-card-renewal/", primary: false, claim: "Downgrade 60+ days before renewal; ~30-day refund on closing" },
    ],
    verifiedAt: "2026-09-23",
  },
  wells_fargo: {
    issuer: "wells_fargo",
    displayName: "Wells Fargo",
    feeRefund: null,
    downgrades: { wells_fargo_autograph_journey: null },
    pointsOnClose:
      "Points stay if you have another Wells Fargo card in the same rewards account. Closing your last card forfeits them.",
    retentionOffers: "unknown",
    caveat: "Autograph Journey reportedly can't be product-changed, and there's no published fee refund, so decide before the fee posts.",
    sources: [
      { url: "https://www.wellsfargo.com/credit-cards/autograph-journey-visa/terms/", primary: true, claim: "No refund language; rewards stay if another card remains, forfeited if last" },
      { url: "https://ficoforums.myfico.com/t5/Credit-Cards/Wells-Fargo-Autograph-Journey-Cannot-Be-Product-Changed/td-p/6822246", primary: false, claim: "Autograph Journey can't be product-changed" },
    ],
    verifiedAt: "2026-09-23",
  },
  bilt: {
    issuer: "bilt",
    displayName: "Bilt",
    feeRefund: null,
    downgrades: { bilt_palladium: { name: "Bilt Blue", annualFee: 0 } },
    pointsOnClose: "Bilt points live in your Bilt Rewards account and stay there after the card closes.",
    retentionOffers: "unknown",
    caveat: "The Bilt agreement calls the annual fee non-refundable, and allows one card change per 12 months.",
    sources: [
      { url: "https://legal.cardless.com/cardholder_agreement/bilt_palladium/cardholder_agreement.pdf", primary: true, claim: "Issued by Column N.A.; annual fee non-refundable" },
      { url: "https://www.biltrewards.com/terms/bilt-card-offer-terms", primary: true, claim: "Card changes without a new application; points stay after closure" },
    ],
    verifiedAt: "2026-09-23",
  },
  robinhood: {
    issuer: "robinhood",
    displayName: "Robinhood",
    feeRefund: null,
    downgrades: { robinhood_gold: null },
    pointsOnClose: "Closing the card forfeits your points, so redeem them first.",
    retentionOffers: "unknown",
    caveat: "The card needs Robinhood Gold ($50/yr), which can only be cancelled after the card is closed.",
    sources: [
      { url: "https://api.robinhood.com/creditcard/legal/reward-terms", primary: true, claim: "Points forfeited on closure" },
      { url: "https://robinhood.com/us/en/support/articles/gold-subscription-and-cancellation", primary: true, claim: "Close the card before cancelling Gold" },
    ],
    verifiedAt: "2026-09-23",
  },
};

export function getIssuerPolicy(issuer: string): IssuerPolicy | null {
  return ISSUER_POLICIES[issuer] ?? null;
}
