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

  // ── Seed competitor map ──
  console.log("\n  Seeding competitor map...");

  const competitorEntries = [
    // ── CSR entries ──
    // Events → StubHub (A1)
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_stubhub_h1", benefitPartner: "StubHub", competitorMerchant: "Ticketmaster", plaidMerchantPattern: "ticketmaster", category: "events", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_stubhub_h1", benefitPartner: "StubHub", competitorMerchant: "AXS", plaidMerchantPattern: "axs", category: "events", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_stubhub_h1", benefitPartner: "StubHub", competitorMerchant: "SeatGeek", plaidMerchantPattern: "seatgeek", category: "events", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_stubhub_h1", benefitPartner: "StubHub", competitorMerchant: "Vivid Seats", plaidMerchantPattern: "vivid seats", category: "events", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_stubhub_h1", benefitPartner: "StubHub", competitorMerchant: "Eventbrite", plaidMerchantPattern: "eventbrite", category: "events", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_stubhub_h1", benefitPartner: "StubHub", competitorMerchant: "Dice", plaidMerchantPattern: "dice.fm", category: "events", insightType: "A1" },
    // Food delivery → DoorDash (A1)
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_doordash_restaurant", benefitPartner: "DoorDash", competitorMerchant: "Uber Eats", plaidMerchantPattern: "uber eats", category: "food_delivery", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_doordash_restaurant", benefitPartner: "DoorDash", competitorMerchant: "Uber Eats", plaidMerchantPattern: "ubereats", category: "food_delivery", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_doordash_restaurant", benefitPartner: "DoorDash", competitorMerchant: "Grubhub", plaidMerchantPattern: "grubhub", category: "food_delivery", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_doordash_restaurant", benefitPartner: "DoorDash", competitorMerchant: "Postmates", plaidMerchantPattern: "postmates", category: "food_delivery", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_doordash_restaurant", benefitPartner: "DoorDash", competitorMerchant: "Seamless", plaidMerchantPattern: "seamless", category: "food_delivery", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_doordash_restaurant", benefitPartner: "DoorDash", competitorMerchant: "Caviar", plaidMerchantPattern: "caviar", category: "food_delivery", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_doordash_restaurant", benefitPartner: "DoorDash", competitorMerchant: "Instacart", plaidMerchantPattern: "instacart", category: "food_delivery", insightType: "A1" },
    // Rideshare → Lyft (A1)
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_lyft", benefitPartner: "Lyft", competitorMerchant: "Uber", plaidMerchantPattern: "uber", category: "rideshare", insightType: "A1", notes: "Exclude uber eats" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_lyft", benefitPartner: "Lyft", competitorMerchant: "Taxi", plaidMerchantPattern: "taxi", category: "rideshare", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_lyft", benefitPartner: "Lyft", competitorMerchant: "Yellow Cab", plaidMerchantPattern: "yellow cab", category: "rideshare", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_lyft", benefitPartner: "Lyft", competitorMerchant: "Curb", plaidMerchantPattern: "curb", category: "rideshare", insightType: "A1" },
    // Hotels → The Edit (A1)
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "Hotels.com", plaidMerchantPattern: "hotels.com", category: "travel", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "Expedia", plaidMerchantPattern: "expedia", category: "travel", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "Booking.com", plaidMerchantPattern: "booking.com", category: "travel", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "Marriott", plaidMerchantPattern: "marriott", category: "travel", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "Hilton", plaidMerchantPattern: "hilton", category: "travel", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "Hyatt", plaidMerchantPattern: "hyatt", category: "travel", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "IHG", plaidMerchantPattern: "ihg", category: "travel", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "Airbnb", plaidMerchantPattern: "airbnb", category: "travel", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "VRBO", plaidMerchantPattern: "vrbo", category: "travel", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "Priceline", plaidMerchantPattern: "priceline", category: "travel", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_edit_h1", benefitPartner: "The Edit", competitorMerchant: "Travelocity", plaidMerchantPattern: "travelocity", category: "travel", insightType: "A1" },
    // Fitness → Peloton (A1)
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "ClassPass", plaidMerchantPattern: "classpass", category: "fitness", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "Equinox", plaidMerchantPattern: "equinox", category: "fitness", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "SoulCycle", plaidMerchantPattern: "soulcycle", category: "fitness", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "Planet Fitness", plaidMerchantPattern: "planet fitness", category: "fitness", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "24 Hour Fitness", plaidMerchantPattern: "24 hour fitness", category: "fitness", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "Orangetheory", plaidMerchantPattern: "orangetheory", category: "fitness", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "Barry's", plaidMerchantPattern: "barrys", category: "fitness", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "Life Time", plaidMerchantPattern: "life time", category: "fitness", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "LA Fitness", plaidMerchantPattern: "la fitness", category: "fitness", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "YMCA", plaidMerchantPattern: "ymca", category: "fitness", insightType: "A1" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_peloton", benefitPartner: "Peloton", competitorMerchant: "Crunch", plaidMerchantPattern: "crunch", category: "fitness", insightType: "A1" },
    // Streaming → Apple Music (A2)
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_music", benefitPartner: "Apple Music", competitorMerchant: "Spotify", plaidMerchantPattern: "spotify", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_music", benefitPartner: "Apple Music", competitorMerchant: "YouTube Music", plaidMerchantPattern: "youtube music", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_music", benefitPartner: "Apple Music", competitorMerchant: "Tidal", plaidMerchantPattern: "tidal", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_music", benefitPartner: "Apple Music", competitorMerchant: "Amazon Music", plaidMerchantPattern: "amazon music", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_music", benefitPartner: "Apple Music", competitorMerchant: "Deezer", plaidMerchantPattern: "deezer", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_music", benefitPartner: "Apple Music", competitorMerchant: "Pandora", plaidMerchantPattern: "pandora", category: "streaming", insightType: "A2" },
    // Streaming → Apple TV+ (A2)
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_tv", benefitPartner: "Apple TV+", competitorMerchant: "Netflix", plaidMerchantPattern: "netflix", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_tv", benefitPartner: "Apple TV+", competitorMerchant: "Hulu", plaidMerchantPattern: "hulu", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_tv", benefitPartner: "Apple TV+", competitorMerchant: "Disney+", plaidMerchantPattern: "disney+", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_tv", benefitPartner: "Apple TV+", competitorMerchant: "Disney+", plaidMerchantPattern: "disneyplus", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_tv", benefitPartner: "Apple TV+", competitorMerchant: "Max", plaidMerchantPattern: "max.com", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_tv", benefitPartner: "Apple TV+", competitorMerchant: "HBO Max", plaidMerchantPattern: "hbo max", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_tv", benefitPartner: "Apple TV+", competitorMerchant: "Paramount+", plaidMerchantPattern: "paramount+", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_tv", benefitPartner: "Apple TV+", competitorMerchant: "Paramount+", plaidMerchantPattern: "paramountplus", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_tv", benefitPartner: "Apple TV+", competitorMerchant: "Peacock", plaidMerchantPattern: "peacock", category: "streaming", insightType: "A2" },
    { cardType: "chase_sapphire_reserve", benefitKey: "csr_apple_tv", benefitPartner: "Apple TV+", competitorMerchant: "Amazon Prime Video", plaidMerchantPattern: "prime video", category: "streaming", insightType: "A2" },

    // ── CSP entries ──
    // Food delivery → DoorDash non-restaurant promo (A1)
    { cardType: "chase_sapphire_preferred", benefitKey: "csp_doordash_nonrestaurant_promo", benefitPartner: "DoorDash", competitorMerchant: "Uber Eats", plaidMerchantPattern: "uber eats", category: "food_delivery", insightType: "A1" },
    { cardType: "chase_sapphire_preferred", benefitKey: "csp_doordash_nonrestaurant_promo", benefitPartner: "DoorDash", competitorMerchant: "Grubhub", plaidMerchantPattern: "grubhub", category: "food_delivery", insightType: "A1" },
    { cardType: "chase_sapphire_preferred", benefitKey: "csp_doordash_nonrestaurant_promo", benefitPartner: "DoorDash", competitorMerchant: "Postmates", plaidMerchantPattern: "postmates", category: "food_delivery", insightType: "A1" },
    // Rideshare → Lyft 5x earning rate (A1)
    { cardType: "chase_sapphire_preferred", benefitKey: "csp_5x_lyft", benefitPartner: "Lyft", competitorMerchant: "Uber", plaidMerchantPattern: "uber", category: "rideshare", insightType: "A1", notes: "Exclude uber eats. Points multiplier — not a credit." },

    // ── Amex Gold entries ──
    // Food delivery → Grubhub (A1 — dining credit redirect)
    { cardType: "amex_gold", benefitKey: "gold_dining_credit", benefitPartner: "Grubhub", competitorMerchant: "DoorDash", plaidMerchantPattern: "doordash", category: "food_delivery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_dining_credit", benefitPartner: "Grubhub", competitorMerchant: "DoorDash", plaidMerchantPattern: "door dash", category: "food_delivery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_dining_credit", benefitPartner: "Grubhub", competitorMerchant: "Postmates", plaidMerchantPattern: "postmates", category: "food_delivery", insightType: "A1" },
    // Food delivery → Uber Eats (A1 — Uber Cash redirect, forward-compatible)
    { cardType: "amex_gold", benefitKey: "gold_uber_cash", benefitPartner: "Uber Eats", competitorMerchant: "DoorDash", plaidMerchantPattern: "doordash", category: "food_delivery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_uber_cash", benefitPartner: "Uber Eats", competitorMerchant: "DoorDash", plaidMerchantPattern: "door dash", category: "food_delivery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_uber_cash", benefitPartner: "Uber Eats", competitorMerchant: "Postmates", plaidMerchantPattern: "postmates", category: "food_delivery", insightType: "A1" },
    // Coffee → Dunkin' (A1 — dunkin credit redirect)
    { cardType: "amex_gold", benefitKey: "gold_dunkin_credit", benefitPartner: "Dunkin'", competitorMerchant: "Starbucks", plaidMerchantPattern: "starbucks", category: "coffee", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_dunkin_credit", benefitPartner: "Dunkin'", competitorMerchant: "Starbucks", plaidMerchantPattern: "starbucks store", category: "coffee", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_dunkin_credit", benefitPartner: "Dunkin'", competitorMerchant: "Peet's Coffee", plaidMerchantPattern: "peet", category: "coffee", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_dunkin_credit", benefitPartner: "Dunkin'", competitorMerchant: "Peet's Coffee", plaidMerchantPattern: "peets", category: "coffee", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_dunkin_credit", benefitPartner: "Dunkin'", competitorMerchant: "Peet's Coffee", plaidMerchantPattern: "peet's", category: "coffee", insightType: "A1" },
    // Grocery → Supermarket (A1 — earning rate redirect, forward-compatible)
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Walmart", plaidMerchantPattern: "walmart", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Walmart", plaidMerchantPattern: "wal-mart", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Walmart", plaidMerchantPattern: "wm supercenter", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Target", plaidMerchantPattern: "target", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Costco", plaidMerchantPattern: "costco", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Sam's Club", plaidMerchantPattern: "sams club", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Sam's Club", plaidMerchantPattern: "sam's club", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Sam's Club", plaidMerchantPattern: "samsclub", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "HelloFresh", plaidMerchantPattern: "hellofresh", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "HelloFresh", plaidMerchantPattern: "hello fresh", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Blue Apron", plaidMerchantPattern: "blue apron", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Blue Apron", plaidMerchantPattern: "blueapron", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Home Chef", plaidMerchantPattern: "home chef", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Home Chef", plaidMerchantPattern: "homechef", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Sun Basket", plaidMerchantPattern: "sunbasket", category: "grocery", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_4x_supermarkets", benefitPartner: "U.S. Supermarket", competitorMerchant: "Green Chef", plaidMerchantPattern: "green chef", category: "grocery", insightType: "A1" },
    // Flights → Direct airline (A1 — earning rate redirect, forward-compatible)
    { cardType: "amex_gold", benefitKey: "gold_3x_flights", benefitPartner: "Direct Airline", competitorMerchant: "Expedia", plaidMerchantPattern: "expedia", category: "flights", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_3x_flights", benefitPartner: "Direct Airline", competitorMerchant: "Kayak", plaidMerchantPattern: "kayak", category: "flights", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_3x_flights", benefitPartner: "Direct Airline", competitorMerchant: "Orbitz", plaidMerchantPattern: "orbitz", category: "flights", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_3x_flights", benefitPartner: "Direct Airline", competitorMerchant: "Priceline", plaidMerchantPattern: "priceline", category: "flights", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_3x_flights", benefitPartner: "Direct Airline", competitorMerchant: "Travelocity", plaidMerchantPattern: "travelocity", category: "flights", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_3x_flights", benefitPartner: "Direct Airline", competitorMerchant: "CheapTickets", plaidMerchantPattern: "cheaptickets", category: "flights", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_3x_flights", benefitPartner: "Direct Airline", competitorMerchant: "Hotwire", plaidMerchantPattern: "hotwire", category: "flights", insightType: "A1" },
    // Hotels → AmexTravel.com (A1 — Hotel Collection redirect, forward-compatible)
    { cardType: "amex_gold", benefitKey: "gold_hotel_collection", benefitPartner: "AmexTravel.com", competitorMerchant: "Hotels.com", plaidMerchantPattern: "hotels.com", category: "hotels", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_hotel_collection", benefitPartner: "AmexTravel.com", competitorMerchant: "Hotels.com", plaidMerchantPattern: "hotels com", category: "hotels", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_hotel_collection", benefitPartner: "AmexTravel.com", competitorMerchant: "Booking.com", plaidMerchantPattern: "booking.com", category: "hotels", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_hotel_collection", benefitPartner: "AmexTravel.com", competitorMerchant: "Booking.com", plaidMerchantPattern: "booking com", category: "hotels", insightType: "A1" },
    { cardType: "amex_gold", benefitKey: "gold_hotel_collection", benefitPartner: "AmexTravel.com", competitorMerchant: "Trivago", plaidMerchantPattern: "trivago", category: "hotels", insightType: "A1" },
    // Dining reservations → Resy (A1 — Resy credit redirect)
    { cardType: "amex_gold", benefitKey: "gold_resy_credit_h1", benefitPartner: "Resy", competitorMerchant: "OpenTable", plaidMerchantPattern: "opentable", category: "dining_reservation", insightType: "A1" },
  ];

  for (const entry of competitorEntries) {
    await db
      .insert(schema.competitorMap)
      .values(entry)
      .onConflictDoNothing();
  }

  console.log(`  ${competitorEntries.length} competitor map entries`);

  console.log("\nSeed complete!");
  console.log(
    `  ${cardRegistry.length} card(s), ${cardRegistry.reduce((sum, c) => sum + c.benefits.length, 0)} benefit(s)`
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
