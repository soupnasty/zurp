import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { CountryCode, Products } from "plaid";
import { auth } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAppUrl } from "@/lib/url";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { connectionId } = body as { connectionId?: string };

    const appUrl = getAppUrl();
    const webhook = `${appUrl}/api/plaid/webhook`;
    const redirectUri = `${appUrl}/oauth-callback`;

    if (connectionId) {
      // Update mode: re-authenticate an existing connection
      const connection = await db.query.plaidConnections.findFirst({
        where: and(
          eq(schema.plaidConnections.id, connectionId),
          eq(schema.plaidConnections.userId, session.user.id)
        ),
      });

      if (!connection) {
        return NextResponse.json(
          { error: "Connection not found" },
          { status: 404 }
        );
      }

      const accessToken = decrypt(connection.plaidAccessToken);

      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: session.user.id },
        client_name: "zurp",
        access_token: accessToken,
        country_codes: [CountryCode.Us],
        language: "en",
        webhook,
        redirect_uri: redirectUri,
      });

      return NextResponse.json({ linkToken: response.data.link_token });
    }

    // Normal mode: new connection
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: session.user.id },
      client_name: "zurp",
      products: [Products.Transactions],
      transactions: { days_requested: 365 },
      country_codes: [CountryCode.Us],
      language: "en",
      webhook,
      redirect_uri: redirectUri,
    });

    return NextResponse.json({ linkToken: response.data.link_token });
  } catch (error: any) {
    const plaidError = error?.response?.data;
    const detail = plaidError
      ? `${plaidError.error_type}: ${plaidError.error_code} — ${plaidError.error_message}`
      : error?.message || "Unknown error";
    console.error("Error creating link token:", detail, plaidError || error);
    return NextResponse.json(
      { error: "Failed to create link token", detail },
      { status: 500 }
    );
  }
}
