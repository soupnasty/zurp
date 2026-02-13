import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

    // Verify ownership and update status
    const [updated] = await db
      .update(schema.plaidConnections)
      .set({ status: "active" })
      .where(
        and(
          eq(schema.plaidConnections.id, connectionId),
          eq(schema.plaidConnections.userId, session.user.id)
        )
      )
      .returning({ id: schema.plaidConnections.id });

    if (!updated) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error completing reauth:", error);
    return NextResponse.json(
      { error: "Failed to complete re-authentication" },
      { status: 500 }
    );
  }
}
