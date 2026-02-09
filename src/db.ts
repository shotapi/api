import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

function getDbPath(): string {
  return process.env.DB_PATH || path.join(process.cwd(), 'shotapi.db');
}

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(getDbPath());
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      key TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key TEXT,
      ip TEXT NOT NULL,
      url TEXT NOT NULL,
      format TEXT NOT NULL DEFAULT 'png',
      duration_ms INTEGER,
      status TEXT NOT NULL DEFAULT 'success',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT NOT NULL,
      api_key TEXT,
      ip TEXT,
      request_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (date, api_key, ip)
    );

    CREATE INDEX IF NOT EXISTS idx_requests_api_key ON requests(api_key);
    CREATE INDEX IF NOT EXISTS idx_requests_ip ON requests(ip);
    CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
    CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
  `);
}

export function logRequest(params: {
  apiKey?: string;
  ip: string;
  url: string;
  format: string;
  durationMs: number;
  status: string;
}): void {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  db.prepare(
    'INSERT INTO requests (api_key, ip, url, format, duration_ms, status) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(params.apiKey || null, params.ip, params.url, params.format, params.durationMs, params.status);

  // Upsert daily stats
  db.prepare(`
    INSERT INTO daily_stats (date, api_key, ip, request_count)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(date, api_key, ip) DO UPDATE SET request_count = request_count + 1
  `).run(today, params.apiKey || '', params.ip);
}

export function getStats(): { totalRequests: number; todayRequests: number; uniqueIPs: number } {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const total = db.prepare('SELECT COUNT(*) as count FROM requests').get() as { count: number };
  const todayStats = db.prepare('SELECT SUM(request_count) as count FROM daily_stats WHERE date = ?').get(today) as { count: number | null };
  const ips = db.prepare('SELECT COUNT(DISTINCT ip) as count FROM daily_stats WHERE date = ?').get(today) as { count: number };

  return {
    totalRequests: total.count,
    todayRequests: todayStats.count || 0,
    uniqueIPs: ips.count,
  };
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
