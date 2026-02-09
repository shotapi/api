export function freeScreenshotApi(): string {
  return `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Free Screenshot API in 2026 — No Credit Card Required",
    "description": "Get 100 free screenshots per day with ShotAPI. No credit card, no limits on formats. PNG, JPEG, WebP, PDF supported.",
    "author": { "@type": "Organization", "name": "ShotAPI" },
    "publisher": { "@type": "Organization", "name": "ShotAPI" },
    "mainEntityOfPage": "https://shotapi.io/blog/free-screenshot-api"
  }
  </script>

  <article class="py-16 sm:py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">

      <!-- Breadcrumb -->
      <nav class="mb-8 text-sm text-slate-500">
        <a href="/" class="hover:text-slate-300 transition">Home</a>
        <span class="mx-2">/</span>
        <a href="/blog/free-screenshot-api" class="hover:text-slate-300 transition">Blog</a>
        <span class="mx-2">/</span>
        <span class="text-slate-300">Free Screenshot API</span>
      </nav>

      <h1 class="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
        Free Screenshot API in 2026<br>
        <span class="text-indigo-400">No Credit Card Required</span>
      </h1>

      <p class="text-lg text-slate-400 leading-relaxed mb-12 max-w-3xl">
        Need to capture website screenshots programmatically? ShotAPI offers a generous free tier
        with 100 screenshots per day, all output formats, and every feature included. No credit card,
        no trial expiration.
      </p>

      <!-- What you get for free -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">What you get for free</h2>
        <p class="text-slate-300 leading-relaxed mb-6">
          ShotAPI has two free tiers. Without an API key, you get 10 screenshots per day to try
          things out. Sign up for a free API key (takes 10 seconds) and you unlock the full free tier:
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <div class="text-3xl font-bold text-indigo-400 mb-2">100</div>
            <h3 class="text-white font-medium mb-1">Screenshots per day</h3>
            <p class="text-sm text-slate-400">Resets every 24 hours. Enough for most side projects and prototypes.</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <div class="text-3xl font-bold text-indigo-400 mb-2">4</div>
            <h3 class="text-white font-medium mb-1">Output formats</h3>
            <p class="text-sm text-slate-400">PNG, JPEG, WebP, and PDF. All formats available on the free tier, no restrictions.</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <div class="text-3xl font-bold text-indigo-400 mb-2">All</div>
            <h3 class="text-white font-medium mb-1">Features included</h3>
            <p class="text-sm text-slate-400">Full page capture, dark mode, ad blocking, custom viewport, selectors. Nothing gated.</p>
          </div>
        </div>
      </section>

      <!-- Quick start -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Quick start: 3 steps to your first screenshot</h2>

        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">1</div>
            <div class="flex-1">
              <h3 class="text-white font-medium mb-2">Get your API key</h3>
              <p class="text-sm text-slate-400 mb-3">
                Visit <a href="/keys" class="text-indigo-400 hover:text-indigo-300 transition">/keys</a>, enter your email,
                and get an API key instantly. No credit card, no signup form.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">2</div>
            <div class="flex-1">
              <h3 class="text-white font-medium mb-2">Make your first request</h3>
              <p class="text-sm text-slate-400 mb-3">Run this command in your terminal:</p>
              <div class="rounded-xl bg-slate-900 border border-slate-800 p-4 overflow-x-auto">
                <pre class="text-sm"><code><span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?url=https://github.com&amp;format=png&amp;access_key=YOUR_KEY"</span> \\
  <span class="text-slate-500">--output</span> screenshot.png</code></pre>
              </div>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">3</div>
            <div class="flex-1">
              <h3 class="text-white font-medium mb-2">Get your image</h3>
              <p class="text-sm text-slate-400">
                The API returns the screenshot directly as binary data. Open <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">screenshot.png</code>
                and you have your captured website.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Use cases -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">What developers build with free screenshots</h2>
        <p class="text-slate-300 leading-relaxed mb-6">
          A hundred screenshots per day covers more use cases than you might expect:
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Website thumbnails</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Build link directories, bookmark managers, or portfolio sites that show visual previews
              of each URL. Generate thumbnails on demand or cache them.
            </p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Social media previews</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Generate Open Graph images dynamically. Create a template page, screenshot it at 1200x630,
              and use it as your og:image for rich link cards on social media.
            </p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Visual regression testing</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Capture screenshots of your staging site before and after deployments. Compare them
              to catch unintended visual changes before they reach production.
            </p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-lg font-semibold text-white mb-2">PDF reports</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Convert web pages to PDF with a single API call. Perfect for generating invoices,
              receipts, or any web content that needs to be saved as a document.
            </p>
          </div>
        </div>
      </section>

      <!-- Comparison with other free options -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Comparison with other free screenshot tools</h2>
        <div class="overflow-x-auto rounded-xl border border-slate-800">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-900/50 border-b border-slate-800">
                <th class="text-left p-4 text-slate-300 font-medium">Feature</th>
                <th class="text-left p-4 text-indigo-400 font-medium">ShotAPI Free</th>
                <th class="text-left p-4 text-slate-400 font-medium">Puppeteer (DIY)</th>
                <th class="text-left p-4 text-slate-400 font-medium">Other APIs</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              <tr>
                <td class="p-4 text-slate-300">Daily limit</td>
                <td class="p-4 text-white font-medium">100/day</td>
                <td class="p-4 text-slate-400">Unlimited (self-hosted)</td>
                <td class="p-4 text-slate-400">5-50/day typical</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Setup time</td>
                <td class="p-4 text-white font-medium">30 seconds</td>
                <td class="p-4 text-slate-400">1-4 hours</td>
                <td class="p-4 text-slate-400">5-30 minutes</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Server required</td>
                <td class="p-4 text-emerald-400">No</td>
                <td class="p-4 text-slate-400">Yes</td>
                <td class="p-4 text-emerald-400">No</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Credit card</td>
                <td class="p-4 text-emerald-400">Not required</td>
                <td class="p-4 text-slate-400">N/A</td>
                <td class="p-4 text-slate-400">Often required</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">All formats</td>
                <td class="p-4 text-emerald-400">Yes</td>
                <td class="p-4 text-emerald-400">Yes</td>
                <td class="p-4 text-slate-400">Sometimes gated</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">All features</td>
                <td class="p-4 text-emerald-400">Yes</td>
                <td class="p-4 text-emerald-400">Yes (with code)</td>
                <td class="p-4 text-slate-400">Often gated</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Trial expiration</td>
                <td class="p-4 text-emerald-400">Never</td>
                <td class="p-4 text-slate-400">N/A</td>
                <td class="p-4 text-slate-400">7-30 days common</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Advanced features on free -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Advanced features, still free</h2>
        <p class="text-slate-300 leading-relaxed mb-6">
          Unlike many screenshot APIs that gate features behind paid plans, ShotAPI gives you
          everything on the free tier. Here are some parameters you can use right away:
        </p>

        <div class="rounded-xl bg-slate-900 border border-slate-800 p-4 overflow-x-auto mb-6">
          <pre class="text-sm"><code><span class="text-slate-500"># Full page screenshot in WebP with dark mode and ad blocking</span>
<span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?\\
  url=https://news.ycombinator.com&amp;\\
  format=webp&amp;\\
  full_page=true&amp;\\
  dark_mode=true&amp;\\
  block_ads=true&amp;\\
  viewport_width=1440&amp;\\
  access_key=YOUR_KEY"</span> \\
  <span class="text-slate-500">--output</span> hn-dark-full.webp</code></pre>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div class="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
            <code class="text-indigo-400 text-xs">full_page</code>
            <p class="text-slate-400 mt-1">Capture entire scrollable page</p>
          </div>
          <div class="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
            <code class="text-indigo-400 text-xs">dark_mode</code>
            <p class="text-slate-400 mt-1">Enable dark color scheme</p>
          </div>
          <div class="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
            <code class="text-indigo-400 text-xs">block_ads</code>
            <p class="text-slate-400 mt-1">Remove ads from capture</p>
          </div>
          <div class="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
            <code class="text-indigo-400 text-xs">selector</code>
            <p class="text-slate-400 mt-1">Target specific element</p>
          </div>
          <div class="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
            <code class="text-indigo-400 text-xs">viewport_width</code>
            <p class="text-slate-400 mt-1">Custom viewport size</p>
          </div>
          <div class="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
            <code class="text-indigo-400 text-xs">image_quality</code>
            <p class="text-slate-400 mt-1">Control compression</p>
          </div>
        </div>

        <p class="text-slate-400 text-sm mt-4">
          See the <a href="/docs" class="text-indigo-400 hover:text-indigo-300 transition">full documentation</a> for
          all available parameters.
        </p>
      </section>

      <!-- CTA -->
      <section class="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/50 to-slate-950 p-8 sm:p-12 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">Start capturing screenshots for free</h2>
        <p class="text-slate-400 mb-8 max-w-lg mx-auto">
          100 screenshots per day. All formats. All features. No credit card. No trial expiration.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/keys" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg text-lg font-medium transition">
            Get Free API Key
          </a>
          <a href="/pricing" class="w-full sm:w-auto border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-3 rounded-lg text-lg transition">
            View All Plans
          </a>
        </div>
      </section>

    </div>
  </article>`;
}
