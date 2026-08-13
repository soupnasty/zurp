import { createHash } from "crypto";
import { importJWK, jwtVerify, decodeProtectedHeader } from "jose";
import { plaidClient } from "./plaid";

/**
 * Plaid webhook verification.
 *
 * Plaid signs every webhook with an ES256 JWT delivered in the
 * `Plaid-Verification` header. The JWT's `request_body_sha256` claim is the
 * SHA-256 of the exact raw request body. Verification steps (per Plaid docs):
 *
 * 1. Decode the JWT header; require `alg: ES256` and a `kid`.
 * 2. Fetch the public key for that `kid` via /webhook_verification_key/get.
 * 3. Verify the JWT signature and that `iat` is fresh (≤ 5 minutes old).
 * 4. Compare `request_body_sha256` against the hash of the raw body.
 */

interface CachedKey {
  jwk: Record<string, unknown>;
  fetchedAt: number;
}

const KEY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // refetch daily
const MAX_TOKEN_AGE_SECONDS = 5 * 60;

const keyCache = new Map<string, CachedKey>();

async function getVerificationKey(
  keyId: string
): Promise<Record<string, unknown> | null> {
  const cached = keyCache.get(keyId);
  if (cached && Date.now() - cached.fetchedAt < KEY_CACHE_TTL_MS) {
    return cached.jwk;
  }

  const response = await plaidClient.webhookVerificationKeyGet({
    key_id: keyId,
  });
  const key = response.data.key;
  if (!key) return null;

  // Expired keys are still returned by Plaid but must not verify new webhooks.
  if (key.expired_at != null) {
    keyCache.delete(keyId);
    return null;
  }

  const jwk = key as unknown as Record<string, unknown>;
  keyCache.set(keyId, { jwk, fetchedAt: Date.now() });
  return jwk;
}

/**
 * Verify a Plaid webhook. Returns true iff the JWT in the Plaid-Verification
 * header is valid, fresh, and matches the raw request body.
 */
export async function verifyPlaidWebhook(
  token: string,
  rawBody: string
): Promise<boolean> {
  try {
    const header = decodeProtectedHeader(token);
    if (header.alg !== "ES256" || typeof header.kid !== "string") {
      console.warn(
        `[webhook-verify] unexpected header alg=${String(header.alg)} kidType=${typeof header.kid}`
      );
      return false;
    }

    let jwk: Record<string, unknown> | null;
    try {
      jwk = await getVerificationKey(header.kid);
    } catch (e) {
      console.warn(
        "[webhook-verify] key fetch failed:",
        e instanceof Error ? e.message : e
      );
      return false;
    }
    if (!jwk) {
      console.warn(`[webhook-verify] no usable key for kid=${header.kid} (expired?)`);
      return false;
    }

    let payload: Awaited<ReturnType<typeof jwtVerify>>["payload"];
    try {
      const publicKey = await importJWK(jwk, "ES256");
      ({ payload } = await jwtVerify(token, publicKey, {
        algorithms: ["ES256"],
        maxTokenAge: MAX_TOKEN_AGE_SECONDS,
      }));
    } catch (e) {
      console.warn(
        "[webhook-verify] jwt verify failed:",
        e instanceof Error ? `${e.name}: ${e.message}` : e
      );
      return false;
    }

    const claimedHash = payload.request_body_sha256;
    if (typeof claimedHash !== "string") {
      console.warn("[webhook-verify] missing request_body_sha256 claim");
      return false;
    }

    const bodyHash = createHash("sha256").update(rawBody, "utf8").digest("hex");
    const ok = timingSafeEqualHex(bodyHash, claimedHash);
    if (!ok) {
      console.warn(
        `[webhook-verify] body hash mismatch bodyLen=${rawBody.length}`
      );
    }
    return ok;
  } catch (e) {
    console.warn(
      "[webhook-verify] unexpected error:",
      e instanceof Error ? `${e.name}: ${e.message}` : e
    );
    return false;
  }
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
