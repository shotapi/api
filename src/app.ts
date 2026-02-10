import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Context } from 'hono';
import { parseParams } from './params.js';
import { takeScreenshot } from './screenshot.js';
import { checkRateLimit, getRateLimitStats, type Tier } from './rate-limit.js';
import { logRequest, getStats } from './db.js';
import { extractApiKey, validateApiKey } from './auth.js';
import keys from './routes/keys.js';
import billing from './routes/billing.js';

const app = new Hono();

// Middleware
app.use('*', cors());

// --- API info endpoints ---

app.get('/api', (c) => {
  return c.json({
    name: 'ShotAPI',
    version: '0.2.0',
    docs: 'https://shotapi.io/docs',
    endpoints: {
      screenshot: 'GET /take?url=https://example.com',
      register: 'POST /keys',
      usage: 'GET /keys/:key/usage',
    },
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.get('/stats', async (c) => {
  const rateLimitStats = await getRateLimitStats();
  const dbStats = await getStats();
  return c.json({ ...rateLimitStats, ...dbStats });
});

// --- API key management ---

app.route('/keys', keys);

// --- Screenshot endpoint (shared handler for GET + POST) ---

function getClientIP(c: Context): string {
  return (
    c.req.header('fly-client-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown'
  );
}

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

async function handleScreenshot(c: Context, rawParams: Record<string, string>) {
  const ip = getClientIP(c);

  // Extract and validate API key
  const apiKeyStr = extractApiKey(rawParams, c.req.raw.headers);
  let tier: Tier = 'anonymous';
  let apiKey: string | undefined;

  if (apiKeyStr) {
    const keyInfo = await validateApiKey(apiKeyStr);
    if (!keyInfo) {
      return c.json({ error: true, message: 'Invalid API key' }, 401);
    }
    tier = keyInfo.tier as Tier;
    apiKey = apiKeyStr;
  }

  // Rate limiting
  const rateLimit = await checkRateLimit({ ip, apiKey, tier });

  c.header('X-RateLimit-Limit', rateLimit.limit.toString());
  c.header('X-RateLimit-Remaining', rateLimit.remaining.toString());
  c.header('X-RateLimit-Reset', Math.floor(rateLimit.resetAt / 1000).toString());

  if (!rateLimit.allowed) {
    return c.json(
      {
        error: true,
        message: `Rate limit exceeded. ${tier === 'anonymous' ? 'Get a free API key for higher limits.' : `Your ${tier} plan allows ${rateLimit.limit} screenshots per day.`}`,
        resetAt: new Date(rateLimit.resetAt).toISOString(),
      },
      429
    );
  }

  try {
    const params = parseParams(rawParams);

    const startTime = Date.now();
    const screenshot = await takeScreenshot(params);
    const duration = Date.now() - startTime;

    // Log request to database
    await logRequest({
      apiKey,
      ip,
      url: params.url,
      format: params.format,
      durationMs: duration,
      status: 'success',
    });

    c.header('Content-Type', CONTENT_TYPES[params.format]);
    c.header('X-Screenshot-Duration-Ms', duration.toString());
    c.header('Cache-Control', 'public, max-age=3600');

    return new Response(new Uint8Array(screenshot), {
      headers: c.res.headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Screenshot error:', message);

    return c.json({ error: true, message }, 400);
  }
}

app.get('/take', async (c) => {
  return handleScreenshot(c, c.req.query());
});

app.post('/take', async (c) => {
  const body = await c.req.json();
  return handleScreenshot(c, body);
});

// --- Billing (Stripe) ---

app.route('/billing', billing);

export default app;
