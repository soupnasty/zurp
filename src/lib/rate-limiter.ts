/**
 * Simple in-memory sliding-window rate limiter.
 *
 * For single-process deployments (Vercel serverless). For multi-instance
 * deployments, replace with Redis-backed implementation.
 */

interface RateRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateRecord>();

// Periodic cleanup to prevent memory leaks (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStale() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

/**
 * Create a rate limiter for a specific endpoint.
 *
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests allowed in the window
 * @returns A function that checks if a request should be allowed.
 *          Returns `{ allowed: true }` or `{ allowed: false, retryAfterMs }`.
 */
export function createRateLimiter(windowMs: number, maxRequests: number) {
  return (key: string): { allowed: boolean; retryAfterMs?: number } => {
    cleanupStale();

    const now = Date.now();
    const record = store.get(key);

    // First request or window expired — reset
    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true };
    }

    // Within window and under limit
    if (record.count < maxRequests) {
      record.count++;
      return { allowed: true };
    }

    // Rate limited
    return {
      allowed: false,
      retryAfterMs: record.resetTime - now,
    };
  };
}
