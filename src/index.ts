import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from 'hono/logger';
import { closeBrowser } from './screenshot.js';
import { initDb, resetClient } from './db.js';
import app from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Logger only in production (noisy in tests)
app.use('*', logger());

// --- Graceful shutdown ---

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await closeBrowser();
  resetClient();
  process.exit(0);
});

// --- Start server ---

const port = parseInt(process.env.PORT || '3000');

async function start() {
  await initDb();

  // Try to load Astro SSR handler
  let astroHandler: ((req: http.IncomingMessage, res: http.ServerResponse, next?: () => void) => void) | null = null;
  try {
    // @ts-expect-error - Astro build output has no type declarations
    const astro = await import('../astro/dist/server/entry.mjs');
    astroHandler = astro.handler;
    console.log('Astro SSR handler loaded');
  } catch {
    console.warn('Astro SSR handler not found (run: cd astro && npm run build)');
  }

  console.log(`ShotAPI starting on port ${port}`);

  // Create a single Node HTTP server that routes to Hono API or Astro SSR
  const { getRequestListener } = await import('@hono/node-server');
  const honoListener = getRequestListener(app.fetch);

  // Routes that Hono's API handles (not page routes)
  const API_PREFIXES = ['/api', '/health', '/stats', '/take', '/billing'];
  const API_EXACT = new Set(['/robots.txt', '/sitemap.xml']);

  const server = http.createServer((req, res) => {
    const url = req.url || '/';
    const pathname = url.split('?')[0];

    // Keys POST = Hono API, Keys GET = Astro page
    const isKeysPost = pathname === '/keys' && req.method === 'POST';
    const isKeysUsage = pathname.startsWith('/keys/') && pathname.endsWith('/usage');

    // API routes -> Hono
    const isApiRoute =
      isKeysPost ||
      isKeysUsage ||
      API_EXACT.has(pathname) ||
      API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

    if (isApiRoute || !astroHandler) {
      // Hono handles API routes (and all routes if Astro isn't built)
      honoListener(req, res);
    } else if (pathname.startsWith('/_astro/')) {
      // Serve Astro client-side assets (CSS, JS) from build output
      const clientDir = path.resolve(__dirname, '..', 'astro', 'dist', 'client');
      const filePath = path.join(clientDir, pathname);
      // Prevent path traversal
      if (!filePath.startsWith(clientDir)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const ext = path.extname(filePath);
      const contentTypes: Record<string, string> = {
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
      };
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': contentTypes[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        });
        res.end(data);
      });
    } else {
      // Page routes -> Astro SSR, with Hono fallback
      astroHandler(req, res, () => {
        // If Astro doesn't handle it, fall back to Hono (old template pages)
        honoListener(req, res);
      });
    }
  });

  server.listen(port, () => {
    console.log(`ShotAPI listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
