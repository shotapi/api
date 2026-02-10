import { Hono } from 'hono';
import DodoPayments from 'dodopayments';
import { getClient } from '../db.js';

const billing = new Hono();

function getDodo(): DodoPayments {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) throw new Error('DODO_PAYMENTS_API_KEY not configured');
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode';
  return new DodoPayments({
    bearerToken: key,
    environment: env as 'test_mode' | 'live_mode',
  });
}

// Map plan names to Dodo product IDs (set via env vars)
function getProductId(plan: string): string | null {
  const products: Record<string, string | undefined> = {
    starter: process.env.DODO_STARTER_PRODUCT_ID,
    pro: process.env.DODO_PRO_PRODUCT_ID,
  };
  return products[plan] || null;
}

// Create Checkout Session
billing.post('/checkout', async (c) => {
  try {
    const body = await c.req.json();
    const { api_key, plan } = body;

    if (!api_key || !plan) {
      return c.json({ error: true, message: 'api_key and plan are required' }, 400);
    }

    const productId = getProductId(plan);
    if (!productId) {
      return c.json({ error: true, message: 'Billing is not available yet. Please contact hello@shotapi.io to upgrade.' }, 400);
    }

    // Verify API key exists
    const db = getClient();
    const keyResult = await db.execute({ sql: 'SELECT email FROM api_keys WHERE key = ?', args: [api_key] });
    if (keyResult.rows.length === 0) {
      return c.json({ error: true, message: 'Invalid API key' }, 404);
    }
    const email = keyResult.rows[0].email as string;

    const dodo = getDodo();
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email },
      return_url: `https://shotapi.io/dashboard?key=${api_key}&upgraded=true`,
      metadata: { api_key },
    });

    return c.json({ url: session.checkout_url });
  } catch (error) {
    console.error('Checkout error:', error instanceof Error ? error.message : error);
    return c.json({ error: true, message: 'Something went wrong. Please try again or contact hello@shotapi.io.' }, 500);
  }
});

// Dodo Webhook
billing.post('/webhook', async (c) => {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!webhookKey) {
    return c.json({ error: true, message: 'Webhook key not configured' }, 400);
  }

  try {
    const rawBody = await c.req.text();
    const dodo = getDodo();

    const event = dodo.webhooks.unwrap(rawBody, {
      headers: {
        'webhook-id': c.req.header('webhook-id') || '',
        'webhook-signature': c.req.header('webhook-signature') || '',
        'webhook-timestamp': c.req.header('webhook-timestamp') || '',
      },
      key: webhookKey,
    });

    const db = getClient();
    const data = event.data as unknown as Record<string, unknown>;
    const metadata = (data.metadata || {}) as Record<string, string>;
    const customer = (data.customer || {}) as Record<string, string>;
    const subscriptionId = data.subscription_id as string;
    const customerId = customer.customer_id as string;
    const customerEmail = customer.email as string;

    // Resolve API key: prefer metadata, fall back to email lookup
    let apiKey = metadata.api_key;
    if (!apiKey && customerEmail) {
      const emailResult = await db.execute({
        sql: 'SELECT key FROM api_keys WHERE email = ? LIMIT 1',
        args: [customerEmail],
      });
      if (emailResult.rows.length > 0) {
        apiKey = emailResult.rows[0].key as string;
      }
    }

    console.log(`Webhook ${event.type}: apiKey=${apiKey ? 'found' : 'missing'}, subscriptionId=${subscriptionId}, customerId=${customerId}`);

    switch (event.type) {
      case 'subscription.active': {
        if (apiKey && subscriptionId) {
          const productId = data.product_id as string;
          const tier = determineTier(productId);

          await db.execute({
            sql: 'UPDATE api_keys SET tier = ?, dodo_customer_id = ?, dodo_subscription_id = ? WHERE key = ?',
            args: [tier, customerId || null, subscriptionId, apiKey],
          });
          console.log(`Upgraded ${apiKey} to ${tier}`);
        }
        break;
      }

      case 'subscription.plan_changed': {
        const productId = data.product_id as string;
        const tier = determineTier(productId);

        if (subscriptionId) {
          await db.execute({
            sql: 'UPDATE api_keys SET tier = ? WHERE dodo_subscription_id = ?',
            args: [tier, subscriptionId],
          });
        } else if (apiKey) {
          await db.execute({
            sql: 'UPDATE api_keys SET tier = ? WHERE key = ?',
            args: [tier, apiKey],
          });
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        if (subscriptionId) {
          await db.execute({
            sql: "UPDATE api_keys SET tier = 'free' WHERE dodo_subscription_id = ?",
            args: [subscriptionId],
          });
        }
        break;
      }
    }

    return c.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    console.error('Webhook error:', message);
    return c.json({ error: true, message }, 400);
  }
});

function determineTier(productId: string): string {
  const starterProductId = process.env.DODO_STARTER_PRODUCT_ID;
  const proProductId = process.env.DODO_PRO_PRODUCT_ID;

  if (productId === proProductId) return 'pro';
  if (productId === starterProductId) return 'starter';
  return 'free';
}

export default billing;
