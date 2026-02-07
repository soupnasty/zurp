import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecentTransactions } from "@/lib/queries";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);
    const connectionId = searchParams.get("connectionId") || undefined;

    const transactions = await getRecentTransactions(
      session.user.id,
      limit,
      connectionId,
      offset
    );

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
