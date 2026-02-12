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
ALTER TABLE "card_simulations" ADD CONSTRAINT "card_simulations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_simulations" ADD CONSTRAINT "card_simulations_card_profile_id_card_profiles_id_fk" FOREIGN KEY ("card_profile_id") REFERENCES "public"."card_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_simulations_user_idx" ON "card_simulations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "card_simulations_card_profile_idx" ON "card_simulations" USING btree ("card_profile_id");