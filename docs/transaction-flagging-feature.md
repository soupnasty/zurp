# Transaction Flagging

## Overview

The matching engine that maps Plaid transactions to card benefits will not always be correct. Transaction flagging gives users a simple way to correct mismatches — removing transactions that don't belong and adding ones that were missed. Every correction is stored and used to improve matching accuracy over time.

## Problem

Two types of matching errors occur:

- **False positives** — A transaction is matched to a benefit but shouldn't be. Example: a Lyft scooter rental matched to the $10/month Lyft ride credit, but scooters don't qualify.
- **False negatives** — A qualifying transaction exists but wasn't matched. Example: a user dined at an Exclusive Tables restaurant but the transaction wasn't recognized.

Users currently have no way to correct either case. This erodes trust in the dashboard numbers and leaves money-tracking inaccurate.

## Solution

### Removing a Wrong Match (False Positive)

**Location:** Transaction row inside the benefit detail modal.

**Flow:**

1. User opens a benefit card modal and sees matched transactions
2. User clicks the flag icon (🚩) on a transaction that doesn't belong
3. An inline dropdown appears with preset reasons:
   - "This purchase doesn't qualify"
   - "Duplicate transaction"
   - "Other"
4. User selects a reason
5. Transaction is immediately unmatched from the benefit
6. Benefit totals (used, remaining, progress bar) update instantly
7. A brief toast confirmation appears: "Transaction removed from [benefit name]"

**Undo:** The toast includes an "Undo" action for 5 seconds in case of accidental removal.

### Adding a Missing Match (False Negative)

**Location:** Bottom of the transaction list inside the benefit detail modal.

**Flow:**

1. User clicks "Missing a transaction?" link below the transaction list
2. A panel expands showing recent unmatched Plaid transactions that are plausible candidates for this benefit, filtered by:
   - Merchant category (e.g., travel, rideshare, food delivery)
   - Merchant name patterns (e.g., "Lyft", "DoorDash")
   - Date range (current benefit period only)
3. Each candidate shows: date, merchant name, amount
4. User taps a transaction to match it to this benefit
5. Transaction is immediately matched; benefit totals update
6. Toast confirmation: "Transaction added to [benefit name]"

**Empty state:** If no plausible candidates are found, show: "No unmatched transactions found for this period. Transactions may take 1–2 days to appear from your bank."

**Edge cases:**
- A transaction can only be matched to one benefit at a time
- If a user tries to add a transaction already matched elsewhere, show: "This transaction is currently matched to [other benefit]. Move it here?" with a confirm action
- Only transactions within the active benefit period are shown as candidates

## Data Model

### `transaction_flags` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to users |
| `transaction_id` | text | Plaid transaction ID |
| `benefit_id` | text | Benefit the flag relates to |
| `flag_type` | enum | `removed` or `added` |
| `reason` | text | Preset reason or null for manual adds |
| `original_match` | boolean | Whether the engine originally matched this transaction |
| `created_at` | timestamp | When the flag was created |

### How flags interact with the matching engine

- When the engine runs (on sync or refresh), it produces a set of proposed matches
- Before displaying to the user, the system applies all flags as overrides:
  - `removed` flags suppress the engine's match for that transaction + benefit pair
  - `added` flags force a match regardless of engine output
- Flags persist across syncs — a user correction is never silently reverted by a re-run of the engine
- If a user removes a flag (via undo or future UI), the transaction reverts to whatever the engine decides

## Benefit Total Calculation

```
effective_used = engine_matched_total
              - sum(removed flag amounts)
              + sum(added flag amounts)
```

This is computed on read, not stored as a separate value, so it always reflects the current state of both the engine and user corrections.

## Using Flag Data to Improve Matching

### Short Term (Manual Review)

Run periodic queries to identify patterns:

```sql
-- Most commonly removed merchants per benefit
SELECT benefit_id, merchant_name, COUNT(*) as removal_count
FROM transaction_flags
JOIN transactions ON transaction_flags.transaction_id = transactions.id
WHERE flag_type = 'removed'
GROUP BY benefit_id, merchant_name
ORDER BY removal_count DESC;

-- Most commonly added merchants per benefit
SELECT benefit_id, merchant_name, COUNT(*) as add_count
FROM transaction_flags
JOIN transactions ON transaction_flags.transaction_id = transactions.id
WHERE flag_type = 'added'
GROUP BY benefit_id, merchant_name
ORDER BY add_count DESC;
```

If 5+ users remove the same merchant from the same benefit, update the matching rule. If 5+ users manually add the same merchant, add it to the matching rule.

### Medium Term (Automated Rule Updates)

Build a simple feedback loop:

1. Aggregate flags weekly
2. Surface merchant + benefit pairs that cross a threshold (e.g., 5 flags)
3. Auto-generate a proposed rule change (add/remove merchant from benefit matching)
4. Review and deploy

### Long Term (Model Training)

Use the flags table as labeled training data for a more sophisticated matching model. Each flag is a human-verified label: "this transaction does/does not belong to this benefit."

## UI Specifications

### Flag Icon on Transaction Row

- Small muted icon (🚩 or ✕) on the right side of each transaction row
- Icon appears on hover (desktop) or is always visible (mobile)
- Tooltip: "Remove this transaction"

### Reason Dropdown

- Appears inline below the transaction row when flag icon is clicked
- Three options: "Doesn't qualify", "Duplicate", "Other"
- Selecting an option immediately processes the removal (no separate submit button)

### Missing Transaction Panel

- Triggered by "Missing a transaction?" link
- Expands below the existing transaction list (not a separate modal)
- Shows up to 10 candidate transactions, sorted by date (most recent first)
- Each candidate has a "+" button to add it
- Panel is collapsible

### Toast Notifications

- Appears bottom-center of the modal
- Auto-dismisses after 5 seconds
- Includes "Undo" action link
- Stacks if multiple actions are taken quickly

## What's Out of Scope for V1

- Admin review/approval queue for flags (trust the user, review in bulk later)
- Back-and-forth dispute flow or messaging
- Required explanations for flags (preset reasons are sufficient)
- Flagging at the benefit level (only transaction-level flags)
- Bulk flagging (one transaction at a time)
- Flag history visible to the user (internal only for now)

## Success Metrics

- **Flag rate:** Percentage of matched transactions that get flagged. Target: < 5% after engine maturation. High initial rates are expected and useful.
- **Undo rate:** How often users undo a flag within the 5-second window. High undo rates suggest the UI is too easy to trigger accidentally.
- **Engine improvement:** Track whether flag rates decrease over time as matching rules are updated based on flag data.
- **Manual add rate:** How often users add missing transactions. Decreasing over time indicates the engine is catching more qualifying transactions.
