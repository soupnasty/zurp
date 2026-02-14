import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  unique,
  index,
  primaryKey,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Auth.js tables ──

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  lastActive: timestamp("last_active", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_idx").on(table.userId),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ]
);

// ── App tables ──

export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  issuer: text("issuer").notNull(),
  network: text("network").notNull(), // "visa" | "amex" | "mastercard"
  annualFee: integer("annual_fee").notNull(),
  feeDescriptor: text("fee_descriptor").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const benefits = pgTable("benefits", {
  id: text("id").primaryKey(),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(), // "credit" | "subscription"
  creditAmount: real("credit_amount").notNull(),
  cycle: text("cycle").notNull(),
  carriesOver: boolean("carries_over").notNull().default(false),
  maxCarryoverPeriods: integer("max_carryover_periods"),
  maxAccrued: real("max_accrued"),
  merchantPatterns: text("merchant_patterns").array().notNull().default([]),
  plaidCategories: text("plaid_categories").array().notNull().default([]),
  autoMatchable: boolean("auto_matchable").notNull().default(true),
  requiresActivation: boolean("requires_activation").notNull().default(false),
  priority: integer("priority").notNull().default(50),
  description: text("description").notNull().default(""),
  notes: text("notes"),
  sunsetDate: text("sunset_date"),
  sourceUrl: text("source_url"),
  displayGroup: text("display_group"),
  displayGroupName: text("display_group_name"),
  displayGroupIcon: text("display_group_icon"),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const plaidConnections = pgTable(
  "plaid_connections",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plaidItemId: text("plaid_item_id").notNull(),
    plaidAccessToken: text("plaid_access_token").notNull(), // encrypted
    institutionName: text("institution_name").notNull(),
    accountId: text("account_id").notNull(),
    accountMask: text("account_mask"), // last 4 digits
    status: text("status").notNull().default("active"), // "active" | "needs_reauth" | "disconnected"
    syncStatus: text("sync_status").notNull().default("pending"), // "pending" | "initial" | "complete"
    lastSyncCursor: text("last_sync_cursor"),
    lastSyncedAt: timestamp("last_synced_at", { mode: "date" }),
    syncLockedUntil: timestamp("sync_locked_until", { mode: "date" }), // Prevents concurrent syncs (5-min TTL)
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("plaid_connections_user_idx").on(table.userId),
  ]
);

export const cardProfiles = pgTable(
  "card_profiles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plaidConnectionId: text("plaid_connection_id")
      .notNull()
      .references(() => plaidConnections.id, { onDelete: "cascade" }),
    cardType: text("card_type").notNull(), // e.g. "chase_sapphire_reserve"
    cardLabel: text("card_label"), // optional user-defined label
    isActive: boolean("is_active").notNull().default(true),
    anniversaryDate: timestamp("anniversary_date", { mode: "date" }),
    anniversarySource: text("anniversary_source")
      .notNull()
      .default("pending"), // "auto_detected" | "user_provided" | "pending"
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("card_profiles_user_idx").on(table.userId),
    // One active profile per connection
    unique("card_profiles_connection_active").on(
      table.plaidConnectionId,
      table.isActive
    ),
  ]
);

export const transactions = pgTable(
  "transactions",
  {
    id: text("id").primaryKey(), // Plaid transaction_id
    plaidConnectionId: text("plaid_connection_id")
      .notNull()
      .references(() => plaidConnections.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: timestamp("date", { mode: "date" }).notNull(),
    datetime: timestamp("datetime", { mode: "date" }),
    merchantName: text("merchant_name"),
    merchantNameRaw: text("merchant_name_raw"),
    amount: real("amount").notNull(),
    plaidCategoryPrimary: text("plaid_category_primary"),
    plaidCategoryDetailed: text("plaid_category_detailed"),
    isAnnualFee: boolean("is_annual_fee").notNull().default(false),
    pending: boolean("pending").notNull().default(false),
    matchedStatus: text("matched_status")
      .notNull()
      .default("unmatched"), // "unmatched" | "matched" | "ambiguous" | "skipped"
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("transactions_user_date_idx").on(table.userId, table.date),
    index("transactions_matched_status_idx").on(table.matchedStatus),
  ]
);

export const benefitUsage = pgTable(
  "benefit_usage",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    benefitId: text("benefit_id")
      .notNull()
      .references(() => benefits.id, { onDelete: "cascade" }),
    cardProfileId: text("card_profile_id")
      .notNull()
      .references(() => cardProfiles.id, { onDelete: "cascade" }),
    periodKey: text("period_key").notNull(),
    cycleStart: timestamp("cycle_start", { mode: "date" }).notNull(),
    cycleEnd: timestamp("cycle_end", { mode: "date" }).notNull(),
    amountUsed: real("amount_used").notNull().default(0),
    amountRemaining: real("amount_remaining").notNull(),
    isFullyUsed: boolean("is_fully_used").notNull().default(false),
    carriedFrom: text("carried_from"),
    carriedAmount: real("carried_amount").notNull().default(0),
    manualOverride: boolean("manual_override").notNull().default(false),
    overrideNote: text("override_note"),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    unique("benefit_usage_unique").on(
      table.userId,
      table.benefitId,
      table.periodKey
    ),
    index("benefit_usage_user_card_idx").on(table.userId, table.cardProfileId),
  ]
);

export const transactionFlags = pgTable(
  "transaction_flags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    benefitId: text("benefit_id")
      .notNull()
      .references(() => benefits.id, { onDelete: "cascade" }),
    flagType: text("flag_type").notNull(), // "removed" | "added"
    reason: text("reason"),
    originalMatch: boolean("original_match").notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    unique("transaction_flags_unique").on(
      table.userId,
      table.transactionId,
      table.benefitId
    ),
    index("transaction_flags_user_flag_idx").on(table.userId, table.flagType),
  ]
);

export const matchedTx = pgTable(
  "matched_tx",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    benefitUsageId: text("benefit_usage_id")
      .notNull()
      .references(() => benefitUsage.id, { onDelete: "cascade" }),
    creditApplied: real("credit_applied").notNull(),
    matchMethod: text("match_method").notNull().default("auto"), // "auto" | "manual"
    matchConfidence: text("match_confidence").notNull().default("high"), // "high" | "medium" | "low"
    matchedAt: timestamp("matched_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    unique("matched_tx_unique").on(table.transactionId, table.benefitUsageId),
    index("matched_tx_usage_idx").on(table.benefitUsageId),
  ]
);

// ── Insights Engine v2 ──

export const insights = pgTable(
  "insights",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardProfileId: text("card_profile_id").references(() => cardProfiles.id, {
      onDelete: "cascade",
    }),
    category: text("category").notNull(), // A1, A2, B1, B2, B3, C0, C1, C2
    benefitId: text("benefit_id").references(() => benefits.id),
    templateKey: text("template_key").notNull(),
    templateVars: jsonb("template_vars").notNull().$type<Record<string, string | number>>(),
    renderedTitle: text("rendered_title").notNull(),
    renderedBody: text("rendered_body").notNull(),

    // Scoring
    dollarImpactScore: integer("dollar_impact_score").notNull(),
    urgencyScore: integer("urgency_score").notNull(),
    actionabilityScore: integer("actionability_score").notNull(),
    noveltyScore: integer("novelty_score").notNull(),
    confidenceScore: integer("confidence_score").notNull(),
    totalScore: integer("total_score").notNull(),
    floorOverride: boolean("floor_override").notNull().default(false),

    // Lifecycle
    state: text("state").notNull().default("pending"), // pending, shown, expired, superseded
    dedupKey: text("dedup_key").notNull(),

    // Context
    triggeredByTransactionId: text("triggered_by_transaction_id").references(
      () => transactions.id
    ),
    periodStart: timestamp("period_start", { mode: "date" }),
    periodEnd: timestamp("period_end", { mode: "date" }),

    // Timestamps
    generatedAt: timestamp("generated_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
    shownAt: timestamp("shown_at", { mode: "date" }),
    resolvedAt: timestamp("resolved_at", { mode: "date" }),
  },
  (table) => [
    unique("insights_user_card_dedup").on(
      table.userId,
      table.cardProfileId,
      table.dedupKey
    ),
    index("insights_user_state_idx").on(table.userId, table.state),
    index("insights_user_score_idx").on(table.userId, table.totalScore),
  ]
);

export const insightImpressions = pgTable(
  "insight_impressions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    insightId: text("insight_id")
      .notNull()
      .references(() => insights.id, { onDelete: "cascade" }),
    surface: text("surface").notNull(), // "benefits_page", "spending_page"
    shownAt: timestamp("shown_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("insight_impressions_insight_idx").on(table.insightId),
  ]
);

export const competitorMap = pgTable(
  "competitor_map",
  {
    id: serial("id").primaryKey(),
    cardType: text("card_type").notNull(),
    benefitKey: text("benefit_key").notNull(),
    benefitPartner: text("benefit_partner").notNull(),
    competitorMerchant: text("competitor_merchant").notNull(),
    plaidMerchantPattern: text("plaid_merchant_pattern").notNull(),
    category: text("category").notNull(),
    insightType: text("insight_type").notNull(), // "A1" | "A2"
    notes: text("notes"),
  },
  (table) => [
    index("competitor_map_card_idx").on(table.cardType),
    index("competitor_map_pattern_idx").on(table.plaidMerchantPattern),
  ]
);

// ── Points Earning Summary ──

export const pointsEarningSummary = pgTable(
  "points_earning_summary",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardProfileId: text("card_profile_id")
      .notNull()
      .references(() => cardProfiles.id, { onDelete: "cascade" }),
    cardId: text("card_id").notNull(), // denormalized from earn config
    periodType: text("period_type").notNull(), // "anniversary_year"
    periodStart: timestamp("period_start", { mode: "date" }).notNull(),
    periodEnd: timestamp("period_end", { mode: "date" }).notNull(),
    totalSpend: real("total_spend").notNull().default(0),
    totalPoints: integer("total_points").notNull().default(0),
    valueConservative: real("value_conservative").notNull().default(0),
    valueUpside: real("value_upside").notNull().default(0),
    categoryBreakdown: jsonb("category_breakdown")
      .notNull()
      .$type<
        Array<{
          category: string;
          spend: number;
          points: number;
          earnRate: number;
          valueConservative: number;
        }>
      >()
      .default([]),
    lastTransactionDate: timestamp("last_transaction_date", { mode: "date" }),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    unique("points_earning_summary_unique").on(
      table.cardProfileId,
      table.periodType,
      table.periodStart
    ),
    index("points_earning_summary_user_idx").on(table.userId),
    index("points_earning_summary_card_profile_idx").on(table.cardProfileId),
  ]
);

// ── Benefit Overrides (durable manual redemption intent) ──

export const benefitOverrides = pgTable(
  "benefit_overrides",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardProfileId: text("card_profile_id")
      .notNull()
      .references(() => cardProfiles.id, { onDelete: "cascade" }),
    benefitId: text("benefit_id")
      .notNull()
      .references(() => benefits.id, { onDelete: "cascade" }),
    periodKey: text("period_key").notNull(),
    overrideType: text("override_type").notNull(), // "redeemed"
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    unique("benefit_overrides_unique").on(
      table.userId,
      table.benefitId,
      table.periodKey
    ),
  ]
);

// ── Card Simulations (precomputed comparison data) ──

export const cardSimulations = pgTable(
  "card_simulations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardProfileId: text("card_profile_id")
      .notNull()
      .references(() => cardProfiles.id, { onDelete: "cascade" }),
    simulatedCardId: text("simulated_card_id").notNull(), // e.g. "chase_sapphire_reserve"
    portalMode: boolean("portal_mode").notNull().default(false),
    annualFee: integer("annual_fee").notNull(),
    totalPoints: integer("total_points").notNull().default(0),
    bonusPoints: integer("bonus_points").notNull().default(0),
    pointsValueConservative: real("points_value_conservative").notNull().default(0),
    pointsValueUpside: real("points_value_upside").notNull().default(0),
    benefitsSimulated: real("benefits_simulated").notNull().default(0),
    benefitsValue: real("benefits_value").notNull().default(0),
    parallelValue: real("parallel_value").notNull().default(0),
    netFloor: real("net_floor").notNull().default(0),
    netCeiling: real("net_ceiling").notNull().default(0),
    netActual: real("net_actual").notNull().default(0),
    categoryBreakdown: jsonb("category_breakdown")
      .notNull()
      .$type<
        Array<{
          category: string;
          label: string;
          icon: string;
          totalSpend: number;
          transactionCount: number;
          earnRate: number;
          points: number;
          valueConservative: number;
          capNote: string | null;
        }>
      >()
      .default([]),
    analysisPeriodStart: timestamp("analysis_period_start", { mode: "date" }).notNull(),
    analysisPeriodEnd: timestamp("analysis_period_end", { mode: "date" }).notNull(),
    monthCount: integer("month_count").notNull().default(0),
    totalSpend: real("total_spend").notNull().default(0),
    totalTransactions: integer("total_transactions").notNull().default(0),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    unique("card_simulations_unique").on(
      table.cardProfileId,
      table.simulatedCardId,
      table.portalMode
    ),
    index("card_simulations_user_idx").on(table.userId),
    index("card_simulations_card_profile_idx").on(table.cardProfileId),
  ]
);

// ── Relations ──

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  cardProfiles: many(cardProfiles),
  plaidConnections: many(plaidConnections),
  transactions: many(transactions),
  benefitUsage: many(benefitUsage),
  transactionFlags: many(transactionFlags),
  insights: many(insights),
  benefitOverrides: many(benefitOverrides),
  pointsEarningSummary: many(pointsEarningSummary),
  cardSimulations: many(cardSimulations),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const cardsRelations = relations(cards, ({ many }) => ({
  benefits: many(benefits),
}));

export const benefitsRelations = relations(benefits, ({ one, many }) => ({
  card: one(cards, {
    fields: [benefits.cardId],
    references: [cards.id],
  }),
  usage: many(benefitUsage),
}));

export const plaidConnectionsRelations = relations(
  plaidConnections,
  ({ one, many }) => ({
    user: one(users, {
      fields: [plaidConnections.userId],
      references: [users.id],
    }),
    cardProfiles: many(cardProfiles),
    transactions: many(transactions),
  })
);

export const cardProfilesRelations = relations(
  cardProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [cardProfiles.userId],
      references: [users.id],
    }),
    plaidConnection: one(plaidConnections, {
      fields: [cardProfiles.plaidConnectionId],
      references: [plaidConnections.id],
    }),
    benefitUsage: many(benefitUsage),
    insights: many(insights),
    pointsEarningSummary: many(pointsEarningSummary),
    cardSimulations: many(cardSimulations),
  })
);

export const cardSimulationsRelations = relations(
  cardSimulations,
  ({ one }) => ({
    user: one(users, {
      fields: [cardSimulations.userId],
      references: [users.id],
    }),
    cardProfile: one(cardProfiles, {
      fields: [cardSimulations.cardProfileId],
      references: [cardProfiles.id],
    }),
  })
);

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    plaidConnection: one(plaidConnections, {
      fields: [transactions.plaidConnectionId],
      references: [plaidConnections.id],
    }),
    user: one(users, {
      fields: [transactions.userId],
      references: [users.id],
    }),
    matches: many(matchedTx),
  })
);

export const benefitUsageRelations = relations(
  benefitUsage,
  ({ one, many }) => ({
    user: one(users, {
      fields: [benefitUsage.userId],
      references: [users.id],
    }),
    benefit: one(benefits, {
      fields: [benefitUsage.benefitId],
      references: [benefits.id],
    }),
    cardProfile: one(cardProfiles, {
      fields: [benefitUsage.cardProfileId],
      references: [cardProfiles.id],
    }),
    matches: many(matchedTx),
  })
);

export const transactionFlagsRelations = relations(
  transactionFlags,
  ({ one }) => ({
    user: one(users, {
      fields: [transactionFlags.userId],
      references: [users.id],
    }),
    transaction: one(transactions, {
      fields: [transactionFlags.transactionId],
      references: [transactions.id],
    }),
    benefit: one(benefits, {
      fields: [transactionFlags.benefitId],
      references: [benefits.id],
    }),
  })
);

export const matchedTxRelations = relations(matchedTx, ({ one }) => ({
  transaction: one(transactions, {
    fields: [matchedTx.transactionId],
    references: [transactions.id],
  }),
  benefitUsage: one(benefitUsage, {
    fields: [matchedTx.benefitUsageId],
    references: [benefitUsage.id],
  }),
}));

export const insightsRelations = relations(insights, ({ one, many }) => ({
  user: one(users, {
    fields: [insights.userId],
    references: [users.id],
  }),
  cardProfile: one(cardProfiles, {
    fields: [insights.cardProfileId],
    references: [cardProfiles.id],
  }),
  benefit: one(benefits, {
    fields: [insights.benefitId],
    references: [benefits.id],
  }),
  triggeredByTransaction: one(transactions, {
    fields: [insights.triggeredByTransactionId],
    references: [transactions.id],
  }),
  impressions: many(insightImpressions),
}));

export const insightImpressionsRelations = relations(
  insightImpressions,
  ({ one }) => ({
    insight: one(insights, {
      fields: [insightImpressions.insightId],
      references: [insights.id],
    }),
  })
);

export const pointsEarningSummaryRelations = relations(
  pointsEarningSummary,
  ({ one }) => ({
    user: one(users, {
      fields: [pointsEarningSummary.userId],
      references: [users.id],
    }),
    cardProfile: one(cardProfiles, {
      fields: [pointsEarningSummary.cardProfileId],
      references: [cardProfiles.id],
    }),
  })
);

export const benefitOverridesRelations = relations(
  benefitOverrides,
  ({ one }) => ({
    user: one(users, {
      fields: [benefitOverrides.userId],
      references: [users.id],
    }),
    cardProfile: one(cardProfiles, {
      fields: [benefitOverrides.cardProfileId],
      references: [cardProfiles.id],
    }),
    benefit: one(benefits, {
      fields: [benefitOverrides.benefitId],
      references: [benefits.id],
    }),
  })
);
