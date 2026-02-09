/**
 * Clear all persisted insights so they regenerate with current templates.
 * Usage: npx tsx scripts/regenerate-insights.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  const deleted = await db.delete(schema.insights);
  const impressions = await db.delete(schema.insightImpressions);
  console.log("Cleared all insights and impressions.");
  console.log("Trigger a sync from the app to regenerate with new templates.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
