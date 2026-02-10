import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  return new Response(
    `User-agent: *
Allow: /

Sitemap: https://shotapi.io/sitemap.xml`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
};
