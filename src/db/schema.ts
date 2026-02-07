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

export const userCards = pgTable("user_cards", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id),
  anniversaryDate: timestamp("anniversary_date", { mode: "date" }),
  anniversarySource: text("anniversary_source")
    .notNull()
    .default("pending"), // "auto_detected" | "user_provided" | "pending"
  isPrimary: boolean("is_primary").notNull().default(true),
  addedAt: timestamp("added_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const plaidConnections = pgTable("plaid_connections", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userCardId: text("user_card_id")
    .notNull()
    .references(() => userCards.id, { onDelete: "cascade" }),
  plaidItemId: text("plaid_item_id").notNull(),
  plaidAccessToken: text("plaid_access_token").notNull(), // encrypted
  institutionName: text("institution_name").notNull(),
  accountId: text("account_id").notNull(),
  status: text("status").notNull().default("active"), // "active" | "needs_reauth" | "disconnected"
  lastSyncCursor: text("last_sync_cursor"),
  lastSyncedAt: timestamp("last_synced_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

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
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id),
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
  ]
);

// ── Relations ──

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  userCards: many(userCards),
  plaidConnections: many(plaidConnections),
  transactions: many(transactions),
  benefitUsage: many(benefitUsage),
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
  userCards: many(userCards),
}));

export const benefitsRelations = relations(benefits, ({ one, many }) => ({
  card: one(cards, {
    fields: [benefits.cardId],
    references: [cards.id],
  }),
  usage: many(benefitUsage),
}));

export const userCardsRelations = relations(userCards, ({ one, many }) => ({
  user: one(users, {
    fields: [userCards.userId],
    references: [users.id],
  }),
  card: one(cards, {
    fields: [userCards.cardId],
    references: [cards.id],
  }),
  plaidConnections: many(plaidConnections),
}));

export const plaidConnectionsRelations = relations(
  plaidConnections,
  ({ one, many }) => ({
    user: one(users, {
      fields: [plaidConnections.userId],
      references: [users.id],
    }),
    userCard: one(userCards, {
      fields: [plaidConnections.userCardId],
      references: [userCards.id],
    }),
    transactions: many(transactions),
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
    card: one(cards, {
      fields: [benefitUsage.cardId],
      references: [cards.id],
    }),
    matches: many(matchedTx),
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
