import { Hono } from 'hono';
import Stripe from 'stripe';
import { getClient } from '../db.js';

const billing = new Hono();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2026-01-28.clover' });
}

// Create Checkout Session
billing.post('/checkout', async (c) => {
  try {
    const body = await c.req.json();
    const { api_key, price_id } = body;

    if (!api_key || !price_id) {
      return c.json({ error: true, message: 'api_key and price_id are required' }, 400);
    }

    // Verify API key exists
    const db = getClient();
    const keyResult = await db.execute({ sql: 'SELECT email FROM api_keys WHERE key = ?', args: [api_key] });
    if (keyResult.rows.length === 0) {
      return c.json({ error: true, message: 'Invalid API key' }, 404);
    }
    const email = keyResult.rows[0].email as string;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `https://shotapi.io/dashboard?key=${api_key}&upgraded=true`,
      cancel_url: `https://shotapi.io/pricing`,
      metadata: { api_key },
    });

    return c.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: true, message }, 400);
  }
});

// Stripe Webhook
billing.post('/webhook', async (c) => {
  const stripe = getStripe();
  const sig = c.req.header('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return c.json({ error: true, message: 'Missing signature or webhook secret' }, 400);
  }

  try {
    const rawBody = await c.req.text();
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    const db = getClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const apiKey = session.metadata?.api_key;
        if (apiKey && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

          // Determine tier from the subscription
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price?.id;
          const tier = determineTier(priceId || '');

          await db.execute({
            sql: 'UPDATE api_keys SET tier = ?, stripe_customer_id = ?, stripe_subscription_id = ? WHERE key = ?',
            args: [tier, customerId || null, subscriptionId, apiKey],
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price?.id;
        const tier = determineTier(priceId || '');
        const subscriptionId = subscription.id;

        await db.execute({
          sql: 'UPDATE api_keys SET tier = ? WHERE stripe_subscription_id = ?',
          args: [tier, subscriptionId],
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await db.execute({
          sql: "UPDATE api_keys SET tier = 'free' WHERE stripe_subscription_id = ?",
          args: [subscription.id],
        });
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

function determineTier(priceId: string): string {
  const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

  if (priceId === proPriceId) return 'pro';
  if (priceId === starterPriceId) return 'starter';
  return 'free';
}

export default billing;
