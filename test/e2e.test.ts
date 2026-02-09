import { describe, it, expect, beforeEach } from 'vitest';
import { initDb, resetClient } from '../src/db.js';
import app from '../src/app.js';

// Use in-memory DB for tests
process.env.TURSO_DATABASE_URL = ':memory:';

// Ensure Stripe env vars are NOT set (test graceful degradation)
delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_STARTER_PRICE_ID;
delete process.env.STRIPE_PRO_PRICE_ID;

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

  // --- Flow 1: Signup → Get Key → Dashboard ---

  describe('signup flow', () => {
    it('GET /keys returns signup page with email form', async () => {
      const res = await req('/keys');
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('type="email"');
      expect(html).toContain('Get API Key');
    });

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

    it('full flow: signup → key → dashboard shows usage', async () => {
      // Step 1: Sign up
      const signupRes = await post('/keys', { email: 'user@test.com' });
      const { key } = await signupRes.json();

      // Step 2: View dashboard with key
      const dashRes = await req(`/dashboard?key=${key}`);
      expect(dashRes.status).toBe(200);
      const html = await dashRes.text();
      expect(html).toContain('Dashboard');
      expect(html).toContain('Free'); // tier
      expect(html).toContain('/ 100'); // daily limit
      expect(html).toContain(key.slice(0, 10)); // masked key
    });

    it('keys page shows upgrade link after key creation', async () => {
      const res = await req('/keys');
      const html = await res.text();
      expect(html).toContain('Upgrade plan');
      expect(html).toContain('upgrade-link');
    });
  });

  // --- Flow 2: Dashboard upgrade CTA ---

  describe('dashboard upgrade flow', () => {
    it('dashboard shows upgrade CTA for free tier', async () => {
      const signupRes = await post('/keys', { email: 'free@test.com' });
      const { key } = await signupRes.json();

      const dashRes = await req(`/dashboard?key=${key}`);
      const html = await dashRes.text();
      expect(html).toContain('Need more screenshots?');
    });

    it('dashboard shows "contact us" when Stripe is not configured', async () => {
      const signupRes = await post('/keys', { email: 'nostripe@test.com' });
      const { key } = await signupRes.json();

      const dashRes = await req(`/dashboard?key=${key}`);
      const html = await dashRes.text();

      // Should NOT show broken upgrade buttons
      expect(html).not.toContain('onclick="upgrade(');
      // Should show contact fallback
      expect(html).toContain('Contact us to upgrade');
      expect(html).toContain('mailto:');
    });

    it('dashboard with invalid key shows not-found page', async () => {
      const res = await req('/dashboard?key=sa_nonexistent');
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('API Key Not Found');
      expect(html).toContain('/keys'); // link to get a key
    });

    it('dashboard without key shows key input form', async () => {
      const res = await req('/dashboard');
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('API Key Required');
      expect(html).toContain('sa_...'); // placeholder
    });
  });

  // --- Flow 3: Billing error handling ---

  describe('billing error handling', () => {
    it('POST /billing/checkout without Stripe returns user-friendly error', async () => {
      const signupRes = await post('/keys', { email: 'billing@test.com' });
      const { key } = await signupRes.json();

      const res = await post('/billing/checkout', { api_key: key, plan: 'starter' });
      const data = await res.json();

      // Must NOT leak internal details
      expect(data.message).not.toContain('STRIPE_SECRET_KEY');
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
      // Should not reveal whether it's a Stripe issue or key issue
      // Just a generic user-friendly error
      expect(data.message).not.toContain('STRIPE');
    });
  });

  // --- Flow 4: Key usage endpoint ---

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

  // --- Flow 5: Pages load without errors ---

  describe('all pages return 200', () => {
    const pagePaths = [
      '/',
      '/docs',
      '/pricing',
      '/keys',
      '/vs/screenshotone',
      '/vs/puppeteer',
      '/blog/free-screenshot-api',
      '/blog/og-image-api',
      '/use-cases/website-thumbnails',
      '/guides/nodejs-screenshot',
    ];

    for (const path of pagePaths) {
      it(`GET ${path} returns 200 with HTML`, async () => {
        const res = await req(path);
        expect(res.status).toBe(200);
        const html = await res.text();
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('</html>');
      });
    }
  });

  // --- Flow 6: API endpoints ---

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

    it('GET /robots.txt returns valid robots', async () => {
      const res = await req('/robots.txt');
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('User-agent');
      expect(text).toContain('Sitemap');
    });

    it('GET /sitemap.xml returns valid XML', async () => {
      const res = await req('/sitemap.xml');
      expect(res.status).toBe(200);
      const xml = await res.text();
      expect(xml).toContain('<?xml');
      expect(xml).toContain('<urlset');
      expect(xml).toContain('shotapi.io');
    });
  });

  // --- Flow 7: No user-facing error leaks internal details ---

  describe('error messages are user-safe', () => {
    const FORBIDDEN_PATTERNS = [
      /process\.env/i,
      /STRIPE_\w+/,
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

    it('POST /billing/checkout without Stripe has safe error', async () => {
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
