import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBenefitUsageSummaries } from "@/lib/queries";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usage = await getBenefitUsageSummaries(session.user.id);

    return NextResponse.json({ usage });
  } catch (error: any) {
    console.error("Error fetching benefit usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch benefit usage" },
      { status: 500 }
    );
  }
}
