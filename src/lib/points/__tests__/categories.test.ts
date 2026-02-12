import { describe, it, expect } from "vitest";
import { classifyForPoints } from "../categories";

describe("classifyForPoints", () => {
  describe("Tier 1: Merchant name match", () => {
    it("maps DOORDASH to food_delivery", () => {
      const result = classifyForPoints("DOORDASH*ORDER 12345", null, null);
      expect(result.category).toBe("food_delivery");
      expect(result.confidence).toBe("high");
      expect(result.matchSource).toBe("merchant_name");
    });

    it("maps STARBUCKS to coffee", () => {
      const result = classifyForPoints("STARBUCKS STORE #1234", null, null);
      expect(result.category).toBe("coffee");
      expect(result.confidence).toBe("high");
    });

    it("maps NETFLIX to streaming", () => {
      const result = classifyForPoints("NETFLIX.COM", null, null);
      expect(result.category).toBe("streaming");
      expect(result.confidence).toBe("high");
    });

    it("maps LYFT to rideshare", () => {
      const result = classifyForPoints("LYFT *RIDE 8472", null, null);
      expect(result.category).toBe("rideshare");
      expect(result.confidence).toBe("high");
    });

    it("maps PELOTON to fitness", () => {
      const result = classifyForPoints("PELOTON INTERACTIVE", null, null);
      expect(result.category).toBe("fitness");
      expect(result.confidence).toBe("high");
    });

    it("maps TICKETMASTER to entertainment", () => {
      const result = classifyForPoints("TICKETMASTER*CONCERT", null, null);
      expect(result.category).toBe("entertainment");
      expect(result.confidence).toBe("high");
    });

    it("maps WHOLE FOODS to groceries", () => {
      const result = classifyForPoints("WHOLE FOODS MARKET #123", null, null);
      expect(result.category).toBe("groceries");
      expect(result.confidence).toBe("high");
    });

    it("maps CVS to drugstores", () => {
      const result = classifyForPoints("CVS/PHARMACY #1234", null, null);
      expect(result.category).toBe("drugstores");
      expect(result.confidence).toBe("high");
    });

    it("maps HOME DEPOT to home_improvement", () => {
      const result = classifyForPoints("HOME DEPOT #5678", null, null);
      expect(result.category).toBe("home_improvement");
      expect(result.confidence).toBe("high");
    });

    it("maps HERTZ to car_rentals", () => {
      const result = classifyForPoints("HERTZ RENT-A-CAR", null, null);
      expect(result.category).toBe("car_rentals");
      expect(result.confidence).toBe("high");
    });

    it("maps COSTCO to wholesale_clubs", () => {
      const result = classifyForPoints("COSTCO WHSE #1234", null, null);
      expect(result.category).toBe("wholesale_clubs");
      expect(result.confidence).toBe("high");
    });

    it("maps VERIZON to phone_services", () => {
      const result = classifyForPoints("VERIZON WIRELESS", null, null);
      expect(result.category).toBe("phone_services");
      expect(result.confidence).toBe("high");
    });

    it("maps CHASE TRAVEL to travel_portal", () => {
      const result = classifyForPoints("CHASE TRAVEL BOOKING", null, null);
      expect(result.category).toBe("travel_portal");
      expect(result.confidence).toBe("high");
    });

    it("maps UNITED AIR to travel_flights", () => {
      const result = classifyForPoints("UNITED AIR LINES", null, null);
      expect(result.category).toBe("travel_flights");
      expect(result.confidence).toBe("high");
    });

    it("maps MARRIOTT to travel_hotels", () => {
      const result = classifyForPoints("MARRIOTT HOTELS", null, null);
      expect(result.category).toBe("travel_hotels");
      expect(result.confidence).toBe("high");
    });
  });

  describe("Uber disambiguation", () => {
    it("maps UBER EATS to food_delivery", () => {
      const result = classifyForPoints("UBER* EATS ORDER", null, null);
      expect(result.category).toBe("food_delivery");
      expect(result.confidence).toBe("high");
    });

    it("maps UBER TRIP to rideshare", () => {
      const result = classifyForPoints("UBER* TRIP HELP.UBER.COM", null, null);
      expect(result.category).toBe("rideshare");
      expect(result.confidence).toBe("high");
    });

    it("maps plain UBER to rideshare (fallback)", () => {
      const result = classifyForPoints("UBER BV", null, null);
      expect(result.category).toBe("rideshare");
      expect(result.confidence).toBe("high");
    });
  });

  describe("Amazon disambiguation", () => {
    it("maps AMAZON FRESH to grocery_online", () => {
      const result = classifyForPoints("AMAZON FRESH ORDER", null, null);
      expect(result.category).toBe("grocery_online");
      expect(result.confidence).toBe("high");
    });

    it("maps plain AMAZON to shopping_online", () => {
      const result = classifyForPoints("AMAZON.COM*123ABC", null, null);
      expect(result.category).toBe("shopping_online");
      expect(result.confidence).toBe("high");
    });

    it("maps AMAZON PRIME to streaming via contains match", () => {
      const result = classifyForPoints("AMAZON PRIME MEMBERSHIP", null, null);
      expect(result.category).toBe("streaming");
      expect(result.confidence).toBe("high");
    });
  });

  describe("Tier 2: Plaid category fallback", () => {
    it("uses Plaid detailed category when no merchant match", () => {
      const result = classifyForPoints(
        "LITTLE ITALIAN PLACE",
        null,
        "FOOD_AND_DRINK_RESTAURANTS"
      );
      expect(result.category).toBe("dining");
      expect(result.confidence).toBe("medium");
      expect(result.matchSource).toBe("plaid_category");
    });

    it("maps Plaid grocery category", () => {
      const result = classifyForPoints(
        "LOCAL MARKET",
        null,
        "FOOD_AND_DRINK_GROCERIES"
      );
      expect(result.category).toBe("groceries");
      expect(result.confidence).toBe("medium");
    });

    it("maps Plaid transit category", () => {
      const result = classifyForPoints(
        "CITY BUS PASS",
        null,
        "TRANSPORTATION_PUBLIC_TRANSIT"
      );
      expect(result.category).toBe("transit");
      expect(result.confidence).toBe("medium");
    });

    it("tries primary category when detailed doesn't match", () => {
      const result = classifyForPoints(
        "MYSTERY MERCHANT",
        "TRANSPORTATION_GAS",
        "UNKNOWN_DETAILED"
      );
      expect(result.category).toBe("gas_stations");
      expect(result.confidence).toBe("medium");
    });

    it("maps Plaid parking to parking", () => {
      const result = classifyForPoints(
        "PARKING GARAGE",
        null,
        "TRANSPORTATION_PARKING"
      );
      expect(result.category).toBe("parking");
      expect(result.confidence).toBe("medium");
    });
  });

  describe("Tier 3: Fallback to other", () => {
    it("returns other with low confidence for unknown", () => {
      const result = classifyForPoints("RANDOM STORE 123", null, null);
      expect(result.category).toBe("other");
      expect(result.confidence).toBe("low");
      expect(result.matchSource).toBe("fallback");
      expect(result.matchedValue).toBeNull();
    });

    it("handles null merchant name", () => {
      const result = classifyForPoints(null, null, null);
      expect(result.category).toBe("other");
      expect(result.confidence).toBe("low");
    });
  });

  describe("Tier 1 takes priority over Tier 2", () => {
    it("merchant match wins over Plaid category", () => {
      // Starbucks should be coffee even if Plaid says dining
      const result = classifyForPoints(
        "STARBUCKS #12345",
        null,
        "FOOD_AND_DRINK_RESTAURANTS"
      );
      expect(result.category).toBe("coffee");
      expect(result.confidence).toBe("high");
    });
  });
});
