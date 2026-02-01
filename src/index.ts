import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { parseParams } from './params.js';
import { takeScreenshot, closeBrowser } from './screenshot.js';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'ShotAPI',
    version: '0.1.0',
    docs: 'https://shotapi.io/docs',
    endpoints: {
      screenshot: 'GET /take?url=https://example.com',
    },
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Main screenshot endpoint - ScreenshotOne compatible
app.get('/take', async (c) => {
  try {
    const query = c.req.query();
    const params = parseParams(query);

    const startTime = Date.now();
    const screenshot = await takeScreenshot(params);
    const duration = Date.now() - startTime;

    // Set appropriate content type
    const contentTypes: Record<string, string> = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      pdf: 'application/pdf',
    };

    c.header('Content-Type', contentTypes[params.format]);
    c.header('X-Screenshot-Duration-Ms', duration.toString());
    c.header('Cache-Control', 'public, max-age=3600');

    return new Response(new Uint8Array(screenshot), {
      headers: c.res.headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Screenshot error:', message);

    return c.json(
      {
        error: true,
        message,
      },
      400
    );
  }
});

// Also support POST for larger payloads
app.post('/take', async (c) => {
  try {
    const body = await c.req.json();
    const params = parseParams(body);

    const startTime = Date.now();
    const screenshot = await takeScreenshot(params);
    const duration = Date.now() - startTime;

    const contentTypes: Record<string, string> = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      pdf: 'application/pdf',
    };

    c.header('Content-Type', contentTypes[params.format]);
    c.header('X-Screenshot-Duration-Ms', duration.toString());

    return new Response(new Uint8Array(screenshot), {
      headers: c.res.headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Screenshot error:', message);

    return c.json(
      {
        error: true,
        message,
      },
      400
    );
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await closeBrowser();
  process.exit(0);
});

// Start server
const port = parseInt(process.env.PORT || '3000');

console.log(`🚀 ShotAPI starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
