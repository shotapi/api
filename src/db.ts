import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;

export function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL || 'file:shotapi.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;
    client = createClient({ url, authToken });
  }
  return client;
}

export async function initDb(): Promise<void> {
  const db = getClient();
  await db.batch([
    `CREATE TABLE IF NOT EXISTS api_keys (
      key TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'free',
      dodo_customer_id TEXT,
      dodo_subscription_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key TEXT,
      ip TEXT NOT NULL,
      url TEXT NOT NULL,
      format TEXT NOT NULL DEFAULT 'png',
      duration_ms INTEGER,
      status TEXT NOT NULL DEFAULT 'success',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT NOT NULL,
      api_key TEXT,
      ip TEXT,
      request_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (date, api_key, ip)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_requests_api_key ON requests(api_key)`,
    `CREATE INDEX IF NOT EXISTS idx_requests_ip ON requests(ip)`,
    `CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date)`,
  ], 'write');
}

export async function logRequest(params: {
  apiKey?: string;
  ip: string;
  url: string;
  format: string;
  durationMs: number;
  status: string;
}): Promise<void> {
  const db = getClient();
  const today = new Date().toISOString().split('T')[0];

  await db.batch([
    {
      sql: 'INSERT INTO requests (api_key, ip, url, format, duration_ms, status) VALUES (?, ?, ?, ?, ?, ?)',
      args: [params.apiKey || null, params.ip, params.url, params.format, params.durationMs, params.status],
    },
    {
      sql: `INSERT INTO daily_stats (date, api_key, ip, request_count)
        VALUES (?, ?, ?, 1)
        ON CONFLICT(date, api_key, ip) DO UPDATE SET request_count = request_count + 1`,
      args: [today, params.apiKey || '', params.ip],
    },
  ], 'write');
}

export async function getStats(): Promise<{ totalRequests: number; todayRequests: number; uniqueIPs: number }> {
  const db = getClient();
  const today = new Date().toISOString().split('T')[0];

  const results = await db.batch([
    'SELECT COUNT(*) as count FROM requests',
    { sql: 'SELECT SUM(request_count) as count FROM daily_stats WHERE date = ?', args: [today] },
    { sql: 'SELECT COUNT(DISTINCT ip) as count FROM daily_stats WHERE date = ?', args: [today] },
  ], 'read');

  return {
    totalRequests: Number(results[0].rows[0].count) || 0,
    todayRequests: Number(results[1].rows[0].count) || 0,
    uniqueIPs: Number(results[2].rows[0].count) || 0,
  };
}

export function resetClient(): void {
  if (client) {
    client.close();
    client = null;
  }
}
