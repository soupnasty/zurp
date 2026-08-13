import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dismissAlert } from "@/lib/alerts/queries";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let alertId: unknown;
  try {
    ({ alertId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof alertId !== "string" || alertId.length === 0) {
    return NextResponse.json({ error: "alertId required" }, { status: 400 });
  }

  await dismissAlert(session.user.id, alertId);
  return NextResponse.json({ dismissed: true });
}
