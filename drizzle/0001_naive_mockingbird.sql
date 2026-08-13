CREATE TABLE "insight_dismissals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"suppression_key" text NOT NULL,
	"dismiss_count" integer DEFAULT 1 NOT NULL,
	"last_dismissed_at" timestamp NOT NULL,
	"suppressed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "dismissals_user_key" UNIQUE("user_id","suppression_key")
);
--> statement-breakpoint
CREATE TABLE "lifestyle_selections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lifestyle_key" text NOT NULL,
	"selected_at" timestamp NOT NULL,
	CONSTRAINT "ls_user_key" UNIQUE("user_id","lifestyle_key")
);
--> statement-breakpoint
ALTER TABLE "card_simulations" ADD COLUMN "matched_per_benefit" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "competitor_map" ADD COLUMN "last_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "plaid_connections" ADD COLUMN "sync_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "merchant_entity_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "plaid_category_confidence" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_channel" text;--> statement-breakpoint
ALTER TABLE "insight_dismissals" ADD CONSTRAINT "insight_dismissals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lifestyle_selections" ADD CONSTRAINT "lifestyle_selections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dismissals_user_suppressed_idx" ON "insight_dismissals" USING btree ("user_id","suppressed");--> statement-breakpoint
CREATE INDEX "ls_user_idx" ON "lifestyle_selections" USING btree ("user_id");