import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { encrypt } from "@/lib/encryption";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { detectCardWithFallback } from "@/lib/cards/detect";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      publicToken,
      institutionName,
      accountId,
      accountName,
      accountOfficialName,
      accountMask,
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

    // Create plaid connection record (standalone, no userCardId)
    const [connection] = await db
      .insert(schema.plaidConnections)
      .values({
        userId: session.user.id,
        plaidItemId: item_id,
        plaidAccessToken: encryptedAccessToken,
        institutionName: institutionName || "Unknown",
        accountId: accountId || "",
        accountMask: accountMask || null,
        status: "active",
      })
      .returning();

    // Try to auto-detect card from account metadata (with issuer fallback)
    const detectedCard = detectCardWithFallback(
      accountName,
      accountOfficialName,
      institutionName
    );

    let cardProfileId: string | null = null;

    if (detectedCard) {
      const [cardProfile] = await db
        .insert(schema.cardProfiles)
        .values({
          userId: session.user.id,
          plaidConnectionId: connection.id,
          cardType: detectedCard.cardId,
          isActive: true,
          anniversarySource: "pending",
        })
        .returning();
      cardProfileId = cardProfile.id;
    }

    return NextResponse.json({
      connectionId: connection.id,
      itemId: item_id,
      cardProfileId,
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
