import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { checkRateLimit, getRateLimitStats, getDailyLimit } from '../src/rate-limit.js';
import { getDb, closeDb } from '../src/db.js';

// Use in-memory DB for tests
process.env.DB_PATH = ':memory:';

describe('Rate Limiter', () => {
  beforeEach(() => {
    closeDb();
  });

  afterEach(() => {
    closeDb();
  });

  it('returns tier daily limits', () => {
    expect(getDailyLimit('anonymous')).toBe(10);
    expect(getDailyLimit('free')).toBe(100);
    expect(getDailyLimit('starter')).toBe(2500);
    expect(getDailyLimit('pro')).toBe(10000);
  });

  it('allows requests under limit', () => {
    const result = checkRateLimit({ ip: '1.2.3.4', tier: 'anonymous' });
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(10);
  });

  it('blocks requests over limit', () => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // Insert 10 requests (anonymous limit)
    db.prepare(
      'INSERT INTO daily_stats (date, api_key, ip, request_count) VALUES (?, ?, ?, ?)'
    ).run(today, '', '1.2.3.4', 10);

    const result = checkRateLimit({ ip: '1.2.3.4', tier: 'anonymous' });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('respects tier limits', () => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // Insert 50 requests
    db.prepare(
      'INSERT INTO daily_stats (date, api_key, ip, request_count) VALUES (?, ?, ?, ?)'
    ).run(today, 'sa_testkey', '1.2.3.4', 50);

    // Anonymous would be blocked, but free tier allows 100
    const result = checkRateLimit({ ip: '1.2.3.4', apiKey: 'sa_testkey', tier: 'free' });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(50);
  });

  it('returns stats', () => {
    const stats = getRateLimitStats();
    expect(stats.totalIPs).toBe(0);
    expect(stats.totalRequests).toBe(0);
  });
});
