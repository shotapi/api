import { Hono } from 'hono';
import { layout } from '../pages/layout.js';
import { landingPage } from '../pages/landing.js';
import { docsPage } from '../pages/docs.js';
import { dashboardPage } from '../pages/dashboard.js';
import { pricingPage } from '../pages/pricing.js';
import { vsScreenshotone } from '../pages/content/vs-screenshotone.js';
import { vsPuppeteer } from '../pages/content/vs-puppeteer.js';
import { freeScreenshotApi } from '../pages/content/free-screenshot-api.js';
import { ogImageApi } from '../pages/content/og-image-api.js';
import { websiteThumbnails } from '../pages/content/website-thumbnails.js';
import { nodejsScreenshot } from '../pages/content/nodejs-screenshot.js';

const pages = new Hono();

// Landing page
pages.get('/', (c) => {
  return c.html(layout({
    title: 'ShotAPI — Screenshot API for Developers',
    description: 'Fast, affordable screenshot API. Capture any website as PNG, JPEG, WebP, or PDF. ScreenshotOne compatible. Free tier available.',
    path: '/',
    content: landingPage(),
  }));
});

// Docs page
pages.get('/docs', (c) => {
  return c.html(layout({
    title: 'API Documentation — ShotAPI',
    description: 'Complete API reference for ShotAPI. Authentication, parameters, code examples in curl, Node.js, and Python.',
    path: '/docs',
    content: docsPage(),
  }));
});

// Dashboard page
pages.get('/dashboard', async (c) => {
  const apiKey = c.req.query('key');
  if (!apiKey) {
    return c.html(layout({
      title: 'Dashboard — ShotAPI',
      description: 'View your ShotAPI usage and manage your account.',
      path: '/dashboard',
      content: `<div class="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 class="text-2xl font-bold text-white mb-4">API Key Required</h1>
        <p class="text-slate-400 mb-6">Provide your API key to view your dashboard.</p>
        <form class="max-w-md mx-auto flex gap-2" onsubmit="event.preventDefault(); window.location.href='/dashboard?key=' + document.getElementById('key-input').value;">
          <input id="key-input" type="text" placeholder="sa_..." class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500">
          <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition font-medium">View</button>
        </form>
      </div>`,
    }));
  }

  return c.html(layout({
    title: 'Dashboard — ShotAPI',
    description: 'View your ShotAPI usage and manage your account.',
    path: '/dashboard',
    content: await dashboardPage(apiKey),
  }));
});

// Pricing page
pages.get('/pricing', (c) => {
  return c.html(layout({
    title: 'Pricing — ShotAPI',
    description: 'Simple, affordable pricing. Free tier with 100 screenshots/day. Paid plans from $9/mo.',
    path: '/pricing',
    content: pricingPage(),
  }));
});

// --- SEO Content Pages ---

// vs ScreenshotOne
pages.get('/vs/screenshotone', (c) => {
  return c.html(layout({
    title: 'ShotAPI vs ScreenshotOne — Affordable Alternative',
    description: 'Compare ShotAPI and ScreenshotOne. Same API compatibility, lower prices. Switch in 5 minutes.',
    path: '/vs/screenshotone',
    content: vsScreenshotone(),
  }));
});

// vs Puppeteer
pages.get('/vs/puppeteer', (c) => {
  return c.html(layout({
    title: 'ShotAPI vs Puppeteer for Screenshots — API vs DIY',
    description: 'Stop managing Puppeteer infrastructure. Get screenshots via a simple API call. Free tier available.',
    path: '/vs/puppeteer',
    content: vsPuppeteer(),
  }));
});

// Free Screenshot API
pages.get('/blog/free-screenshot-api', (c) => {
  return c.html(layout({
    title: 'Free Screenshot API in 2026 — No Credit Card Required',
    description: 'Get 100 free screenshots per day with ShotAPI. No credit card, no limits on formats. PNG, JPEG, WebP, PDF supported.',
    path: '/blog/free-screenshot-api',
    content: freeScreenshotApi(),
  }));
});

// OG Image API
pages.get('/blog/og-image-api', (c) => {
  return c.html(layout({
    title: 'Generate OG Images with a Screenshot API',
    description: 'Use ShotAPI to generate dynamic Open Graph images from any URL. Perfect for social media previews and link cards.',
    path: '/blog/og-image-api',
    content: ogImageApi(),
  }));
});

// Website Thumbnails
pages.get('/use-cases/website-thumbnails', (c) => {
  return c.html(layout({
    title: 'Website Thumbnail API — Generate Previews at Scale',
    description: 'Generate website thumbnails and previews at scale. Perfect for directories, link aggregators, and portfolio sites.',
    path: '/use-cases/website-thumbnails',
    content: websiteThumbnails(),
  }));
});

// Node.js Screenshot Guide
pages.get('/guides/nodejs-screenshot', (c) => {
  return c.html(layout({
    title: 'How to Take Screenshots in Node.js — The Complete Guide',
    description: 'Learn how to capture website screenshots in Node.js using ShotAPI, Puppeteer, and Playwright. Code examples included.',
    path: '/guides/nodejs-screenshot',
    content: nodejsScreenshot(),
  }));
});

// robots.txt
pages.get('/robots.txt', (c) => {
  return c.text(`User-agent: *
Allow: /

Sitemap: https://shotapi.io/sitemap.xml`);
});

// sitemap.xml
pages.get('/sitemap.xml', (c) => {
  const sitemapPages = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/docs', priority: '0.9', changefreq: 'weekly' },
    { loc: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { loc: '/vs/screenshotone', priority: '0.8', changefreq: 'monthly' },
    { loc: '/vs/puppeteer', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/free-screenshot-api', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/og-image-api', priority: '0.7', changefreq: 'monthly' },
    { loc: '/use-cases/website-thumbnails', priority: '0.7', changefreq: 'monthly' },
    { loc: '/guides/nodejs-screenshot', priority: '0.7', changefreq: 'monthly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map(p => `  <url>
    <loc>https://shotapi.io${p.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  c.header('Content-Type', 'application/xml');
  return c.body(xml);
});

export default pages;
