import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { encrypt } from "@/lib/encryption";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { detectCard } from "@/lib/cards/detect";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      publicToken,
      userCardId,
      institutionName,
      accountId,
      accountName,
      accountOfficialName,
    } = await request.json();

    if (!publicToken) {
      return NextResponse.json(
        { error: "publicToken is required" },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token, item_id } = exchangeResponse.data;

    // Encrypt the access token before storing
    const encryptedAccessToken = encrypt(access_token);

    // Create plaid connection record (userCardId is optional now)
    const [connection] = await db
      .insert(schema.plaidConnections)
      .values({
        userId: session.user.id,
        userCardId: userCardId || null,
        plaidItemId: item_id,
        plaidAccessToken: encryptedAccessToken,
        institutionName: institutionName || "Unknown",
        accountId: accountId || "",
        status: "active",
      })
      .returning();

    // Try to auto-detect card from account metadata
    const detectedCard = detectCard(accountName, accountOfficialName);

    return NextResponse.json({
      connectionId: connection.id,
      itemId: item_id,
      detectedCard,
    });
  } catch (error: any) {
    console.error("Error exchanging token:", error?.response?.data || error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}
