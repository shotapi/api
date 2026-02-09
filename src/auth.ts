import { randomBytes } from 'crypto';
import { getDb } from './db.js';

export interface ApiKeyInfo {
  key: string;
  email: string;
  tier: 'free' | 'starter' | 'pro';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export function generateApiKey(): string {
  return `sa_${randomBytes(16).toString('hex')}`;
}

export function registerApiKey(email: string): ApiKeyInfo {
  const db = getDb();
  const key = generateApiKey();

  db.prepare(
    'INSERT INTO api_keys (key, email, tier) VALUES (?, ?, ?)'
  ).run(key, email, 'free');

  return {
    key,
    email,
    tier: 'free',
    createdAt: new Date().toISOString(),
  };
}

export function validateApiKey(key: string): ApiKeyInfo | null {
  const db = getDb();

  const row = db.prepare('SELECT * FROM api_keys WHERE key = ?').get(key) as any;
  if (!row) return null;

  // Update last_used_at
  db.prepare('UPDATE api_keys SET last_used_at = datetime(\'now\') WHERE key = ?').run(key);

  return {
    key: row.key,
    email: row.email,
    tier: row.tier,
    stripeCustomerId: row.stripe_customer_id || undefined,
    stripeSubscriptionId: row.stripe_subscription_id || undefined,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at || undefined,
  };
}

// Extract API key from request (query param, header, or bearer token)
// Supports: ?access_key=sa_xxx (ScreenshotOne compat), ?api_key=sa_xxx, Authorization: Bearer sa_xxx, X-Api-Key: sa_xxx
export function extractApiKey(query: Record<string, string>, headers: { get: (name: string) => string | null | undefined }): string | undefined {
  // Query params (ScreenshotOne uses access_key)
  if (query.access_key) return query.access_key;
  if (query.api_key) return query.api_key;

  // Authorization header
  const auth = headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);

  // X-Api-Key header
  const apiKeyHeader = headers.get('x-api-key');
  if (apiKeyHeader) return apiKeyHeader;

  return undefined;
}

export function getKeyUsage(key: string): { today: number; total: number; tier: string; dailyLimit: number } | null {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const keyInfo = db.prepare('SELECT tier FROM api_keys WHERE key = ?').get(key) as { tier: string } | undefined;
  if (!keyInfo) return null;

  const DAILY_LIMITS: Record<string, number> = {
    free: 100,
    starter: 2500,
    pro: 10000,
  };

  const todayStats = db.prepare(
    'SELECT COALESCE(SUM(request_count), 0) as count FROM daily_stats WHERE date = ? AND api_key = ?'
  ).get(today, key) as { count: number };

  const totalStats = db.prepare(
    'SELECT COUNT(*) as count FROM requests WHERE api_key = ?'
  ).get(key) as { count: number };

  return {
    today: todayStats.count,
    total: totalStats.count,
    tier: keyInfo.tier,
    dailyLimit: DAILY_LIMITS[keyInfo.tier] || 100,
  };
}
