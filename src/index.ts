import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { closeBrowser } from './screenshot.js';
import { initDb, resetClient } from './db.js';
import app from './app.js';

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
  console.log(`ShotAPI starting on port ${port}`);
  serve({ fetch: app.fetch, port });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
