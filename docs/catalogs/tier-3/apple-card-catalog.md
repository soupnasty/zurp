# Apple Card Catalog

## Card Overview

| Attribute | Details |
|-----------|---------|
| **Card Name** | Apple Card |
| **Card Type** | apple_card |
| **Network** | Mastercard |
| **Annual Fee** | $0 |
| **Status** | Active (Issuer transitioning from Goldman Sachs to Chase in 2026) |
| **Key Differentiator** | Daily Cash rewards paid daily + interest-free device financing |

---

## Benefit Catalog

### Base Rewards Structure

```benefit_key
benefit_key: apple_3pct_cash_back
name: "3% Daily Cash on Premium Merchants"
category: "earning"
rate: 3.0
rate_type: "percentage"
rate_currency: "USD"
merchants:
  - "Apple"
  - "Uber"
  - "Uber Eats"
  - "Nike"
  - "Exxon"
  - "Mobil"
  - "Ace Hardware"
  - "Booking.com"
  - "Walgreens"
  - "Duane Reade"
  - "ChargePoint"
frequency: "daily"
notes: "Daily Cash credited to Apple Cash or applied to Apple Card balance daily, not monthly"
```

```benefit_key
benefit_key: apple_2pct_apple_pay
name: "2% Daily Cash on Apple Pay Purchases"
category: "earning"
rate: 2.0
rate_type: "percentage"
rate_currency: "USD"
activation_method: "Automatic with Apple Pay"
frequency: "daily"
notes: "All contactless and in-app payments made with Apple Pay"
```

```benefit_key
benefit_key: apple_1pct_titanium
name: "1% Daily Cash on Titanium Card Purchases"
category: "earning"
rate: 1.0
rate_type: "percentage"
rate_currency: "USD"
activation_method: "Automatic with physical card"
frequency: "daily"
notes: "Only applies to physical titanium card transactions, not Apple Pay"
```

### Savings & APY

```benefit_key
benefit_key: apple_card_savings_apy
name: "Apple Card Savings Account"
category: "savings"
type: "high_yield_savings"
rate: 4.15
rate_type: "percentage_apy"
rate_currency: "USD"
eligible_funds: "Daily Cash rewards"
frequency: "daily"
issuer: "Goldman Sachs Bank USA"
notes: "Deposit Daily Cash rewards into Apple Card Savings for 4.15% APY; rate subject to change"
```

### Device Financing

```benefit_key
benefit_key: apple_interest_free_financing
name: "Interest-Free Apple Device Financing"
category: "financing"
type: "promotional_financing"
apr: 0
apr_type: "interest_free"
eligible_purchases: "Apple devices (iPhone, iPad, Mac, Apple Watch, etc.)"
frequency: "per_purchase"
notes: "Allows customers to purchase Apple devices with no interest financing options; specific terms vary by product and promotion"
```

### Fraud Protection

```benefit_key
benefit_key: mastercard_zero_liability
name: "Zero Liability Protection"
category: "protection"
type: "fraud_protection"
coverage: "100%"
coverage_type: "fraud_liability"
coverage_currency: "USD"
issuer: "Mastercard"
notes: "Standard Mastercard Zero Liability protection for unauthorized transactions; no cardholder liability for fraudulent charges"
```

### Fee Structure

```benefit_key
benefit_key: apple_no_annual_fee
name: "No Annual Fee"
category: "fees"
type: "no_charge"
fee_amount: 0
fee_currency: "USD"
frequency: "annual"
notes: "Apple Card has no annual fee or ongoing membership costs"
```

```benefit_key
benefit_key: apple_no_foreign_transaction_fee
name: "No Foreign Transaction Fee"
category: "fees"
type: "no_charge"
applies_to: "international_purchases"
fee_amount: 0
fee_percent: 0
frequency: "per_transaction"
notes: "No FTF on purchases made outside the United States"
```

```benefit_key
benefit_key: apple_no_penalty_fees
name: "No Penalty APR or Late Fees"
category: "fees"
type: "no_penalty_structure"
notes: "Apple Card does not charge penalty APR or late fees; late payments may affect credit score but no additional fees imposed"
```

### Welcome Offer

```benefit_key
benefit_key: apple_no_welcome_bonus
name: "No Welcome Bonus"
category: "promotion"
type: "welcome_offer"
offer_value: 0
notes: "Apple Card does not offer a cash back or statement credit welcome bonus"
```

### Transferable Benefits

```benefit_key
benefit_key: apple_no_transfer_partners
name: "No Transfer Partners"
category: "redemption"
type: "cash_back_only"
notes: "Daily Cash rewards can only be redeemed as cash (to Apple Cash, Applied to Card Balance, or Bank Account); no airline or hotel partner transfers available"
```

### Missing Benefits & Protections

```benefit_key
benefit_key: apple_no_purchase_protection
name: "No Purchase Protection"
category: "protection"
type: "not_offered"
notes: "Apple Card does not offer purchase protection, extended warranty, or return protection coverage"
```

```benefit_key
benefit_key: apple_no_trip_insurance
name: "No Trip Insurance"
category: "protection"
type: "not_offered"
notes: "Apple Card does not offer trip cancellation, trip delay, baggage, or travel accident insurance"
```

```benefit_key
benefit_key: apple_no_concierge
name: "No Concierge or Travel Services"
category: "service"
type: "not_offered"
notes: "Apple Card does not include travel concierge, lost luggage assistance, or other travel-related services"
```

---

## Zurp Relevance & Competitive Position

### Market Positioning

Apple Card is a lifestyle-focused, mobile-first credit card designed for iOS users and Apple ecosystem participants. Its core differentiation centers on **daily cash rewards** (a time-to-value advantage) and **tight integration with Apple Pay and Apple's services ecosystem**.

### Competitive Strengths

- **Daily Cash Cadence**: Unique daily payout (vs. monthly for most competitors) increases perceived value and speed of reward redemption
- **Merchant Category Optimization**: Curated 3% categories (Uber, Uber Eats, Apple, Nike, Booking.com) capture high-frequency, high-spend consumer segments
- **Savings APY**: 4.15% APY on Daily Cash funds provides additional value on top of base rewards
- **Apple Ecosystem Integration**: Seamless UX for Apple Pay users; interest-free device financing locks in loyal customers
- **Zero Fee Structure**: No annual fee, no FTF, no penalty APR removes friction
- **Issuer Stability**: Transition from Goldman Sachs to Chase in 2026 signals long-term commitment; no feature changes expected

### Competitive Weaknesses

- **No Welcome Bonus**: Eliminates key customer acquisition tool vs. Chase Sapphire, Amex Gold, etc.
- **Limited Protection**: Lacks purchase protection, extended warranty, trip insurance—areas where premium competitors excel
- **No Transfer Partners**: Cash-back-only redemption limits value for business travelers or aspirational redemption strategies
- **Narrow Base Rewards**: 1% on physical card is punitive for non-Apple Pay users; most competitors offer 1.5–2% base
- **Merchant Category Rigidity**: Fixed 3% categories cannot be customized; limits appeal to users outside core demographics
- **Issuer Transition Risk**: Goldman Sachs → Chase in 2026 creates operational uncertainty, though Apple's negotiating power mitigates risk

### Key Competitor Comparisons

| Card | Annual Fee | Base Rewards | 3% Categories | Welcome Bonus | Key Advantage |
|------|-----------|--------------|---------------|---------------|----------------|
| **Apple Card** | $0 | 1% (physical) / 2% (Apple Pay) | 3% (11 merchants) | None | Daily cash + ecosystem lock-in |
| **Chase Sapphire Preferred** | $95 | 1% base | 3% (dining, travel, streaming) | 50,000 UR (~$625 value) | Flexible point transfers |
| **American Express Gold** | $250 | 1% base | 4% (dining, airfare, streaming); 1% (flights, hotels) | 75,000 MR (~$750 value) | Premium protections + lounge access |
| **Chase Freedom Unlimited** | $0 | 1.5% all | — | 5% for 12 months (up to $500) | Flat-rate cash back, bonus category |
| **Citi Double Cash** | $0 | 2% (1% earn, 1% return) | — | $200 after $500 spend | True 2% everywhere |

### Zurp Strategic Relevance

**Segment**: Consumer discretionary / Lifestyle credit
**Use Case**: Mobile-first, Apple-centric consumers; high Uber/Eats/Apple spending; travel booking via Booking.com; EV drivers (ChargePoint)
**Positioning Tier**: Mid-market aspirational (free card, premium UX, but weaker protections than AmEx/Chase premium tiers)
**Growth Driver**: Apple Pay adoption; Apple device financing tie-in
**Risk Factor**: Issuer transition in 2026; no welcome bonus reduces market penetration vs. competitors

**Zurp Recommendation**: Apple Card is strong for **Apple Pay-dominant users** but should be paired with a 2% base cash-back card (Citi Double Cash, Chase Freedom Unlimited) for non-Apple Pay purchases. Premium protection gaps recommend pairing with Amex Gold for travel/dining users.

---

**Document Version**: 1.0
**Last Updated**: 2026-02-11
**Issuer**: Apple Card (Goldman Sachs Bank USA / Chase from 2026)
**Format**: Zurp Card Catalog v2.0
