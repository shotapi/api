import { Hono } from 'hono';
import { registerApiKey, getKeyUsage } from '../auth.js';

const keys = new Hono();

// Register new API key
keys.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const email = body.email;

    if (!email || typeof email !== 'string') {
      return c.json({ error: true, message: 'email is required' }, 400);
    }

    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      return c.json({ error: true, message: 'Invalid email address' }, 400);
    }

    const keyInfo = registerApiKey(email);

    return c.json({
      key: keyInfo.key,
      email: keyInfo.email,
      tier: keyInfo.tier,
      dailyLimit: 100,
      message: 'API key created. Use access_key query parameter or Authorization: Bearer header.',
    }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: true, message }, 400);
  }
});

// Get API key usage
keys.get('/:key/usage', (c) => {
  const key = c.req.param('key');
  const usage = getKeyUsage(key);

  if (!usage) {
    return c.json({ error: true, message: 'API key not found' }, 404);
  }

  return c.json({
    key,
    tier: usage.tier,
    usage: {
      today: usage.today,
      dailyLimit: usage.dailyLimit,
      remaining: Math.max(0, usage.dailyLimit - usage.today),
      total: usage.total,
    },
  });
});

export default keys;
