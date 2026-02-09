import { describe, it, expect } from 'vitest';
import { layout } from '../src/pages/layout.js';
import { landingPage } from '../src/pages/landing.js';
import { docsPage } from '../src/pages/docs.js';
import { pricingPage } from '../src/pages/pricing.js';
import { vsScreenshotone } from '../src/pages/content/vs-screenshotone.js';
import { vsPuppeteer } from '../src/pages/content/vs-puppeteer.js';
import { freeScreenshotApi } from '../src/pages/content/free-screenshot-api.js';
import { ogImageApi } from '../src/pages/content/og-image-api.js';
import { websiteThumbnails } from '../src/pages/content/website-thumbnails.js';
import { nodejsScreenshot } from '../src/pages/content/nodejs-screenshot.js';

describe('Pages', () => {
  describe('layout', () => {
    it('wraps content with HTML structure', () => {
      const html = layout({
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        content: '<p>Hello</p>',
      });
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>Test Page</title>');
      expect(html).toContain('<meta name="description" content="Test description">');
      expect(html).toContain('<link rel="canonical" href="https://shotapi.io/test">');
      expect(html).toContain('<p>Hello</p>');
      expect(html).toContain('tailwindcss');
    });

    it('includes Open Graph tags', () => {
      const html = layout({
        title: 'OG Test',
        description: 'OG desc',
        path: '/',
        content: '',
      });
      expect(html).toContain('og:title');
      expect(html).toContain('og:description');
      expect(html).toContain('og:image');
    });

    it('includes navigation', () => {
      const html = layout({ title: '', description: '', path: '/', content: '' });
      expect(html).toContain('ShotAPI');
      expect(html).toContain('/docs');
      expect(html).toContain('/pricing');
    });

    it('includes footer', () => {
      const html = layout({ title: '', description: '', path: '/', content: '' });
      expect(html).toContain('Documentation');
      expect(html).toContain('vs ScreenshotOne');
    });
  });

  describe('landingPage', () => {
    it('renders hero section', () => {
      const html = landingPage();
      expect(html).toContain('Screenshot');
      expect(html).toContain('API');
    });

    it('renders code examples', () => {
      const html = landingPage();
      expect(html).toContain('curl');
    });

    it('renders pricing table', () => {
      const html = landingPage();
      expect(html).toContain('Free');
      expect(html).toContain('Starter');
      expect(html).toContain('Pro');
      expect(html).toContain('$9');
      expect(html).toContain('$29');
    });

    it('renders FAQ', () => {
      const html = landingPage();
      expect(html).toContain('<details');
    });
  });

  describe('docsPage', () => {
    it('renders parameter documentation', () => {
      const html = docsPage();
      expect(html).toContain('url');
      expect(html).toContain('format');
      expect(html).toContain('viewport_width');
    });

    it('renders authentication section', () => {
      const html = docsPage();
      expect(html).toContain('access_key');
      expect(html).toContain('Authorization');
    });

    it('renders code examples', () => {
      const html = docsPage();
      expect(html).toContain('curl');
      expect(html).toContain('fetch');
    });
  });

  describe('internal link audit', () => {
    // All routes that exist in the app
    const VALID_ROUTES = new Set([
      '/', '/docs', '/pricing', '/dashboard', '/keys',
      '/vs/screenshotone', '/vs/puppeteer',
      '/blog/free-screenshot-api', '/blog/og-image-api',
      '/use-cases/website-thumbnails', '/guides/nodejs-screenshot',
      '/api', '/health', '/stats', '/sitemap.xml', '/robots.txt',
    ]);

    // Routes that are API endpoints (valid but not pages)
    const API_ROUTES = new Set(['/take', '/billing/checkout', '/billing/webhook']);

    function extractInternalLinks(html: string): string[] {
      const matches = html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g);
      return [...matches].map(m => m[1]);
    }

    function isValidRoute(path: string): boolean {
      if (VALID_ROUTES.has(path)) return true;
      if (API_ROUTES.has(path)) return true;
      // Dynamic routes like /keys/:key/usage
      if (path.startsWith('/keys/') && path.endsWith('/usage')) return true;
      // /take with params
      if (path.startsWith('/take')) return true;
      return false;
    }

    it('all links in layout point to valid routes', () => {
      const html = layout({ title: '', description: '', path: '/', content: '' });
      const links = extractInternalLinks(html);
      const broken = links.filter(l => !isValidRoute(l));
      expect(broken, `Broken links in layout: ${broken.join(', ')}`).toEqual([]);
    });

    it('all links in landing page point to valid routes', () => {
      const html = landingPage();
      const links = extractInternalLinks(html);
      const broken = links.filter(l => !isValidRoute(l));
      expect(broken, `Broken links in landing: ${broken.join(', ')}`).toEqual([]);
    });

    it('all links in docs page point to valid routes', () => {
      const html = docsPage();
      const links = extractInternalLinks(html);
      const broken = links.filter(l => !isValidRoute(l));
      expect(broken, `Broken links in docs: ${broken.join(', ')}`).toEqual([]);
    });

    it('all links in pricing page point to valid routes', () => {
      const html = pricingPage();
      const links = extractInternalLinks(html);
      const broken = links.filter(l => !isValidRoute(l));
      expect(broken, `Broken links in pricing: ${broken.join(', ')}`).toEqual([]);
    });

    it('all links in SEO content pages point to valid routes', () => {
      const contentPages = [
        { name: 'vs-screenshotone', fn: vsScreenshotone },
        { name: 'vs-puppeteer', fn: vsPuppeteer },
        { name: 'free-screenshot-api', fn: freeScreenshotApi },
        { name: 'og-image-api', fn: ogImageApi },
        { name: 'website-thumbnails', fn: websiteThumbnails },
        { name: 'nodejs-screenshot', fn: nodejsScreenshot },
      ];
      for (const page of contentPages) {
        const html = page.fn();
        const links = extractInternalLinks(html);
        const broken = links.filter(l => !isValidRoute(l));
        expect(broken, `Broken links in ${page.name}: ${broken.join(', ')}`).toEqual([]);
      }
    });
  });
});
