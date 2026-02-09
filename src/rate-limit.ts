import { getDb } from './db.js';

export type Tier = 'anonymous' | 'free' | 'starter' | 'pro';

const DAILY_LIMITS: Record<Tier, number> = {
  anonymous: 10,
  free: 100,
  starter: 2500,
  pro: 10000,
};

export function getDailyLimit(tier: Tier): number {
  return DAILY_LIMITS[tier];
}

export function checkRateLimit(identifier: { ip: string; apiKey?: string; tier: Tier }): {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
} {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const limit = DAILY_LIMITS[identifier.tier];

  // Get today's request count for this identifier
  const key = identifier.apiKey || '';
  const row = db.prepare(
    'SELECT request_count FROM daily_stats WHERE date = ? AND api_key = ? AND ip = ?'
  ).get(today, key, identifier.ip) as { request_count: number } | undefined;

  const used = row?.request_count || 0;
  const remaining = Math.max(0, limit - used);

  // Reset at midnight UTC
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  const resetAt = tomorrow.getTime();

  return {
    allowed: used < limit,
    remaining,
    limit,
    resetAt,
  };
}

export function getRateLimitStats(): { totalIPs: number; totalRequests: number } {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const stats = db.prepare(`
    SELECT COUNT(DISTINCT ip) as totalIPs, COALESCE(SUM(request_count), 0) as totalRequests
    FROM daily_stats WHERE date = ?
  `).get(today) as { totalIPs: number; totalRequests: number };

  return stats;
}
