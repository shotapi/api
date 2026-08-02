import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Context } from 'hono';
import { parseParams } from './params.js';
import { takeScreenshot, getBrowser } from './screenshot.js';
import { checkRateLimit, getRateLimitStats, type Tier } from './rate-limit.js';
import { logRequest, getStats, getClient } from './db.js';
import { extractApiKey, validateApiKey } from './auth.js';
import { screenshotLimiter, QueueFullError } from './limiter.js';
import { cacheKey, cacheGet, cacheSet, cacheStats } from './cache.js';
import { uploadToStorage } from './storage.js';
import { createAsyncJob, getJob } from './async-jobs.js';
import { analyzeWithVision } from './vision.js';
import keys from './routes/keys.js';
import billing from './routes/billing.js';

const startedAt = Date.now();

const app = new Hono();

// Middleware
app.use('*', cors());

// --- API info endpoints ---

app.get('/api', (c) => {
  return c.json({
    name: 'ShotAPI',
    version: '0.3.0',
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

// Deep health check — verifies Playwright + DB are functional
let deepCheckCache: { result: Record<string, unknown>; expiresAt: number } | null = null;

app.get('/health/deep', async (c) => {
  const now = Date.now();
  if (deepCheckCache && now < deepCheckCache.expiresAt) {
    return c.json(deepCheckCache.result);
  }

  const result: Record<string, unknown> = {
    status: 'ok',
    playwright: 'error',
    db: 'error',
    uptime_seconds: Math.floor((now - startedAt) / 1000),
    version: '0.3.0',
  };

  try {
    const browser = await getBrowser();
    const context = await browser.newContext({ viewport: { width: 1, height: 1 } });
    const page = await context.newPage();
    await page.goto('about:blank');
    await page.screenshot({ type: 'png' });
    await context.close();
    result.playwright = 'ok';
  } catch (err) {
    result.status = 'degraded';
    result.playwright_error = err instanceof Error ? err.message : 'Unknown error';
  }

  try {
    const db = getClient();
    await db.execute('SELECT 1');
    result.db = 'ok';
  } catch (err) {
    result.status = 'degraded';
    result.db_error = err instanceof Error ? err.message : 'Unknown error';
  }

  deepCheckCache = { result, expiresAt: now + 30_000 };

  const statusCode = result.status === 'ok' ? 200 : 503;
  return c.json(result, statusCode);
});

app.get('/stats', async (c) => {
  const rateLimitStats = await getRateLimitStats();
  const dbStats = await getStats();
  return c.json({ ...rateLimitStats, ...dbStats, concurrency: screenshotLimiter.stats, cache: cacheStats() });
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
  gif: 'image/gif',
  tiff: 'image/tiff',
  avif: 'image/avif',
  heif: 'image/heif',
  pdf: 'application/pdf',
  html: 'text/html',
  markdown: 'text/markdown',
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

    // Validate storage params early
    if (params.store) {
      if (!params.storage_bucket) {
        return c.json({ error: true, message: 'storage_bucket is required when store=true' }, 400);
      }
      if (!params.storage_access_key_id || !params.storage_secret_access_key) {
        return c.json({ error: true, message: 'storage_access_key_id and storage_secret_access_key are required when store=true' }, 400);
      }
    }

    // Async mode — return job ID immediately, process in background
    if (params.async) {
      const jobId = createAsyncJob(params);
      return c.json({ id: jobId, status: 'pending' }, 202);
    }

    // Unsupported feature warnings
    if (params.proxy || params.ip_country_code) {
      return c.json({ error: true, message: 'Proxy/geo-proxy is not yet supported.' }, 501);
    }

    // Check cache first
    if (params.cache) {
      const key = cacheKey(params);
      const cached = cacheGet(key);
      if (cached) {
        c.header('X-Cache', 'HIT');
        if (params.external_identifier) c.header('X-External-Identifier', params.external_identifier);
        if (params.response_type === 'json') {
          return c.json({
            screenshot: cached.buffer.toString('base64'),
            content_type: cached.contentType,
            cache: 'hit',
            ...cached.metadata,
          });
        }
        if (params.response_type === 'empty') {
          return new Response(null, { status: 200, headers: c.res.headers });
        }
        c.header('Content-Type', cached.contentType);
        c.header('Cache-Control', `public, max-age=${params.cache_ttl}`);
        if (params.attachment_name) c.header('Content-Disposition', `attachment; filename="${params.attachment_name}"`);
        return new Response(new Uint8Array(cached.buffer), { headers: c.res.headers });
      }
      c.header('X-Cache', 'MISS');
    }

    const startTime = Date.now();
    const result = await screenshotLimiter.run(() => takeScreenshot(params));
    const duration = Date.now() - startTime;

    const sourceUrl = params.url || (params.html ? 'html:inline' : 'markdown:inline');

    await logRequest({
      apiKey,
      ip,
      url: sourceUrl,
      format: params.format,
      durationMs: duration,
      status: 'success',
    });

    const contentType = CONTENT_TYPES[params.format] || 'application/octet-stream';

    // Store in cache
    if (params.cache) {
      const key = cacheKey(params);
      cacheSet(key, { buffer: result.buffer, metadata: result.metadata, contentType }, params.cache_ttl);
    }

    // S3-compatible storage upload
    let storeResult: { location: string } | undefined;
    if (params.store) {
      const upload = await uploadToStorage(result.buffer, params);
      storeResult = { location: upload.location };
    }

    // OpenAI Vision analysis
    let visionResult: { result: string } | undefined;
    if (params.openai_api_key) {
      visionResult = await analyzeWithVision(result.buffer, params);
    }

    // If store or vision was used, return JSON with combined results
    if (storeResult || visionResult) {
      return c.json({
        ...(storeResult ? { store: storeResult } : {}),
        ...(visionResult ? { vision: visionResult } : {}),
        ...(result.metadata || {}),
        screenshot: result.buffer.toString('base64'),
        content_type: contentType,
        duration_ms: duration,
      });
    }

    if (params.external_identifier) c.header('X-External-Identifier', params.external_identifier);

    // Empty response
    if (params.response_type === 'empty') {
      c.header('X-Screenshot-Duration-Ms', duration.toString());
      return new Response(null, { status: 200, headers: c.res.headers });
    }

    // JSON response
    if (params.response_type === 'json') {
      return c.json({
        screenshot: result.buffer.toString('base64'),
        content_type: contentType,
        duration_ms: duration,
        cache: params.cache ? 'miss' : 'disabled',
        ...result.metadata,
      });
    }

    // Binary response
    c.header('Content-Type', contentType);
    c.header('X-Screenshot-Duration-Ms', duration.toString());
    c.header('Cache-Control', params.cache ? `public, max-age=${params.cache_ttl}` : 'public, max-age=3600');
    if (params.attachment_name) c.header('Content-Disposition', `attachment; filename="${params.attachment_name}"`);

    return new Response(new Uint8Array(result.buffer), {
      headers: c.res.headers,
    });
  } catch (error) {
    if (error instanceof QueueFullError) {
      c.header('Retry-After', error.retryAfterSeconds.toString());
      return c.json(
        {
          error: true,
          message: error.message,
          retryAfterSeconds: error.retryAfterSeconds,
        },
        503
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Screenshot error:', message);

    return c.json({ error: true, message }, 400);
  }
}

// Async job status polling
app.get('/jobs/:id', (c) => {
  const job = getJob(c.req.param('id'));
  if (!job) {
    return c.json({ error: true, message: 'Job not found' }, 404);
  }
  return c.json(job);
});

app.get('/take', async (c) => {
  return handleScreenshot(c, c.req.query());
});

app.post('/take', async (c) => {
  const body = await c.req.json();
  return handleScreenshot(c, body);
});

// --- Billing ---

app.route('/billing', billing);

export default app;
