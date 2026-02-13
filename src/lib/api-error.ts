import { NextResponse } from "next/server";

/**
 * Create a safe error response that never exposes internal error details to the client.
 * Logs the real error server-side for debugging.
 */
export function safeErrorResponse(
  error: unknown,
  fallbackMessage: string,
  status: number = 500
): NextResponse {
  // Log full error details server-side only
  console.error(`[API Error] ${fallbackMessage}:`, error);

  // Never expose error.message to the client — it may contain
  // DB column names, SQL errors, or internal implementation details
  return NextResponse.json({ error: fallbackMessage }, { status });
}
