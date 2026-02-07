import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb(): NeonHttpDatabase<typeof schema> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    // Return a stub that will throw on actual usage but won't crash at import time
    return new Proxy({} as NeonHttpDatabase<typeof schema>, {
      get(_, prop) {
        if (prop === "then" || prop === Symbol.toPrimitive || prop === Symbol.toStringTag) {
          return undefined;
        }
        throw new Error(
          "DATABASE_URL is not set. Cannot use database client."
        );
      },
    });
  }
  const sql = neon(databaseUrl);
  return drizzle({ client: sql, schema });
}

export const db = createDb();
