import { randomBytes } from 'crypto';
import { getClient } from './db.js';

export interface ApiKeyInfo {
  key: string;
  email: string;
  tier: 'free' | 'starter' | 'pro';
  dodoCustomerId?: string;
  dodoSubscriptionId?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export function generateApiKey(): string {
  return `sa_${randomBytes(16).toString('hex')}`;
}

export async function registerApiKey(email: string): Promise<ApiKeyInfo> {
  const db = getClient();
  const key = generateApiKey();

  await db.execute({
    sql: 'INSERT INTO api_keys (key, email, tier) VALUES (?, ?, ?)',
    args: [key, email, 'free'],
  });

  return {
    key,
    email,
    tier: 'free',
    createdAt: new Date().toISOString(),
  };
}

export async function validateApiKey(key: string): Promise<ApiKeyInfo | null> {
  const db = getClient();

  const result = await db.execute({ sql: 'SELECT * FROM api_keys WHERE key = ?', args: [key] });
  const row = result.rows[0];
  if (!row) return null;

  // Update last_used_at
  await db.execute({ sql: "UPDATE api_keys SET last_used_at = datetime('now') WHERE key = ?", args: [key] });

  return {
    key: row.key as string,
    email: row.email as string,
    tier: row.tier as 'free' | 'starter' | 'pro',
    dodoCustomerId: (row.dodo_customer_id as string) || undefined,
    dodoSubscriptionId: (row.dodo_subscription_id as string) || undefined,
    createdAt: row.created_at as string,
    lastUsedAt: (row.last_used_at as string) || undefined,
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

export async function getKeyUsage(key: string): Promise<{ today: number; total: number; tier: string; dailyLimit: number } | null> {
  const db = getClient();
  const today = new Date().toISOString().split('T')[0];

  const keyResult = await db.execute({ sql: 'SELECT tier FROM api_keys WHERE key = ?', args: [key] });
  if (keyResult.rows.length === 0) return null;
  const tier = keyResult.rows[0].tier as string;

  const DAILY_LIMITS: Record<string, number> = {
    free: 100,
    starter: 2500,
    pro: 10000,
  };

  const results = await db.batch([
    { sql: 'SELECT COALESCE(SUM(request_count), 0) as count FROM daily_stats WHERE date = ? AND api_key = ?', args: [today, key] },
    { sql: 'SELECT COUNT(*) as count FROM requests WHERE api_key = ?', args: [key] },
  ], 'read');

  return {
    today: Number(results[0].rows[0].count) || 0,
    total: Number(results[1].rows[0].count) || 0,
    tier,
    dailyLimit: DAILY_LIMITS[tier] || 100,
  };
}
