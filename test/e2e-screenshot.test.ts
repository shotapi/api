import { describe, it, expect, beforeEach } from 'vitest';
import { initDb, resetClient } from '../src/db.js';
import { cacheClear } from '../src/cache.js';
import app from '../src/app.js';

process.env.TURSO_DATABASE_URL = ':memory:';
delete process.env.DODO_PAYMENTS_API_KEY;

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

describe('E2E: Screenshot API', () => {
  beforeEach(async () => {
    resetClient();
    await initDb();
    cacheClear();
  });

  // ── Source validation ──────────────────────────────────────────

  describe('source validation', () => {
    it('GET /take without source returns error', async () => {
      const res = await req('/take');
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('url, html, or markdown');
    });

    it('POST /take with multiple sources returns error', async () => {
      const res = await post('/take', { url: 'https://example.com', html: '<h1>hi</h1>' });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Only one');
    });

    it('GET /take with invalid URL returns error', async () => {
      const res = await req('/take?url=not-a-url');
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Invalid URL');
    });
  });

  // ── Response type ──────────────────────────────────────────────

  describe('response_type=json', () => {
    it('POST /take with response_type=json returns JSON with base64', async () => {
      const res = await post('/take', { html: '<h1>Test</h1>', response_type: 'json' });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.screenshot).toBeDefined();
      expect(data.content_type).toBe('image/png');
      expect(data.width).toBeGreaterThan(0);
      expect(data.height).toBeGreaterThan(0);
      expect(data.size).toBeGreaterThan(0);
      expect(data.duration_ms).toBeGreaterThanOrEqual(0);
    });
  });

  // ── HTML source ────────────────────────────────────────────────

  describe('html source', () => {
    it('renders HTML content', async () => {
      const res = await post('/take', { html: '<h1 style="color:red">Hello</h1>', format: 'png' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('image/png');
      const buf = await res.arrayBuffer();
      expect(buf.byteLength).toBeGreaterThan(100);
    });
  });

  // ── Format handling ────────────────────────────────────────────

  describe('format', () => {
    it('returns jpeg when format=jpeg', async () => {
      const res = await post('/take', { html: '<h1>JPEG</h1>', format: 'jpeg' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('image/jpeg');
    });

    it('accepts jpg as alias for jpeg', async () => {
      const res = await post('/take', { html: '<h1>JPG</h1>', format: 'jpg' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('image/jpeg');
    });

    it('returns webp when format=webp', async () => {
      const res = await post('/take', { html: '<h1>WebP</h1>', format: 'webp' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('image/webp');
    });

    it('returns pdf when format=pdf', async () => {
      const res = await post('/take', { html: '<h1>PDF</h1>', format: 'pdf' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/pdf');
    });
  });

  // ── Viewport ───────────────────────────────────────────────────

  describe('viewport', () => {
    it('respects custom viewport size', async () => {
      const res = await post('/take', {
        html: '<div style="width:100vw;height:100vh;background:red"></div>',
        viewport_width: 640,
        viewport_height: 480,
        response_type: 'json',
      });
      const data = await res.json();
      expect(data.width).toBe(640);
      expect(data.height).toBe(480);
    });
  });

  // ── Scripts and styles injection ───────────────────────────────

  describe('scripts/styles injection', () => {
    it('injects custom CSS', async () => {
      const res = await post('/take', {
        html: '<h1 id="title">Hello</h1>',
        styles: 'h1 { display: none !important; }',
        response_type: 'json',
      });
      expect(res.status).toBe(200);
    });

    it('executes custom JavaScript', async () => {
      const res = await post('/take', {
        html: '<h1 id="title">Before</h1>',
        scripts: 'document.getElementById("title").textContent = "After"',
        response_type: 'json',
      });
      expect(res.status).toBe(200);
    });
  });

  // ── Cache ──────────────────────────────────────────────────────

  describe('cache', () => {
    it('returns X-Cache: MISS on first request, HIT on second', async () => {
      const body = { html: '<h1>Cache Test</h1>', cache: true, cache_ttl: 3600 };

      const res1 = await post('/take', body);
      expect(res1.status).toBe(200);
      expect(res1.headers.get('x-cache')).toBe('MISS');

      const res2 = await post('/take', body);
      expect(res2.status).toBe(200);
      expect(res2.headers.get('x-cache')).toBe('HIT');
    });

    it('cache respects response_type=json', async () => {
      const body = { html: '<h1>Cache JSON</h1>', cache: true, cache_ttl: 3600, response_type: 'json' };

      const res1 = await post('/take', body);
      const data1 = await res1.json();
      expect(data1.cache).toBe('miss');

      const res2 = await post('/take', body);
      const data2 = await res2.json();
      expect(data2.cache).toBe('hit');
    });

    it('no X-Cache header when cache is disabled', async () => {
      const res = await post('/take', { html: '<h1>No Cache</h1>' });
      expect(res.headers.get('x-cache')).toBeNull();
    });
  });

  // ── Omit background ───────────────────────────────────────────

  describe('omit_background', () => {
    it('produces a PNG with transparency', async () => {
      const res = await post('/take', {
        html: '<div style="width:10px;height:10px;background:transparent"></div>',
        omit_background: true,
        format: 'png',
      });
      expect(res.status).toBe(200);
      // PNG with transparency should still be valid
      const buf = await res.arrayBuffer();
      expect(buf.byteLength).toBeGreaterThan(0);
    });
  });

  // ── Image resize ───────────────────────────────────────────────

  describe('image resize', () => {
    it('resizes output image', async () => {
      const res = await post('/take', {
        html: '<div style="width:500px;height:500px;background:blue"></div>',
        viewport_width: 500,
        viewport_height: 500,
        image_width: 100,
        response_type: 'json',
      });
      const data = await res.json();
      expect(data.width).toBeLessThanOrEqual(100);
    });
  });

  // ── PDF options ────────────────────────────────────────────────

  describe('pdf options', () => {
    it('generates landscape PDF', async () => {
      const res = await post('/take', {
        html: '<h1>Landscape</h1>',
        format: 'pdf',
        pdf_landscape: true,
        pdf_print_background: true,
        pdf_paper_format: 'a4',
      });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/pdf');
    });
  });

  // ── Click ──────────────────────────────────────────────────────

  describe('click', () => {
    it('clicks element before screenshot', async () => {
      const res = await post('/take', {
        html: `<button id="btn" onclick="document.body.style.background='green'">Click</button>`,
        click: '#btn',
        response_type: 'json',
      });
      expect(res.status).toBe(200);
    });

    it('returns error for missing click target', async () => {
      const res = await post('/take', {
        html: '<h1>No Button</h1>',
        click: '#nonexistent',
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Click target not found');
    }, 15000);
  });

  // ── Block resources ────────────────────────────────────────────

  describe('block_resources', () => {
    it('accepts block_resources param', async () => {
      const res = await post('/take', {
        html: '<h1>Blocked</h1>',
        block_resources: ['image', 'font'],
        response_type: 'json',
      });
      expect(res.status).toBe(200);
    });
  });

  // ── Error handling ─────────────────────────────────────────────

  describe('error handling', () => {
    it('errors do not leak internal details', async () => {
      const FORBIDDEN_PATTERNS = [
        /process\.env/i,
        /TURSO_\w+/,
        /at \w+\.\w+ \(/,
      ];

      const res = await post('/take', { url: 'https://example.com', html: '<h1>hi</h1>' });
      const data = await res.json();
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(data.message).not.toMatch(pattern);
      }
    });
  });

  // ── Version ────────────────────────────────────────────────────

  describe('API version', () => {
    it('GET /api returns v0.3.0', async () => {
      const res = await req('/api');
      const data = await res.json();
      expect(data.version).toBe('0.3.0');
    });
  });

  // ── Stats include cache ────────────────────────────────────────

  describe('stats', () => {
    it('GET /stats includes cache stats', async () => {
      const res = await req('/stats');
      const data = await res.json();
      expect(data.cache).toBeDefined();
      expect(data.cache.entries).toBe(0);
    });
  });
});
