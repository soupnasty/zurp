import { plaidClient } from "@/lib/plaid";
import { decrypt } from "@/lib/encryption";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { processTransactionsForConnection } from "@/lib/engine/orchestrator";
import type { RemovedTransaction, Transaction } from "plaid";

export interface SyncResult {
  added: number;
  modified: number;
  removed: number;
}

/**
 * Shared sync logic used by the API route, webhook handler, and cron job.
 * Fetches new transactions from Plaid, upserts them, and runs the matcher.
 */
export async function triggerSync(connectionId: string): Promise<SyncResult> {
  const connection = await db.query.plaidConnections.findFirst({
    where: eq(schema.plaidConnections.id, connectionId),
  });

  if (!connection) {
    throw new Error(`Connection not found: ${connectionId}`);
  }

  if (connection.status === "disconnected") {
    throw new Error(`Connection is disconnected: ${connectionId}`);
  }

  const accessToken = decrypt(connection.plaidAccessToken);

  // Paginated sync
  let cursor = connection.lastSyncCursor || undefined;
  let hasMore = true;
  let added: Transaction[] = [];
  let modified: Transaction[] = [];
  let removed: RemovedTransaction[] = [];

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor,
    });

    added = added.concat(response.data.added);
    modified = modified.concat(response.data.modified);
    removed = removed.concat(response.data.removed);
    hasMore = response.data.has_more;
    cursor = response.data.next_cursor;
  }

  // Upsert added transactions (batch insert)
  if (added.length > 0) {
    await db
      .insert(schema.transactions)
      .values(
        added.map((tx) => ({
          id: tx.transaction_id,
          plaidConnectionId: connection.id,
          userId: connection.userId,
          date: new Date(tx.date),
          merchantName: tx.merchant_name || tx.name,
          merchantNameRaw: tx.name,
          amount: tx.amount,
          plaidCategoryPrimary:
            tx.personal_finance_category?.primary || null,
          plaidCategoryDetailed:
            tx.personal_finance_category?.detailed || null,
          pending: tx.pending,
          matchedStatus: "unmatched",
        }))
      )
      .onConflictDoNothing();
  }

  // Update modified transactions (parallel — each row has different values)
  if (modified.length > 0) {
    await Promise.all(
      modified.map((tx) =>
        db
          .update(schema.transactions)
          .set({
            date: new Date(tx.date),
            merchantName: tx.merchant_name || tx.name,
            merchantNameRaw: tx.name,
            amount: tx.amount,
            plaidCategoryPrimary:
              tx.personal_finance_category?.primary || null,
            plaidCategoryDetailed:
              tx.personal_finance_category?.detailed || null,
            pending: tx.pending,
          })
          .where(eq(schema.transactions.id, tx.transaction_id))
      )
    );
  }

  // Remove deleted transactions (batch delete)
  const removedIds = removed
    .map((tx) => tx.transaction_id)
    .filter((id): id is string => !!id);
  if (removedIds.length > 0) {
    await db
      .delete(schema.transactions)
      .where(inArray(schema.transactions.id, removedIds));
  }

  // Update sync cursor and timestamp
  await db
    .update(schema.plaidConnections)
    .set({
      lastSyncCursor: cursor,
      lastSyncedAt: new Date(),
    })
    .where(eq(schema.plaidConnections.id, connection.id));

  // Run matching engine
  await processTransactionsForConnection(connection.id);

  return {
    added: added.length,
    modified: modified.length,
    removed: removed.length,
  };
}
