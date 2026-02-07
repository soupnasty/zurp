import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { cardRegistry } from "../lib/cards";

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sql, schema });

  console.log("Seeding database...");

  for (const cardDef of cardRegistry) {
    // Upsert card
    await db
      .insert(schema.cards)
      .values({
        id: cardDef.id,
        name: cardDef.name,
        issuer: cardDef.issuer,
        network: cardDef.network,
        annualFee: cardDef.annualFee,
        feeDescriptor: cardDef.feeDescriptor,
        imageUrl: cardDef.imageUrl,
        isActive: cardDef.isActive,
      })
      .onConflictDoUpdate({
        target: schema.cards.id,
        set: {
          name: cardDef.name,
          issuer: cardDef.issuer,
          network: cardDef.network,
          annualFee: cardDef.annualFee,
          feeDescriptor: cardDef.feeDescriptor,
          imageUrl: cardDef.imageUrl,
          isActive: cardDef.isActive,
        },
      });

    console.log(`  Card: ${cardDef.name}`);

    // Upsert benefits
    for (const benefit of cardDef.benefits) {
      await db
        .insert(schema.benefits)
        .values({
          id: benefit.id,
          cardId: benefit.cardId,
          name: benefit.name,
          icon: benefit.icon,
          category: benefit.category,
          type: benefit.type,
          creditAmount: benefit.creditAmount,
          cycle: benefit.cycle,
          carriesOver: benefit.carriesOver,
          maxCarryoverPeriods: benefit.maxCarryoverPeriods,
          maxAccrued: benefit.maxAccrued,
          merchantPatterns: benefit.merchantPatterns,
          plaidCategories: benefit.plaidCategories,
          autoMatchable: benefit.autoMatchable,
          requiresActivation: benefit.requiresActivation,
          priority: benefit.priority,
          description: benefit.description,
          notes: benefit.notes,
          sunsetDate: benefit.sunsetDate,
          sourceUrl: benefit.sourceUrl,
          displayGroup: benefit.displayGroup,
          displayGroupName: benefit.displayGroupName,
          displayGroupIcon: benefit.displayGroupIcon,
        })
        .onConflictDoUpdate({
          target: schema.benefits.id,
          set: {
            name: benefit.name,
            icon: benefit.icon,
            category: benefit.category,
            type: benefit.type,
            creditAmount: benefit.creditAmount,
            cycle: benefit.cycle,
            carriesOver: benefit.carriesOver,
            maxCarryoverPeriods: benefit.maxCarryoverPeriods,
            maxAccrued: benefit.maxAccrued,
            merchantPatterns: benefit.merchantPatterns,
            plaidCategories: benefit.plaidCategories,
            autoMatchable: benefit.autoMatchable,
            requiresActivation: benefit.requiresActivation,
            priority: benefit.priority,
            description: benefit.description,
            notes: benefit.notes,
            sunsetDate: benefit.sunsetDate,
            sourceUrl: benefit.sourceUrl,
            displayGroup: benefit.displayGroup,
            displayGroupName: benefit.displayGroupName,
            displayGroupIcon: benefit.displayGroupIcon,
          },
        });

      console.log(`    Benefit: ${benefit.name}`);
    }
  }

  console.log("\nSeed complete!");
  console.log(
    `  ${cardRegistry.length} card(s), ${cardRegistry.reduce((sum, c) => sum + c.benefits.length, 0)} benefit(s)`
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
