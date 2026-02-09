import { getClient } from './db.js';

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

export async function checkRateLimit(identifier: { ip: string; apiKey?: string; tier: Tier }): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}> {
  const db = getClient();
  const today = new Date().toISOString().split('T')[0];
  const limit = DAILY_LIMITS[identifier.tier];

  const key = identifier.apiKey || '';
  const result = await db.execute({
    sql: 'SELECT request_count FROM daily_stats WHERE date = ? AND api_key = ? AND ip = ?',
    args: [today, key, identifier.ip],
  });

  const used = result.rows.length > 0 ? Number(result.rows[0].request_count) : 0;
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

export async function getRateLimitStats(): Promise<{ totalIPs: number; totalRequests: number }> {
  const db = getClient();
  const today = new Date().toISOString().split('T')[0];

  const result = await db.execute({
    sql: `SELECT COUNT(DISTINCT ip) as totalIPs, COALESCE(SUM(request_count), 0) as totalRequests
      FROM daily_stats WHERE date = ?`,
    args: [today],
  });

  return {
    totalIPs: Number(result.rows[0].totalIPs) || 0,
    totalRequests: Number(result.rows[0].totalRequests) || 0,
  };
}
