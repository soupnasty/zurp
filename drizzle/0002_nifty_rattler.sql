CREATE TABLE "category_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"normalized_merchant" text NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "category_overrides_user_merchant" UNIQUE("user_id","normalized_merchant")
);
--> statement-breakpoint
ALTER TABLE "category_overrides" ADD CONSTRAINT "category_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_overrides_user_idx" ON "category_overrides" USING btree ("user_id");