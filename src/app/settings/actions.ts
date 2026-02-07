"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { decrypt } from "@/lib/encryption";
import { plaidClient } from "@/lib/plaid";
import { revalidatePath } from "next/cache";

export async function unlinkConnection(connectionId: string) {
  const user = await requireAuth();

  const connection = await db.query.plaidConnections.findFirst({
    where: eq(schema.plaidConnections.id, connectionId),
  });

  if (!connection || connection.userId !== user.id!) {
    throw new Error("Unauthorized");
  }

  // Revoke access token on Plaid's side
  const accessToken = decrypt(connection.plaidAccessToken);
  await plaidClient.itemRemove({ access_token: accessToken });

  // Delete the connection row (cascades to transactions)
  await db
    .delete(schema.plaidConnections)
    .where(eq(schema.plaidConnections.id, connectionId));

  revalidatePath("/settings");
}
