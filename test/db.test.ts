import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { getDb, logRequest, getStats, closeDb } from '../src/db.js';

// Use in-memory DB for tests
process.env.DB_PATH = ':memory:';

describe('Database', () => {
  beforeEach(() => {
    closeDb();
  });

  afterEach(() => {
    closeDb();
  });

  it('creates schema on first access', () => {
    const db = getDb();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);
    expect(tableNames).toContain('api_keys');
    expect(tableNames).toContain('requests');
    expect(tableNames).toContain('daily_stats');
  });

  it('logs requests', () => {
    logRequest({
      ip: '1.2.3.4',
      url: 'https://example.com',
      format: 'png',
      durationMs: 500,
      status: 'success',
    });

    const db = getDb();
    const row = db.prepare('SELECT * FROM requests').get() as any;
    expect(row.ip).toBe('1.2.3.4');
    expect(row.url).toBe('https://example.com');
    expect(row.duration_ms).toBe(500);
  });

  it('updates daily stats on log', () => {
    logRequest({
      ip: '1.2.3.4',
      url: 'https://example.com',
      format: 'png',
      durationMs: 500,
      status: 'success',
    });
    logRequest({
      ip: '1.2.3.4',
      url: 'https://example.com',
      format: 'png',
      durationMs: 300,
      status: 'success',
    });

    const stats = getStats();
    expect(stats.todayRequests).toBe(2);
    expect(stats.uniqueIPs).toBe(1);
  });

  it('returns correct stats', () => {
    const stats = getStats();
    expect(stats.totalRequests).toBe(0);
    expect(stats.todayRequests).toBe(0);
    expect(stats.uniqueIPs).toBe(0);
  });
});
