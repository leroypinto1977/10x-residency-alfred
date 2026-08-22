import { prisma } from "@/lib/prisma";

/**
 * Fixed-window rate limiting backed by Postgres.
 *
 * Vercel's WAF `rate_limit` action is Pro-only, so this endpoint has to
 * throttle itself. Serverless instances don't share memory, so the counter
 * lives in the database rather than in-process.
 */

const WINDOW_MS = 60_000;

/** Fraction of calls that also sweep expired windows, keeping the table small. */
const SWEEP_PROBABILITY = 0.05;

/** Windows older than this can't affect any decision and are safe to drop. */
const SWEEP_AGE_MS = 10 * 60_000;

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the current window rolls over — for the Retry-After header. */
  retryAfter: number;
}

/**
 * Vercel overwrites `x-forwarded-for` at the edge and does not forward
 * client-supplied values, so it can't be spoofed here. Locally the header is
 * absent and every caller collapses onto one bucket, which is fine for dev.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function checkRateLimit(
  key: string,
  limit: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / WINDOW_MS) * WINDOW_MS);
  const retryAfter = Math.ceil((windowStart.getTime() + WINDOW_MS - now) / 1000);

  try {
    // Postgres resolves this to INSERT ... ON CONFLICT DO UPDATE, so the
    // increment is atomic and concurrent requests can't both read a stale count.
    const row = await prisma.rateLimit.upsert({
      where: { key_windowStart: { key, windowStart } },
      create: { key, windowStart, count: 1 },
      update: { count: { increment: 1 } },
    });

    if (Math.random() < SWEEP_PROBABILITY) {
      await prisma.rateLimit
        .deleteMany({ where: { windowStart: { lt: new Date(now - SWEEP_AGE_MS) } } })
        .catch(() => {});
    }

    return { allowed: row.count <= limit, retryAfter };
  } catch (error) {
    // Fail open. If the database is unreachable the form is already in trouble,
    // and silently dropping a real applicant's submission is worse than letting
    // an unthrottled request through.
    console.error("rate limit check failed, allowing request", error);
    return { allowed: true, retryAfter };
  }
}
