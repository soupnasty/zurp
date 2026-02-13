CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "benefit_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_profile_id" text NOT NULL,
	"benefit_id" text NOT NULL,
	"period_key" text NOT NULL,
	"override_type" text NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "benefit_overrides_unique" UNIQUE("user_id","benefit_id","period_key")
);
--> statement-breakpoint
CREATE TABLE "benefit_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"benefit_id" text NOT NULL,
	"card_profile_id" text NOT NULL,
	"period_key" text NOT NULL,
	"cycle_start" timestamp NOT NULL,
	"cycle_end" timestamp NOT NULL,
	"amount_used" real DEFAULT 0 NOT NULL,
	"amount_remaining" real NOT NULL,
	"is_fully_used" boolean DEFAULT false NOT NULL,
	"carried_from" text,
	"carried_amount" real DEFAULT 0 NOT NULL,
	"manual_override" boolean DEFAULT false NOT NULL,
	"override_note" text,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "benefit_usage_unique" UNIQUE("user_id","benefit_id","period_key")
);
--> statement-breakpoint
CREATE TABLE "benefits" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"name" text NOT NULL,
	"icon" text NOT NULL,
	"category" text NOT NULL,
	"type" text NOT NULL,
	"credit_amount" real NOT NULL,
	"cycle" text NOT NULL,
	"carries_over" boolean DEFAULT false NOT NULL,
	"max_carryover_periods" integer,
	"max_accrued" real,
	"merchant_patterns" text[] DEFAULT '{}' NOT NULL,
	"plaid_categories" text[] DEFAULT '{}' NOT NULL,
	"auto_matchable" boolean DEFAULT true NOT NULL,
	"requires_activation" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 50 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"notes" text,
	"sunset_date" text,
	"source_url" text,
	"display_group" text,
	"display_group_name" text,
	"display_group_icon" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plaid_connection_id" text NOT NULL,
	"card_type" text NOT NULL,
	"card_label" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"anniversary_date" timestamp,
	"anniversary_source" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "card_profiles_connection_active" UNIQUE("plaid_connection_id","is_active")
);
--> statement-breakpoint
CREATE TABLE "card_simulations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_profile_id" text NOT NULL,
	"simulated_card_id" text NOT NULL,
	"portal_mode" boolean DEFAULT false NOT NULL,
	"annual_fee" integer NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"bonus_points" integer DEFAULT 0 NOT NULL,
	"points_value_conservative" real DEFAULT 0 NOT NULL,
	"points_value_upside" real DEFAULT 0 NOT NULL,
	"benefits_simulated" real DEFAULT 0 NOT NULL,
	"benefits_value" real DEFAULT 0 NOT NULL,
	"parallel_value" real DEFAULT 0 NOT NULL,
	"net_floor" real DEFAULT 0 NOT NULL,
	"net_ceiling" real DEFAULT 0 NOT NULL,
	"net_actual" real DEFAULT 0 NOT NULL,
	"category_breakdown" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"analysis_period_start" timestamp NOT NULL,
	"analysis_period_end" timestamp NOT NULL,
	"month_count" integer DEFAULT 0 NOT NULL,
	"total_spend" real DEFAULT 0 NOT NULL,
	"total_transactions" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "card_simulations_unique" UNIQUE("card_profile_id","simulated_card_id","portal_mode")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"network" text NOT NULL,
	"annual_fee" integer NOT NULL,
	"fee_descriptor" text NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_map" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_type" text NOT NULL,
	"benefit_key" text NOT NULL,
	"benefit_partner" text NOT NULL,
	"competitor_merchant" text NOT NULL,
	"plaid_merchant_pattern" text NOT NULL,
	"category" text NOT NULL,
	"insight_type" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "insight_impressions" (
	"id" text PRIMARY KEY NOT NULL,
	"insight_id" text NOT NULL,
	"surface" text NOT NULL,
	"shown_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insights" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_profile_id" text,
	"category" text NOT NULL,
	"benefit_id" text,
	"template_key" text NOT NULL,
	"template_vars" jsonb NOT NULL,
	"rendered_title" text NOT NULL,
	"rendered_body" text NOT NULL,
	"dollar_impact_score" integer NOT NULL,
	"urgency_score" integer NOT NULL,
	"actionability_score" integer NOT NULL,
	"novelty_score" integer NOT NULL,
	"confidence_score" integer NOT NULL,
	"total_score" integer NOT NULL,
	"floor_override" boolean DEFAULT false NOT NULL,
	"state" text DEFAULT 'pending' NOT NULL,
	"dedup_key" text NOT NULL,
	"triggered_by_transaction_id" text,
	"period_start" timestamp,
	"period_end" timestamp,
	"generated_at" timestamp NOT NULL,
	"shown_at" timestamp,
	"resolved_at" timestamp,
	CONSTRAINT "insights_user_card_dedup" UNIQUE("user_id","card_profile_id","dedup_key")
);
--> statement-breakpoint
CREATE TABLE "matched_tx" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"benefit_usage_id" text NOT NULL,
	"credit_applied" real NOT NULL,
	"match_method" text DEFAULT 'auto' NOT NULL,
	"match_confidence" text DEFAULT 'high' NOT NULL,
	"matched_at" timestamp NOT NULL,
	CONSTRAINT "matched_tx_unique" UNIQUE("transaction_id","benefit_usage_id")
);
--> statement-breakpoint
CREATE TABLE "plaid_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plaid_item_id" text NOT NULL,
	"plaid_access_token" text NOT NULL,
	"institution_name" text NOT NULL,
	"account_id" text NOT NULL,
	"account_mask" text,
	"status" text DEFAULT 'active' NOT NULL,
	"last_sync_cursor" text,
	"last_synced_at" timestamp,
	"sync_locked_until" timestamp,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "points_earning_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_profile_id" text NOT NULL,
	"card_id" text NOT NULL,
	"period_type" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_spend" real DEFAULT 0 NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"value_conservative" real DEFAULT 0 NOT NULL,
	"value_upside" real DEFAULT 0 NOT NULL,
	"category_breakdown" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_transaction_date" timestamp,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "points_earning_summary_unique" UNIQUE("card_profile_id","period_type","period_start")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_flags" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"transaction_id" text NOT NULL,
	"benefit_id" text NOT NULL,
	"flag_type" text NOT NULL,
	"reason" text,
	"original_match" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "transaction_flags_unique" UNIQUE("user_id","transaction_id","benefit_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"plaid_connection_id" text NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"datetime" timestamp,
	"merchant_name" text,
	"merchant_name_raw" text,
	"amount" real NOT NULL,
	"plaid_category_primary" text,
	"plaid_category_detailed" text,
	"is_annual_fee" boolean DEFAULT false NOT NULL,
	"pending" boolean DEFAULT false NOT NULL,
	"matched_status" text DEFAULT 'unmatched' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"last_active" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_overrides" ADD CONSTRAINT "benefit_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_overrides" ADD CONSTRAINT "benefit_overrides_card_profile_id_card_profiles_id_fk" FOREIGN KEY ("card_profile_id") REFERENCES "public"."card_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_overrides" ADD CONSTRAINT "benefit_overrides_benefit_id_benefits_id_fk" FOREIGN KEY ("benefit_id") REFERENCES "public"."benefits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_usage" ADD CONSTRAINT "benefit_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_usage" ADD CONSTRAINT "benefit_usage_benefit_id_benefits_id_fk" FOREIGN KEY ("benefit_id") REFERENCES "public"."benefits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_usage" ADD CONSTRAINT "benefit_usage_card_profile_id_card_profiles_id_fk" FOREIGN KEY ("card_profile_id") REFERENCES "public"."card_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefits" ADD CONSTRAINT "benefits_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_profiles" ADD CONSTRAINT "card_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_profiles" ADD CONSTRAINT "card_profiles_plaid_connection_id_plaid_connections_id_fk" FOREIGN KEY ("plaid_connection_id") REFERENCES "public"."plaid_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_simulations" ADD CONSTRAINT "card_simulations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_simulations" ADD CONSTRAINT "card_simulations_card_profile_id_card_profiles_id_fk" FOREIGN KEY ("card_profile_id") REFERENCES "public"."card_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insight_impressions" ADD CONSTRAINT "insight_impressions_insight_id_insights_id_fk" FOREIGN KEY ("insight_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_card_profile_id_card_profiles_id_fk" FOREIGN KEY ("card_profile_id") REFERENCES "public"."card_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_benefit_id_benefits_id_fk" FOREIGN KEY ("benefit_id") REFERENCES "public"."benefits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_triggered_by_transaction_id_transactions_id_fk" FOREIGN KEY ("triggered_by_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matched_tx" ADD CONSTRAINT "matched_tx_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matched_tx" ADD CONSTRAINT "matched_tx_benefit_usage_id_benefit_usage_id_fk" FOREIGN KEY ("benefit_usage_id") REFERENCES "public"."benefit_usage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plaid_connections" ADD CONSTRAINT "plaid_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_earning_summary" ADD CONSTRAINT "points_earning_summary_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_earning_summary" ADD CONSTRAINT "points_earning_summary_card_profile_id_card_profiles_id_fk" FOREIGN KEY ("card_profile_id") REFERENCES "public"."card_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_flags" ADD CONSTRAINT "transaction_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_flags" ADD CONSTRAINT "transaction_flags_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_flags" ADD CONSTRAINT "transaction_flags_benefit_id_benefits_id_fk" FOREIGN KEY ("benefit_id") REFERENCES "public"."benefits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_plaid_connection_id_plaid_connections_id_fk" FOREIGN KEY ("plaid_connection_id") REFERENCES "public"."plaid_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "benefit_usage_user_card_idx" ON "benefit_usage" USING btree ("user_id","card_profile_id");--> statement-breakpoint
CREATE INDEX "card_profiles_user_idx" ON "card_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "card_simulations_user_idx" ON "card_simulations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "card_simulations_card_profile_idx" ON "card_simulations" USING btree ("card_profile_id");--> statement-breakpoint
CREATE INDEX "competitor_map_card_idx" ON "competitor_map" USING btree ("card_type");--> statement-breakpoint
CREATE INDEX "competitor_map_pattern_idx" ON "competitor_map" USING btree ("plaid_merchant_pattern");--> statement-breakpoint
CREATE INDEX "insight_impressions_insight_idx" ON "insight_impressions" USING btree ("insight_id");--> statement-breakpoint
CREATE INDEX "insights_user_state_idx" ON "insights" USING btree ("user_id","state");--> statement-breakpoint
CREATE INDEX "insights_user_score_idx" ON "insights" USING btree ("user_id","total_score");--> statement-breakpoint
CREATE INDEX "matched_tx_usage_idx" ON "matched_tx" USING btree ("benefit_usage_id");--> statement-breakpoint
CREATE INDEX "plaid_connections_user_idx" ON "plaid_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "points_earning_summary_user_idx" ON "points_earning_summary" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "points_earning_summary_card_profile_idx" ON "points_earning_summary" USING btree ("card_profile_id");--> statement-breakpoint
CREATE INDEX "transaction_flags_user_flag_idx" ON "transaction_flags" USING btree ("user_id","flag_type");--> statement-breakpoint
CREATE INDEX "transactions_user_date_idx" ON "transactions" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "transactions_matched_status_idx" ON "transactions" USING btree ("matched_status");