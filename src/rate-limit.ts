// Simple in-memory rate limiter
// Resets daily, 100 requests per IP

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateLimitEntry>();

const DAILY_LIMIT = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = limits.get(ip);

  // Clean up expired entries periodically (every 1000 checks)
  if (Math.random() < 0.001) {
    cleanupExpired(now);
  }

  if (!entry || now >= entry.resetAt) {
    // New or expired entry
    const resetAt = now + DAY_MS;
    limits.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: DAILY_LIMIT - 1, resetAt };
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: DAILY_LIMIT - entry.count, resetAt: entry.resetAt };
}

function cleanupExpired(now: number): void {
  for (const [ip, entry] of limits.entries()) {
    if (now >= entry.resetAt) {
      limits.delete(ip);
    }
  }
}

export function getRateLimitStats(): { totalIPs: number; totalRequests: number } {
  let totalRequests = 0;
  for (const entry of limits.values()) {
    totalRequests += entry.count;
  }
  return { totalIPs: limits.size, totalRequests };
}
