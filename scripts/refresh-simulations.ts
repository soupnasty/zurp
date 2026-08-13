/**
 * Clear all precomputed card simulations and points summaries so they
 * regenerate with the current classifier. Compare falls back to on-demand
 * computation immediately; each user's next sync re-persists the fast path.
 * Usage: npx tsx scripts/refresh-simulations.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  const sims = await db.delete(schema.cardSimulations);
  const summaries = await db.delete(schema.pointsEarningSummary);
  console.log(
    `Cleared ${sims.rowCount} card simulations and ${summaries.rowCount} points summaries.`
  );
  console.log(
    "Compare now computes on-demand with the current classifier; next sync re-persists."
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
