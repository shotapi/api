export function docsPage(): string {
  return `
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-16">
    <h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">API Documentation</h1>
    <p class="text-lg text-slate-400 mb-12">Everything you need to capture screenshots with ShotAPI.</p>

    <!-- Table of Contents -->
    <nav class="rounded-xl border border-slate-800 bg-slate-900/30 p-6 mb-12">
      <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">On this page</h2>
      <ul class="space-y-2 text-sm">
        <li><a href="#quick-start" class="text-indigo-400 hover:text-indigo-300 transition">Quick Start</a></li>
        <li><a href="#authentication" class="text-indigo-400 hover:text-indigo-300 transition">Authentication</a></li>
        <li><a href="#parameters" class="text-indigo-400 hover:text-indigo-300 transition">Parameters</a></li>
        <li><a href="#response" class="text-indigo-400 hover:text-indigo-300 transition">Response</a></li>
        <li><a href="#error-codes" class="text-indigo-400 hover:text-indigo-300 transition">Error Codes</a></li>
        <li><a href="#rate-limits" class="text-indigo-400 hover:text-indigo-300 transition">Rate Limits</a></li>
        <li><a href="#examples" class="text-indigo-400 hover:text-indigo-300 transition">Code Examples</a></li>
      </ul>
    </nav>

    <!-- Quick Start -->
    <section id="quick-start" class="mb-16">
      <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span class="text-indigo-400">#</span> Quick Start
      </h2>
      <p class="text-slate-400 mb-6">Take a screenshot with a single HTTP request. No API key needed for basic usage:</p>

      <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <span class="text-sm font-medium text-slate-300">curl</span>
        </div>
        <div class="p-4 overflow-x-auto">
          <pre class="text-sm"><code><span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?url=https://example.com&format=png"</span> \\
  <span class="text-slate-500">--output</span> screenshot.png</code></pre>
        </div>
      </div>

      <p class="text-slate-400 mt-4">
        The base URL for all API requests is: <code class="bg-slate-800 px-2 py-1 rounded text-sm text-slate-300">https://shotapi.io/take</code>
      </p>
    </section>

    <!-- Authentication -->
    <section id="authentication" class="mb-16">
      <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span class="text-indigo-400">#</span> Authentication
      </h2>
      <p class="text-slate-400 mb-6">
        ShotAPI supports multiple authentication methods. Anonymous requests are limited to 10/day.
        Sign up for a free API key to get 100/day.
      </p>

      <div class="space-y-4">
        <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Query parameter: <code class="text-indigo-400">access_key</code></h3>
          <div class="rounded-lg bg-slate-900 border border-slate-800 p-3 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?access_key=YOUR_API_KEY&url=https://example.com"</span></code></pre>
          </div>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Query parameter: <code class="text-indigo-400">api_key</code></h3>
          <div class="rounded-lg bg-slate-900 border border-slate-800 p-3 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?api_key=YOUR_API_KEY&url=https://example.com"</span></code></pre>
          </div>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Header: <code class="text-indigo-400">Authorization: Bearer</code></h3>
          <div class="rounded-lg bg-slate-900 border border-slate-800 p-3 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?url=https://example.com"</span> \\
  <span class="text-slate-500">-H</span> <span class="text-amber-300">"Authorization: Bearer YOUR_API_KEY"</span></code></pre>
          </div>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Header: <code class="text-indigo-400">X-Api-Key</code></h3>
          <div class="rounded-lg bg-slate-900 border border-slate-800 p-3 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?url=https://example.com"</span> \\
  <span class="text-slate-500">-H</span> <span class="text-amber-300">"X-Api-Key: YOUR_API_KEY"</span></code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- Parameters -->
    <section id="parameters" class="mb-16">
      <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span class="text-indigo-400">#</span> Parameters
      </h2>
      <p class="text-slate-400 mb-6">All parameters are passed as query string parameters on the <code class="bg-slate-800 px-2 py-1 rounded text-sm text-slate-300">/take</code> endpoint.</p>

      <div class="rounded-xl border border-slate-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-900/50">
                <th class="text-left py-3 px-4 text-slate-300 font-semibold">Parameter</th>
                <th class="text-left py-3 px-4 text-slate-300 font-semibold">Type</th>
                <th class="text-left py-3 px-4 text-slate-300 font-semibold">Default</th>
                <th class="text-left py-3 px-4 text-slate-300 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              <tr class="bg-slate-900/20">
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">url</code><span class="ml-1 text-xs text-red-400">required</span></td>
                <td class="py-3 px-4 text-slate-400">string</td>
                <td class="py-3 px-4 text-slate-500">&mdash;</td>
                <td class="py-3 px-4 text-slate-300">The URL of the website to capture. Must be a valid URL with protocol.</td>
              </tr>
              <tr>
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">format</code></td>
                <td class="py-3 px-4 text-slate-400">string</td>
                <td class="py-3 px-4 text-slate-500">png</td>
                <td class="py-3 px-4 text-slate-300">Output format: <code class="bg-slate-800 px-1 py-0.5 rounded text-xs">png</code>, <code class="bg-slate-800 px-1 py-0.5 rounded text-xs">jpeg</code>, <code class="bg-slate-800 px-1 py-0.5 rounded text-xs">webp</code>, or <code class="bg-slate-800 px-1 py-0.5 rounded text-xs">pdf</code>.</td>
              </tr>
              <tr class="bg-slate-900/20">
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">viewport_width</code></td>
                <td class="py-3 px-4 text-slate-400">number</td>
                <td class="py-3 px-4 text-slate-500">1280</td>
                <td class="py-3 px-4 text-slate-300">Browser viewport width in pixels.</td>
              </tr>
              <tr>
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">viewport_height</code></td>
                <td class="py-3 px-4 text-slate-400">number</td>
                <td class="py-3 px-4 text-slate-500">1024</td>
                <td class="py-3 px-4 text-slate-300">Browser viewport height in pixels.</td>
              </tr>
              <tr class="bg-slate-900/20">
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">device_scale_factor</code></td>
                <td class="py-3 px-4 text-slate-400">number</td>
                <td class="py-3 px-4 text-slate-500">1</td>
                <td class="py-3 px-4 text-slate-300">Device pixel ratio. Use 2 for Retina-quality screenshots.</td>
              </tr>
              <tr>
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">full_page</code></td>
                <td class="py-3 px-4 text-slate-400">boolean</td>
                <td class="py-3 px-4 text-slate-500">false</td>
                <td class="py-3 px-4 text-slate-300">Capture the full scrollable page, not just the viewport.</td>
              </tr>
              <tr class="bg-slate-900/20">
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">selector</code></td>
                <td class="py-3 px-4 text-slate-400">string</td>
                <td class="py-3 px-4 text-slate-500">&mdash;</td>
                <td class="py-3 px-4 text-slate-300">CSS selector to capture a specific element instead of the full page.</td>
              </tr>
              <tr>
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">image_quality</code></td>
                <td class="py-3 px-4 text-slate-400">number</td>
                <td class="py-3 px-4 text-slate-500">80</td>
                <td class="py-3 px-4 text-slate-300">Image quality (1-100). Only applies to JPEG and WebP formats.</td>
              </tr>
              <tr class="bg-slate-900/20">
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">delay</code></td>
                <td class="py-3 px-4 text-slate-400">number</td>
                <td class="py-3 px-4 text-slate-500">0</td>
                <td class="py-3 px-4 text-slate-300">Wait time in milliseconds before taking the screenshot. Useful for pages with animations.</td>
              </tr>
              <tr>
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">dark_mode</code></td>
                <td class="py-3 px-4 text-slate-400">boolean</td>
                <td class="py-3 px-4 text-slate-500">false</td>
                <td class="py-3 px-4 text-slate-300">Emulate dark color scheme (prefers-color-scheme: dark).</td>
              </tr>
              <tr class="bg-slate-900/20">
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">block_ads</code></td>
                <td class="py-3 px-4 text-slate-400">boolean</td>
                <td class="py-3 px-4 text-slate-500">false</td>
                <td class="py-3 px-4 text-slate-300">Block advertisements from loading in the page.</td>
              </tr>
              <tr>
                <td class="py-3 px-4"><code class="text-indigo-400 font-medium">block_cookie_banners</code></td>
                <td class="py-3 px-4 text-slate-400">boolean</td>
                <td class="py-3 px-4 text-slate-500">false</td>
                <td class="py-3 px-4 text-slate-300">Block cookie consent banners from appearing.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Response -->
    <section id="response" class="mb-16">
      <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span class="text-indigo-400">#</span> Response
      </h2>
      <p class="text-slate-400 mb-6">Successful requests return the screenshot as binary data with the appropriate content type.</p>

      <div class="space-y-4">
        <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
          <h3 class="text-sm font-semibold text-white mb-3">Content Types</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-800">
                  <th class="text-left py-2 px-3 text-slate-300 font-semibold">Format</th>
                  <th class="text-left py-2 px-3 text-slate-300 font-semibold">Content-Type</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                <tr><td class="py-2 px-3 text-slate-300">png</td><td class="py-2 px-3"><code class="text-indigo-400">image/png</code></td></tr>
                <tr><td class="py-2 px-3 text-slate-300">jpeg</td><td class="py-2 px-3"><code class="text-indigo-400">image/jpeg</code></td></tr>
                <tr><td class="py-2 px-3 text-slate-300">webp</td><td class="py-2 px-3"><code class="text-indigo-400">image/webp</code></td></tr>
                <tr><td class="py-2 px-3 text-slate-300">pdf</td><td class="py-2 px-3"><code class="text-indigo-400">application/pdf</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
          <h3 class="text-sm font-semibold text-white mb-3">Response Headers</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-800">
                  <th class="text-left py-2 px-3 text-slate-300 font-semibold">Header</th>
                  <th class="text-left py-2 px-3 text-slate-300 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                <tr>
                  <td class="py-2 px-3"><code class="text-indigo-400">Content-Type</code></td>
                  <td class="py-2 px-3 text-slate-300">MIME type of the returned image/PDF</td>
                </tr>
                <tr>
                  <td class="py-2 px-3"><code class="text-indigo-400">X-RateLimit-Limit</code></td>
                  <td class="py-2 px-3 text-slate-300">Maximum requests allowed per day</td>
                </tr>
                <tr>
                  <td class="py-2 px-3"><code class="text-indigo-400">X-RateLimit-Remaining</code></td>
                  <td class="py-2 px-3 text-slate-300">Remaining requests for the current day</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- Error Codes -->
    <section id="error-codes" class="mb-16">
      <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span class="text-indigo-400">#</span> Error Codes
      </h2>
      <p class="text-slate-400 mb-6">Errors are returned as JSON with a <code class="bg-slate-800 px-2 py-1 rounded text-sm text-slate-300">message</code> field.</p>

      <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
        <div class="rounded-lg bg-slate-900 border border-slate-800 p-3 mb-4 overflow-x-auto">
          <pre class="text-sm"><code><span class="text-slate-400">{</span> <span class="text-amber-300">"error"</span><span class="text-slate-400">:</span> <span class="text-amber-300">"url parameter is required"</span> <span class="text-slate-400">}</span></code></pre>
        </div>
      </div>

      <div class="rounded-xl border border-slate-800 overflow-hidden mt-4">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-900/50">
                <th class="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                <th class="text-left py-3 px-4 text-slate-300 font-semibold">Meaning</th>
                <th class="text-left py-3 px-4 text-slate-300 font-semibold">Common Cause</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              <tr>
                <td class="py-3 px-4"><code class="text-amber-400">400</code></td>
                <td class="py-3 px-4 text-slate-300">Bad Request</td>
                <td class="py-3 px-4 text-slate-400">Missing or invalid <code class="bg-slate-800 px-1 py-0.5 rounded text-xs">url</code> parameter</td>
              </tr>
              <tr class="bg-slate-900/20">
                <td class="py-3 px-4"><code class="text-amber-400">401</code></td>
                <td class="py-3 px-4 text-slate-300">Unauthorized</td>
                <td class="py-3 px-4 text-slate-400">Invalid or expired API key</td>
              </tr>
              <tr>
                <td class="py-3 px-4"><code class="text-amber-400">429</code></td>
                <td class="py-3 px-4 text-slate-300">Too Many Requests</td>
                <td class="py-3 px-4 text-slate-400">Rate limit exceeded for your plan</td>
              </tr>
              <tr class="bg-slate-900/20">
                <td class="py-3 px-4"><code class="text-red-400">500</code></td>
                <td class="py-3 px-4 text-slate-300">Internal Error</td>
                <td class="py-3 px-4 text-slate-400">Screenshot capture failed (target site issue or timeout)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Rate Limits -->
    <section id="rate-limits" class="mb-16">
      <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span class="text-indigo-400">#</span> Rate Limits
      </h2>
      <p class="text-slate-400 mb-6">Rate limits are applied per day and reset at midnight UTC.</p>

      <div class="rounded-xl border border-slate-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-900/50">
                <th class="text-left py-3 px-4 text-slate-300 font-semibold">Plan</th>
                <th class="text-left py-3 px-4 text-slate-300 font-semibold">Daily Limit</th>
                <th class="text-left py-3 px-4 text-slate-300 font-semibold">Authentication</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              <tr>
                <td class="py-3 px-4 text-slate-300">Anonymous</td>
                <td class="py-3 px-4 text-slate-300">10 / day</td>
                <td class="py-3 px-4 text-slate-400">None (IP-based)</td>
              </tr>
              <tr class="bg-slate-900/20">
                <td class="py-3 px-4 text-slate-300">Free</td>
                <td class="py-3 px-4 text-slate-300">100 / day</td>
                <td class="py-3 px-4 text-slate-400">API key required</td>
              </tr>
              <tr>
                <td class="py-3 px-4 text-slate-300">Starter ($9/mo)</td>
                <td class="py-3 px-4 text-slate-300">2,500 / day</td>
                <td class="py-3 px-4 text-slate-400">API key required</td>
              </tr>
              <tr class="bg-slate-900/20">
                <td class="py-3 px-4 text-slate-300">Pro ($29/mo)</td>
                <td class="py-3 px-4 text-slate-300">10,000 / day</td>
                <td class="py-3 px-4 text-slate-400">API key required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p class="text-slate-400 mt-4 text-sm">
        Check the <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">X-RateLimit-Remaining</code> response header to monitor your usage.
      </p>
    </section>

    <!-- Code Examples -->
    <section id="examples" class="mb-16">
      <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span class="text-indigo-400">#</span> Code Examples
      </h2>
      <p class="text-slate-400 mb-6">Copy-paste examples for common languages.</p>

      <div class="space-y-6">
        <!-- curl -->
        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">curl</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-slate-500"># Basic screenshot</span>
<span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?url=https://example.com"</span> <span class="text-slate-500">--output</span> shot.png

<span class="text-slate-500"># Full page, WebP, dark mode, with auth</span>
<span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?url=https://github.com&format=webp&full_page=true&dark_mode=true"</span> \\
  <span class="text-slate-500">-H</span> <span class="text-amber-300">"Authorization: Bearer YOUR_API_KEY"</span> \\
  <span class="text-slate-500">--output</span> github.webp

<span class="text-slate-500"># Specific element with custom viewport</span>
<span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?url=https://example.com&selector=.main-content&viewport_width=1440&viewport_height=900"</span> \\
  <span class="text-slate-500">-H</span> <span class="text-amber-300">"X-Api-Key: YOUR_API_KEY"</span> \\
  <span class="text-slate-500">--output</span> element.png</code></pre>
          </div>
        </div>

        <!-- Node.js -->
        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Node.js (fetch)</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">import</span> <span class="text-sky-300">fs</span> <span class="text-violet-400">from</span> <span class="text-amber-300">'node:fs'</span><span class="text-slate-400">;</span>

<span class="text-violet-400">const</span> <span class="text-sky-300">params</span> <span class="text-slate-400">=</span> <span class="text-violet-400">new</span> <span class="text-emerald-400">URLSearchParams</span><span class="text-slate-400">({</span>
  <span class="text-sky-300">url</span><span class="text-slate-400">:</span> <span class="text-amber-300">'https://github.com'</span><span class="text-slate-400">,</span>
  <span class="text-sky-300">format</span><span class="text-slate-400">:</span> <span class="text-amber-300">'png'</span><span class="text-slate-400">,</span>
  <span class="text-sky-300">viewport_width</span><span class="text-slate-400">:</span> <span class="text-amber-300">'1440'</span><span class="text-slate-400">,</span>
  <span class="text-sky-300">full_page</span><span class="text-slate-400">:</span> <span class="text-amber-300">'true'</span><span class="text-slate-400">,</span>
<span class="text-slate-400">});</span>

<span class="text-violet-400">const</span> <span class="text-sky-300">response</span> <span class="text-slate-400">=</span> <span class="text-violet-400">await</span> <span class="text-emerald-400">fetch</span><span class="text-slate-400">(</span>
  <span class="text-amber-300">\`https://shotapi.io/take?\${params}\`</span><span class="text-slate-400">,</span>
  <span class="text-slate-400">{</span> <span class="text-sky-300">headers</span><span class="text-slate-400">:</span> <span class="text-slate-400">{</span> <span class="text-amber-300">'Authorization'</span><span class="text-slate-400">:</span> <span class="text-amber-300">'Bearer YOUR_API_KEY'</span> <span class="text-slate-400">}</span> <span class="text-slate-400">}</span>
<span class="text-slate-400">);</span>

<span class="text-violet-400">const</span> <span class="text-sky-300">buffer</span> <span class="text-slate-400">=</span> <span class="text-violet-400">await</span> <span class="text-sky-300">response</span><span class="text-slate-400">.</span><span class="text-emerald-400">arrayBuffer</span><span class="text-slate-400">();</span>
<span class="text-sky-300">fs</span><span class="text-slate-400">.</span><span class="text-emerald-400">writeFileSync</span><span class="text-slate-400">(</span><span class="text-amber-300">'screenshot.png'</span><span class="text-slate-400">,</span> <span class="text-emerald-400">Buffer</span><span class="text-slate-400">.</span><span class="text-emerald-400">from</span><span class="text-slate-400">(</span><span class="text-sky-300">buffer</span><span class="text-slate-400">));</span></code></pre>
          </div>
        </div>

        <!-- Python -->
        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Python (requests)</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">import</span> <span class="text-sky-300">requests</span>

<span class="text-sky-300">response</span> <span class="text-slate-400">=</span> <span class="text-sky-300">requests</span><span class="text-slate-400">.</span><span class="text-emerald-400">get</span><span class="text-slate-400">(</span>
    <span class="text-amber-300">"https://shotapi.io/take"</span><span class="text-slate-400">,</span>
    <span class="text-sky-300">params</span><span class="text-slate-400">={</span>
        <span class="text-amber-300">"url"</span><span class="text-slate-400">:</span> <span class="text-amber-300">"https://github.com"</span><span class="text-slate-400">,</span>
        <span class="text-amber-300">"format"</span><span class="text-slate-400">:</span> <span class="text-amber-300">"png"</span><span class="text-slate-400">,</span>
        <span class="text-amber-300">"viewport_width"</span><span class="text-slate-400">:</span> <span class="text-amber-300">"1440"</span><span class="text-slate-400">,</span>
        <span class="text-amber-300">"full_page"</span><span class="text-slate-400">:</span> <span class="text-amber-300">"true"</span><span class="text-slate-400">,</span>
    <span class="text-slate-400">},</span>
    <span class="text-sky-300">headers</span><span class="text-slate-400">={</span><span class="text-amber-300">"Authorization"</span><span class="text-slate-400">:</span> <span class="text-amber-300">"Bearer YOUR_API_KEY"</span><span class="text-slate-400">},</span>
<span class="text-slate-400">)</span>

<span class="text-sky-300">response</span><span class="text-slate-400">.</span><span class="text-emerald-400">raise_for_status</span><span class="text-slate-400">()</span>

<span class="text-violet-400">with</span> <span class="text-emerald-400">open</span><span class="text-slate-400">(</span><span class="text-amber-300">"screenshot.png"</span><span class="text-slate-400">,</span> <span class="text-amber-300">"wb"</span><span class="text-slate-400">)</span> <span class="text-violet-400">as</span> <span class="text-sky-300">f</span><span class="text-slate-400">:</span>
    <span class="text-sky-300">f</span><span class="text-slate-400">.</span><span class="text-emerald-400">write</span><span class="text-slate-400">(</span><span class="text-sky-300">response</span><span class="text-slate-400">.</span><span class="text-sky-300">content</span><span class="text-slate-400">)</span></code></pre>
          </div>
        </div>
      </div>
    </section>

  </div>`;
}
