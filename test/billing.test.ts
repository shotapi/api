import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initDb, resetClient, getClient } from '../src/db.js';
import app from '../src/app.js';

// Use in-memory DB for tests
process.env.TURSO_DATABASE_URL = ':memory:';

// Set Dodo env vars for billing tests
process.env.DODO_PAYMENTS_API_KEY = 'test_key';
process.env.DODO_PAYMENTS_WEBHOOK_KEY = 'whsec_test_key';
process.env.DODO_PAYMENTS_ENVIRONMENT = 'test_mode';
process.env.DODO_STARTER_PRODUCT_ID = 'pdt_starter_test';
process.env.DODO_PRO_PRODUCT_ID = 'pdt_pro_test';

// Mock the dodopayments SDK to bypass signature verification
vi.mock('dodopayments', () => {
  return {
    default: class MockDodoPayments {
      webhooks = {
        unwrap: (body: string, _opts: unknown) => JSON.parse(body),
      };
      checkoutSessions = {
        create: async () => ({
          session_id: 'cs_test_123',
          checkout_url: 'https://checkout.dodopayments.com/test',
        }),
      };
    },
  };
});

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

function webhookPost(body: Record<string, unknown>) {
  return req('/billing/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'webhook-id': 'wh_test_123',
      'webhook-signature': 'v1,test_signature',
      'webhook-timestamp': Math.floor(Date.now() / 1000).toString(),
    },
    body: JSON.stringify(body),
  });
}

async function createTestKey(email = 'billing@test.com') {
  const res = await post('/keys', { email });
  return (await res.json()).key as string;
}

describe('Billing: Dodo Payments', () => {
  beforeEach(async () => {
    resetClient();
    await initDb();
  });

  describe('checkout', () => {
    it('POST /billing/checkout creates a checkout session', async () => {
      const apiKey = await createTestKey();
      const res = await post('/billing/checkout', { api_key: apiKey, plan: 'starter' });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.url).toContain('checkout.dodopayments.com');
    });

    it('POST /billing/checkout with missing fields returns 400', async () => {
      const res = await post('/billing/checkout', {});
      expect(res.status).toBe(400);
    });

    it('POST /billing/checkout with invalid API key returns 404', async () => {
      const res = await post('/billing/checkout', { api_key: 'sa_fake', plan: 'starter' });
      expect(res.status).toBe(404);
    });

    it('POST /billing/checkout with invalid plan returns user-friendly error', async () => {
      const apiKey = await createTestKey();
      const res = await post('/billing/checkout', { api_key: apiKey, plan: 'enterprise' });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('hello@shotapi.io');
    });
  });

  describe('webhook: subscription.active', () => {
    it('upgrades tier to starter when subscription activates with metadata', async () => {
      const apiKey = await createTestKey();

      const res = await webhookPost({
        type: 'subscription.active',
        business_id: 'biz_test',
        timestamp: new Date().toISOString(),
        data: {
          subscription_id: 'sub_test_123',
          product_id: 'pdt_starter_test',
          customer: {
            customer_id: 'cust_test_123',
            email: 'billing@test.com',
            name: 'Test User',
          },
          metadata: { api_key: apiKey },
          status: 'active',
          quantity: 1,
          recurring_pre_tax_amount: 900,
          currency: 'USD',
          payment_frequency_count: 1,
          payment_frequency_interval: 'Month',
          subscription_period_count: 0,
          subscription_period_interval: 'Month',
          created_at: new Date().toISOString(),
          next_billing_date: new Date().toISOString(),
          previous_billing_date: new Date().toISOString(),
          tax_inclusive: false,
          trial_period_days: 0,
          on_demand: false,
          cancel_at_next_billing_date: false,
          addons: [],
          meters: [],
          billing: { country: 'US' },
        },
      });

      expect(res.status).toBe(200);
      const responseData = await res.json();
      expect(responseData.received).toBe(true);

      // Verify the DB was updated
      const db = getClient();
      const result = await db.execute({
        sql: 'SELECT tier, dodo_customer_id, dodo_subscription_id FROM api_keys WHERE key = ?',
        args: [apiKey],
      });
      expect(result.rows[0].tier).toBe('starter');
      expect(result.rows[0].dodo_customer_id).toBe('cust_test_123');
      expect(result.rows[0].dodo_subscription_id).toBe('sub_test_123');
    });

    it('upgrades tier to pro', async () => {
      const apiKey = await createTestKey('pro@test.com');

      await webhookPost({
        type: 'subscription.active',
        business_id: 'biz_test',
        timestamp: new Date().toISOString(),
        data: {
          subscription_id: 'sub_pro_123',
          product_id: 'pdt_pro_test',
          customer: {
            customer_id: 'cust_pro_123',
            email: 'pro@test.com',
            name: 'Pro User',
          },
          metadata: { api_key: apiKey },
          status: 'active',
          quantity: 1,
          recurring_pre_tax_amount: 2900,
          currency: 'USD',
          payment_frequency_count: 1,
          payment_frequency_interval: 'Month',
          subscription_period_count: 0,
          subscription_period_interval: 'Month',
          created_at: new Date().toISOString(),
          next_billing_date: new Date().toISOString(),
          previous_billing_date: new Date().toISOString(),
          tax_inclusive: false,
          trial_period_days: 0,
          on_demand: false,
          cancel_at_next_billing_date: false,
          addons: [],
          meters: [],
          billing: { country: 'US' },
        },
      });

      const db = getClient();
      const result = await db.execute({
        sql: 'SELECT tier FROM api_keys WHERE key = ?',
        args: [apiKey],
      });
      expect(result.rows[0].tier).toBe('pro');
    });

    it('falls back to email lookup when metadata has no api_key', async () => {
      const apiKey = await createTestKey('fallback@test.com');

      const res = await webhookPost({
        type: 'subscription.active',
        business_id: 'biz_test',
        timestamp: new Date().toISOString(),
        data: {
          subscription_id: 'sub_fallback_123',
          product_id: 'pdt_starter_test',
          customer: {
            customer_id: 'cust_fallback_123',
            email: 'fallback@test.com',
            name: 'Fallback User',
          },
          metadata: {}, // No api_key in metadata!
          status: 'active',
          quantity: 1,
          recurring_pre_tax_amount: 900,
          currency: 'USD',
          payment_frequency_count: 1,
          payment_frequency_interval: 'Month',
          subscription_period_count: 0,
          subscription_period_interval: 'Month',
          created_at: new Date().toISOString(),
          next_billing_date: new Date().toISOString(),
          previous_billing_date: new Date().toISOString(),
          tax_inclusive: false,
          trial_period_days: 0,
          on_demand: false,
          cancel_at_next_billing_date: false,
          addons: [],
          meters: [],
          billing: { country: 'US' },
        },
      });

      expect(res.status).toBe(200);

      // Should have found the key by email and upgraded it
      const db = getClient();
      const result = await db.execute({
        sql: 'SELECT tier, dodo_customer_id, dodo_subscription_id FROM api_keys WHERE key = ?',
        args: [apiKey],
      });
      expect(result.rows[0].tier).toBe('starter');
      expect(result.rows[0].dodo_subscription_id).toBe('sub_fallback_123');
    });
  });

  describe('webhook: subscription.cancelled', () => {
    it('downgrades to free when subscription is cancelled', async () => {
      const apiKey = await createTestKey('cancel@test.com');

      // First activate
      await webhookPost({
        type: 'subscription.active',
        business_id: 'biz_test',
        timestamp: new Date().toISOString(),
        data: {
          subscription_id: 'sub_cancel_123',
          product_id: 'pdt_starter_test',
          customer: {
            customer_id: 'cust_cancel_123',
            email: 'cancel@test.com',
            name: 'Cancel User',
          },
          metadata: { api_key: apiKey },
          status: 'active',
          quantity: 1,
          recurring_pre_tax_amount: 900,
          currency: 'USD',
          payment_frequency_count: 1,
          payment_frequency_interval: 'Month',
          subscription_period_count: 0,
          subscription_period_interval: 'Month',
          created_at: new Date().toISOString(),
          next_billing_date: new Date().toISOString(),
          previous_billing_date: new Date().toISOString(),
          tax_inclusive: false,
          trial_period_days: 0,
          on_demand: false,
          cancel_at_next_billing_date: false,
          addons: [],
          meters: [],
          billing: { country: 'US' },
        },
      });

      // Verify activated
      const db = getClient();
      let result = await db.execute({
        sql: 'SELECT tier FROM api_keys WHERE key = ?',
        args: [apiKey],
      });
      expect(result.rows[0].tier).toBe('starter');

      // Now cancel
      await webhookPost({
        type: 'subscription.cancelled',
        business_id: 'biz_test',
        timestamp: new Date().toISOString(),
        data: {
          subscription_id: 'sub_cancel_123',
          product_id: 'pdt_starter_test',
          customer: {
            customer_id: 'cust_cancel_123',
            email: 'cancel@test.com',
            name: 'Cancel User',
          },
          metadata: {},
          status: 'cancelled',
          quantity: 1,
          recurring_pre_tax_amount: 900,
          currency: 'USD',
          payment_frequency_count: 1,
          payment_frequency_interval: 'Month',
          subscription_period_count: 0,
          subscription_period_interval: 'Month',
          created_at: new Date().toISOString(),
          next_billing_date: new Date().toISOString(),
          previous_billing_date: new Date().toISOString(),
          tax_inclusive: false,
          trial_period_days: 0,
          on_demand: false,
          cancel_at_next_billing_date: false,
          cancelled_at: new Date().toISOString(),
          addons: [],
          meters: [],
          billing: { country: 'US' },
        },
      });

      // Verify downgraded
      result = await db.execute({
        sql: 'SELECT tier FROM api_keys WHERE key = ?',
        args: [apiKey],
      });
      expect(result.rows[0].tier).toBe('free');
    });
  });

  describe('webhook: error handling', () => {
    it('returns 400 when webhook key is not configured', async () => {
      const savedKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
      delete process.env.DODO_PAYMENTS_WEBHOOK_KEY;

      const res = await webhookPost({ type: 'test', data: {} });
      expect(res.status).toBe(400);

      process.env.DODO_PAYMENTS_WEBHOOK_KEY = savedKey;
    });
  });

  describe('error messages are user-safe', () => {
    const FORBIDDEN_PATTERNS = [
      /process\.env/i,
      /DODO_\w+/,
      /not configured/i,
      /TURSO_\w+/,
      /stack trace/i,
      /at \w+\.\w+ \(/,
    ];

    it('POST /billing/checkout error messages are safe', async () => {
      const apiKey = await createTestKey('safe@test.com');
      const res = await post('/billing/checkout', { api_key: apiKey, plan: 'enterprise' });
      const data = await res.json();
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(data.message).not.toMatch(pattern);
      }
    });
  });
});
