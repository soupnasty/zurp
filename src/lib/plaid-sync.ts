import { plaidClient } from "@/lib/plaid";
import { decrypt } from "@/lib/encryption";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, or, lt, isNull, inArray } from "drizzle-orm";
import { processTransactionsForConnection } from "@/lib/engine/orchestrator";
import type { RemovedTransaction, Transaction } from "plaid";

export interface SyncResult {
  added: number;
  modified: number;
  removed: number;
}

const SYNC_LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Shared sync logic used by the API route, webhook handler, and cron job.
 * Fetches new transactions from Plaid, upserts them, and runs the matcher.
 *
 * Uses a DB-level sync lock (syncLockedUntil) to prevent concurrent syncs
 * for the same connection. The lock has a 5-minute TTL to prevent deadlocks.
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

  // Acquire sync lock (atomic UPDATE with WHERE to prevent races)
  const lockExpiry = new Date(Date.now() + SYNC_LOCK_TTL_MS);
  const lockResult = await db
    .update(schema.plaidConnections)
    .set({ syncLockedUntil: lockExpiry })
    .where(
      and(
        eq(schema.plaidConnections.id, connectionId),
        or(
          isNull(schema.plaidConnections.syncLockedUntil),
          lt(schema.plaidConnections.syncLockedUntil, new Date())
        )
      )
    );

  // If no rows were updated, another sync is in progress
  if (lockResult.rowCount === 0) {
    console.log(`Sync already in progress for connection ${connectionId}, skipping`);
    return { added: 0, modified: 0, removed: 0 };
  }

  const accessToken = decrypt(connection.plaidAccessToken);

  try {
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
            datetime: tx.authorized_datetime
              ? new Date(tx.authorized_datetime)
              : tx.datetime
                ? new Date(tx.datetime)
                : null,
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
              datetime: tx.authorized_datetime
                ? new Date(tx.authorized_datetime)
                : tx.datetime
                  ? new Date(tx.datetime)
                  : null,
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
  } finally {
    // Release sync lock (clear the timestamp)
    await db
      .update(schema.plaidConnections)
      .set({ syncLockedUntil: null })
      .where(eq(schema.plaidConnections.id, connectionId));
  }
}
