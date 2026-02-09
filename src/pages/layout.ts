export function layout(options: {
  title: string;
  description: string;
  path: string;
  content: string;
  ogImage?: string;
}): string {
  const baseUrl = 'https://shotapi.io';
  const fullUrl = `${baseUrl}${options.path}`;
  const ogImage = options.ogImage || `${baseUrl}/take?url=${encodeURIComponent(baseUrl)}&format=png&viewport_width=1200&viewport_height=630`;

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <meta name="description" content="${options.description}">
  <link rel="canonical" href="${fullUrl}">

  <!-- Open Graph -->
  <meta property="og:title" content="${options.title}">
  <meta property="og:description" content="${options.description}">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:type" content="website">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${options.title}">
  <meta name="twitter:description" content="${options.description}">
  <meta name="twitter:image" content="${ogImage}">

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#eef2ff',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
            }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-950 text-slate-100 antialiased">
  <nav class="border-b border-slate-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      <a href="/" class="text-xl font-bold text-white">Shot<span class="text-indigo-400">API</span></a>
      <div class="flex items-center gap-6 text-sm">
        <a href="/docs" class="text-slate-300 hover:text-white transition">Docs</a>
        <a href="/pricing" class="text-slate-300 hover:text-white transition">Pricing</a>
        <a href="/keys" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition font-medium">Get API Key</a>
      </div>
    </div>
  </nav>

  <main>
    ${options.content}
  </main>

  <footer class="border-t border-slate-800 mt-24">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 class="font-semibold text-white mb-3">Product</h3>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><a href="/docs" class="hover:text-white transition">Documentation</a></li>
            <li><a href="/pricing" class="hover:text-white transition">Pricing</a></li>
            <li><a href="/keys" class="hover:text-white transition">Get API Key</a></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-white mb-3">Compare</h3>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><a href="/vs/screenshotone" class="hover:text-white transition">vs ScreenshotOne</a></li>
            <li><a href="/vs/puppeteer" class="hover:text-white transition">vs Puppeteer</a></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-white mb-3">Resources</h3>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><a href="/blog/free-screenshot-api" class="hover:text-white transition">Free Screenshot API</a></li>
            <li><a href="/guides/nodejs-screenshot" class="hover:text-white transition">Node.js Guide</a></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-white mb-3">ShotAPI</h3>
          <p class="text-sm text-slate-400">Fast, affordable screenshot API for developers.</p>
          <p class="text-sm text-slate-500 mt-2">&copy; ${new Date().getFullYear()} ShotAPI</p>
        </div>
      </div>
    </div>
  </footer>
</body>
</html>`;
}
