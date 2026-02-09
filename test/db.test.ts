import { describe, it, expect, beforeEach } from 'vitest';
import { getClient, initDb, logRequest, getStats, resetClient } from '../src/db.js';

// Use in-memory DB for tests
process.env.TURSO_DATABASE_URL = ':memory:';

describe('Database', () => {
  beforeEach(async () => {
    resetClient();
    await initDb();
  });

  it('creates schema on init', async () => {
    const db = getClient();
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = result.rows.map(r => r.name as string);
    expect(tableNames).toContain('api_keys');
    expect(tableNames).toContain('requests');
    expect(tableNames).toContain('daily_stats');
  });

  it('logs requests', async () => {
    await logRequest({
      ip: '1.2.3.4',
      url: 'https://example.com',
      format: 'png',
      durationMs: 500,
      status: 'success',
    });

    const db = getClient();
    const result = await db.execute('SELECT * FROM requests');
    const row = result.rows[0];
    expect(row.ip).toBe('1.2.3.4');
    expect(row.url).toBe('https://example.com');
    expect(Number(row.duration_ms)).toBe(500);
  });

  it('updates daily stats on log', async () => {
    await logRequest({
      ip: '1.2.3.4',
      url: 'https://example.com',
      format: 'png',
      durationMs: 500,
      status: 'success',
    });
    await logRequest({
      ip: '1.2.3.4',
      url: 'https://example.com',
      format: 'png',
      durationMs: 300,
      status: 'success',
    });

    const stats = await getStats();
    expect(stats.todayRequests).toBe(2);
    expect(stats.uniqueIPs).toBe(1);
  });

  it('returns correct stats', async () => {
    const stats = await getStats();
    expect(stats.totalRequests).toBe(0);
    expect(stats.todayRequests).toBe(0);
    expect(stats.uniqueIPs).toBe(0);
  });
});
