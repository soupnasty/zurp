# Cross-Card Insights (A3) — Design Document

Status: **Design only (deferred)**
Author: Insights Engine v2.1 planning
Date: 2026-02-13

## Overview

A3 is a proposed new insight category that compares spending across multiple linked cards to surface optimization opportunities. Unlike existing generators that operate within a single card context, A3 requires a cross-card view of the user's transaction data.

## Motivation

Users with multiple linked cards often miss opportunities to shift spending to cards with better earn rates or benefit coverage for specific categories. For example, a user paying for groceries on their CSR (1x) when their Amex Gold earns 4x on groceries.

## Proposed Category

**A3: Cross-Card Optimization**
Group: A (actionable redirects)
Priority: High — surfaces the highest dollar-impact optimizations

## Generator Design

### Input

A3 requires a new context shape that spans all cards:

```typescript
interface CrossCardContext {
  userId: string;
  cardProfiles: Array<{
    cardProfileId: string;
    cardType: string;
    earnConfig: EarnConfig;
  }>;
  // Transactions across ALL cards, tagged with source cardProfileId
  allTransactions: Array<CategorizedTransaction & { cardProfileId: string }>;
}
```

### Algorithm

1. For each spending category with significant spend (≥ $100/month):
   a. Compute actual points earned on the card used
   b. Compute hypothetical points if spent on each other linked card
   c. If any alternative card earns ≥ 2x more points, generate an A3 candidate

2. Dedup: One A3 per spending category per month (`a3:{category}:{monthKey}`)

3. Template variables: `category`, `current_card`, `better_card`, `current_rate`, `better_rate`, `spend`, `extra_value`

### Templates

```
a3_standard:
  title: "$${spend} in ${category} on the wrong card"
  body: "Your ${better_card} earns ${better_rate}x vs ${current_rate}x — that's ~$${extra_value} more."

a3_significant:
  title: "You could earn $${extra_value} more on ${category}"
  body: "Switch ${category} spending from ${current_card} to ${better_card} for ${better_rate}x instead of ${current_rate}x."
```

### Scoring

- `dollarAmount`: Annualized extra value from switching
- `daysRemaining`: null (ongoing optimization, no expiry)
- `actionability`: "switch_platform" (80)
- `confidence`: "exact_confirmed" (100) — based on actual transaction data

## Integration Points

### Where A3 fits in the orchestrator

Currently, `generateAndPersistInsights` processes one card at a time. A3 needs a cross-card pass that runs **after** all per-card generators complete. Proposed approach:

```
generateAndPersistInsights(userId)
  ├── Per-card loop (existing: A1, A2, B1-B4, C0-C2, P1, P2)
  └── Cross-card pass (new: A3)
       ├── Fetch all transactions across all cardProfiles
       ├── Load earnConfigs for each card
       ├── Run A3 generator
       └── Persist A3 insights (cardProfileId = source card, not better card)
```

### Display considerations

- A3 insights should include `cardProfileId` of the card being used suboptimally
- UI needs to show both the current card name and the recommended card name
- Mutual exclusion: if A1 already redirects spending for a merchant, A3 should not duplicate for the same category

## Dependencies

- Multi-card generation (Issue 2) — **completed** ✅
- Points earn model with per-card configs — **completed** ✅
- Category mapper for transaction classification — **completed** ✅

## Open Questions

1. **Threshold for "significant"**: $100/month minimum spend? Or percentage-based?
2. **Portal mode**: Should A3 consider portal earn rates, or only direct spend rates?
3. **New cards**: Should A3 suggest cards the user doesn't have? (Probably not — keep to linked cards only.)
4. **Frequency**: How often to resurface? Monthly seems appropriate since spending patterns are monthly.

## Implementation Estimate

- Generator: ~100 lines (pure function)
- Orchestrator integration: ~30 lines (cross-card pass after per-card loop)
- Templates: 2 new templates
- Tests: ~15 new test cases
- Total: ~1 day of work

## Decision

Deferred to a future phase. The multi-card orchestrator (Issue 2) is the prerequisite and is now complete. A3 can be implemented when cross-card optimization becomes a user-facing priority.
