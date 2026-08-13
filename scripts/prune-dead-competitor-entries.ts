/**
 * Remove competitor-map rows that target benefits sunset by the Aug 2026 audit
 * (seed.ts inserts with onConflictDoNothing, so deleting from the seed list
 * alone never removes already-seeded rows).
 * Usage: npx tsx scripts/prune-dead-competitor-entries.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { inArray } from "drizzle-orm";
import * as schema from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const DEAD_BENEFIT_KEYS = [
  "cov_annual_travel_credit", // Venture: one-time welcome offer, never recurring
  "delta_flight_credit", // Delta Gold benefit, never applied to Platinum
  "delta_uber_one", // enrollment window closed 6/25/2026
  "southwest_travel_credit", // discontinued 12/31/2025
];

async function main() {
  const deleted = await db
    .delete(schema.competitorMap)
    .where(inArray(schema.competitorMap.benefitKey, DEAD_BENEFIT_KEYS))
    .returning({ key: schema.competitorMap.benefitKey });
  console.log(`Deleted ${deleted.length} competitor-map rows:`);
  for (const key of DEAD_BENEFIT_KEYS) {
    console.log(`  ${key}: ${deleted.filter((d) => d.key === key).length}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
