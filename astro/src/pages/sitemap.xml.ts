import type { APIRoute } from 'astro';

const pages = [
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

export const GET: APIRoute = () => {
  const today = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>https://shotapi.io${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
