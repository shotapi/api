import { describe, it, expect, beforeEach } from 'vitest';
import { initDb, resetClient } from '../src/db.js';
import app from '../src/app.js';

// Use in-memory DB for tests
process.env.TURSO_DATABASE_URL = ':memory:';

// Ensure Dodo env vars are NOT set (test graceful degradation)
delete process.env.DODO_PAYMENTS_API_KEY;
delete process.env.DODO_STARTER_PRODUCT_ID;
delete process.env.DODO_PRO_PRODUCT_ID;

function req(path: string, init?: RequestInit) {
  return app.request(path, init);
}

function post(path: string, body: Record<string, unknown>) {
  return req(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('E2E: User Flows', () => {
  beforeEach(async () => {
    resetClient();
    await initDb();
  });

  // --- Flow 1: Signup via API ---

  describe('signup flow', () => {
    it('POST /keys with email returns API key', async () => {
      const res = await post('/keys', { email: 'test@example.com' });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.key).toMatch(/^sa_[0-9a-f]{32}$/);
      expect(data.email).toBe('test@example.com');
      expect(data.tier).toBe('free');
      expect(data.dailyLimit).toBe(100);
    });

    it('POST /keys with invalid email returns user-friendly error', async () => {
      const res = await post('/keys', { email: 'notanemail' });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).not.toContain('process.env');
      expect(data.message).not.toContain('undefined');
    });

    it('POST /keys with missing email returns user-friendly error', async () => {
      const res = await post('/keys', {});
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBeTruthy();
    });
  });

  // --- Flow 2: Billing error handling ---

  describe('billing error handling', () => {
    it('POST /billing/checkout without Dodo returns user-friendly error', async () => {
      const signupRes = await post('/keys', { email: 'billing@test.com' });
      const { key } = await signupRes.json();

      const res = await post('/billing/checkout', { api_key: key, plan: 'starter' });
      const data = await res.json();

      // Must NOT leak internal details
      expect(data.message).not.toContain('DODO_PAYMENTS_API_KEY');
      expect(data.message).not.toContain('process.env');
      expect(data.message).not.toContain('not configured');
      expect(data.message).not.toContain('Unknown plan');
      // Must be user-friendly
      expect(data.message).toContain('hello@shotapi.io');
    });

    it('POST /billing/checkout with missing fields returns 400', async () => {
      const res = await post('/billing/checkout', {});
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toBeTruthy();
    });

    it('POST /billing/checkout with invalid API key returns error', async () => {
      const res = await post('/billing/checkout', { api_key: 'sa_fake', plan: 'starter' });
      const data = await res.json();
      // Should not reveal whether it's a Dodo issue or key issue
      // Just a generic user-friendly error
      expect(data.message).not.toContain('DODO');
    });
  });

  // --- Flow 3: Key usage endpoint ---

  describe('key usage flow', () => {
    it('GET /keys/:key/usage returns usage for valid key', async () => {
      const signupRes = await post('/keys', { email: 'usage@test.com' });
      const { key } = await signupRes.json();

      const res = await req(`/keys/${key}/usage`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.key).toBe(key);
      expect(data.tier).toBe('free');
      expect(data.usage.dailyLimit).toBe(100);
      expect(data.usage.today).toBe(0);
      expect(data.usage.remaining).toBe(100);
    });

    it('GET /keys/:key/usage returns 404 for invalid key', async () => {
      const res = await req('/keys/sa_nonexistent/usage');
      expect(res.status).toBe(404);
    });
  });

  // --- Flow 4: API endpoints ---

  describe('API endpoints', () => {
    it('GET /health returns ok', async () => {
      const res = await req('/health');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
    });

    it('GET /api returns API info', async () => {
      const res = await req('/api');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe('ShotAPI');
      expect(data.endpoints).toBeDefined();
    });

    it('GET /stats returns stats', async () => {
      const res = await req('/stats');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('totalRequests');
    });
  });

  // --- Flow 5: No user-facing error leaks internal details ---

  describe('error messages are user-safe', () => {
    const FORBIDDEN_PATTERNS = [
      /process\.env/i,
      /DODO_\w+/,
      /not configured/i,
      /TURSO_\w+/,
      /stack trace/i,
      /at \w+\.\w+ \(/,  // stack trace lines like "at Object.foo ("
    ];

    it('POST /keys with bad data has safe error', async () => {
      const res = await post('/keys', { email: '' });
      const data = await res.json();
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(data.message).not.toMatch(pattern);
      }
    });

    it('POST /billing/checkout without Dodo has safe error', async () => {
      const signupRes = await post('/keys', { email: 'safe@test.com' });
      const { key } = await signupRes.json();
      const res = await post('/billing/checkout', { api_key: key, plan: 'pro' });
      const data = await res.json();
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(data.message).not.toMatch(pattern);
      }
    });
  });
});
