import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { triggerSync } from "@/lib/plaid-sync";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const connection = await db.query.plaidConnections.findFirst({
      where: eq(schema.plaidConnections.id, connectionId),
    });

    if (!connection || connection.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    const result = await triggerSync(connectionId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error syncing transactions:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to sync transactions" },
      { status: 500 }
    );
  }
}
