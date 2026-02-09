export function landingPage(): string {
  return `
  <!-- Hero Section -->
  <section class="py-20 sm:py-28">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center">
      <div class="inline-block mb-6 px-4 py-1.5 rounded-full border border-slate-700 text-sm text-slate-300">
        ScreenshotOne-compatible API
      </div>
      <h1 class="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
        Screenshot API<br>
        <span class="text-indigo-400">for developers</span>
      </h1>
      <p class="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Capture any website as PNG, JPEG, WebP, or PDF with a single API call.
        Fast, affordable, and dead simple. Free tier included.
      </p>
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="/keys" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg text-lg font-medium transition">
          Get Free API Key
        </a>
        <a href="/docs" class="w-full sm:w-auto border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-3 rounded-lg text-lg transition">
          Read the Docs
        </a>
      </div>
    </div>
  </section>

  <!-- Live Demo / curl example -->
  <section class="py-16 border-t border-slate-800/50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <h2 class="text-center text-2xl sm:text-3xl font-bold text-white mb-4">Try it right now</h2>
      <p class="text-center text-slate-400 mb-8">No API key needed for basic usage. Just run this:</p>
      <div class="relative rounded-xl bg-slate-900 border border-slate-800 p-6 overflow-x-auto">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
          <span class="ml-3 text-xs text-slate-500 font-mono">Terminal</span>
        </div>
        <pre class="text-sm sm:text-base"><code><span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?url=https://example.com&format=png"</span> \\
  <span class="text-slate-500">--output</span> screenshot.png</code></pre>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section id="features" class="py-20 border-t border-slate-800/50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <h2 class="text-center text-2xl sm:text-3xl font-bold text-white mb-4">Everything you need</h2>
      <p class="text-center text-slate-400 mb-12 max-w-xl mx-auto">A screenshot API that just works. No browser management, no infrastructure headaches.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${featureCard(
          'Fast Capture',
          'Screenshots rendered in milliseconds using headless Chromium. Optimized for speed with smart caching.',
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />'
        )}
        ${featureCard(
          'Affordable',
          'Free tier with 100 screenshots/day. Paid plans from $9/mo. Up to 70% cheaper than alternatives.',
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
        )}
        ${featureCard(
          'ScreenshotOne Compatible',
          'Drop-in replacement for ScreenshotOne. Same parameter names, same behavior. Migrate in minutes.',
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />'
        )}
        ${featureCard(
          'Multiple Formats',
          'Export as PNG, JPEG, WebP, or PDF. Control quality, viewport size, and device scale factor.',
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />'
        )}
        ${featureCard(
          'Dark Mode',
          'Capture websites in dark mode with a single parameter. Perfect for showcasing dark-themed sites.',
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />'
        )}
        ${featureCard(
          'Full Page Capture',
          'Capture entire scrollable pages, specific CSS selectors, or just the visible viewport.',
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />'
        )}
      </div>
    </div>
  </section>

  <!-- Code Examples -->
  <section class="py-20 border-t border-slate-800/50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <h2 class="text-center text-2xl sm:text-3xl font-bold text-white mb-4">Works with any language</h2>
      <p class="text-center text-slate-400 mb-12">Simple REST API. No SDKs required.</p>

      <div class="space-y-6">
        <!-- curl -->
        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">curl</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?url=https://github.com&format=webp&viewport_width=1440&dark_mode=true"</span> \\
  <span class="text-slate-500">-H</span> <span class="text-amber-300">"Authorization: Bearer YOUR_API_KEY"</span> \\
  <span class="text-slate-500">--output</span> github-dark.webp</code></pre>
          </div>
        </div>

        <!-- Node.js -->
        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Node.js</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">const</span> <span class="text-sky-300">params</span> <span class="text-slate-400">=</span> <span class="text-violet-400">new</span> <span class="text-emerald-400">URLSearchParams</span><span class="text-slate-400">({</span>
  <span class="text-sky-300">url</span><span class="text-slate-400">:</span> <span class="text-amber-300">'https://github.com'</span><span class="text-slate-400">,</span>
  <span class="text-sky-300">format</span><span class="text-slate-400">:</span> <span class="text-amber-300">'png'</span><span class="text-slate-400">,</span>
  <span class="text-sky-300">viewport_width</span><span class="text-slate-400">:</span> <span class="text-amber-300">'1440'</span><span class="text-slate-400">,</span>
  <span class="text-sky-300">full_page</span><span class="text-slate-400">:</span> <span class="text-amber-300">'true'</span><span class="text-slate-400">,</span>
<span class="text-slate-400">});</span>

<span class="text-violet-400">const</span> <span class="text-sky-300">res</span> <span class="text-slate-400">=</span> <span class="text-violet-400">await</span> <span class="text-emerald-400">fetch</span><span class="text-slate-400">(</span><span class="text-amber-300">\`https://shotapi.io/take?\${params}\`</span><span class="text-slate-400">,</span> <span class="text-slate-400">{</span>
  <span class="text-sky-300">headers</span><span class="text-slate-400">:</span> <span class="text-slate-400">{</span> <span class="text-amber-300">'Authorization'</span><span class="text-slate-400">:</span> <span class="text-amber-300">'Bearer YOUR_API_KEY'</span> <span class="text-slate-400">}</span>
<span class="text-slate-400">});</span>

<span class="text-violet-400">const</span> <span class="text-sky-300">buffer</span> <span class="text-slate-400">=</span> <span class="text-violet-400">await</span> <span class="text-sky-300">res</span><span class="text-slate-400">.</span><span class="text-emerald-400">arrayBuffer</span><span class="text-slate-400">();</span>
<span class="text-emerald-400">fs</span><span class="text-slate-400">.</span><span class="text-emerald-400">writeFileSync</span><span class="text-slate-400">(</span><span class="text-amber-300">'screenshot.png'</span><span class="text-slate-400">,</span> <span class="text-emerald-400">Buffer</span><span class="text-slate-400">.</span><span class="text-emerald-400">from</span><span class="text-slate-400">(</span><span class="text-sky-300">buffer</span><span class="text-slate-400">));</span></code></pre>
          </div>
        </div>

        <!-- Python -->
        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Python</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">import</span> <span class="text-sky-300">requests</span>

<span class="text-sky-300">response</span> <span class="text-slate-400">=</span> <span class="text-sky-300">requests</span><span class="text-slate-400">.</span><span class="text-emerald-400">get</span><span class="text-slate-400">(</span>
    <span class="text-amber-300">"https://shotapi.io/take"</span><span class="text-slate-400">,</span>
    <span class="text-sky-300">params</span><span class="text-slate-400">={</span>
        <span class="text-amber-300">"url"</span><span class="text-slate-400">:</span> <span class="text-amber-300">"https://github.com"</span><span class="text-slate-400">,</span>
        <span class="text-amber-300">"format"</span><span class="text-slate-400">:</span> <span class="text-amber-300">"png"</span><span class="text-slate-400">,</span>
        <span class="text-amber-300">"viewport_width"</span><span class="text-slate-400">:</span> <span class="text-amber-300">"1440"</span><span class="text-slate-400">,</span>
    <span class="text-slate-400">},</span>
    <span class="text-sky-300">headers</span><span class="text-slate-400">={</span><span class="text-amber-300">"Authorization"</span><span class="text-slate-400">:</span> <span class="text-amber-300">"Bearer YOUR_API_KEY"</span><span class="text-slate-400">},</span>
<span class="text-slate-400">)</span>

<span class="text-violet-400">with</span> <span class="text-emerald-400">open</span><span class="text-slate-400">(</span><span class="text-amber-300">"screenshot.png"</span><span class="text-slate-400">,</span> <span class="text-amber-300">"wb"</span><span class="text-slate-400">)</span> <span class="text-violet-400">as</span> <span class="text-sky-300">f</span><span class="text-slate-400">:</span>
    <span class="text-sky-300">f</span><span class="text-slate-400">.</span><span class="text-emerald-400">write</span><span class="text-slate-400">(</span><span class="text-sky-300">response</span><span class="text-slate-400">.</span><span class="text-sky-300">content</span><span class="text-slate-400">)</span></code></pre>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing Table -->
  <section id="pricing" class="py-20 border-t border-slate-800/50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <h2 class="text-center text-2xl sm:text-3xl font-bold text-white mb-4">Simple, transparent pricing</h2>
      <p class="text-center text-slate-400 mb-12 max-w-xl mx-auto">Start free. Scale when you need to. No hidden fees, no contracts.</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Anonymous -->
        <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col">
          <h3 class="text-lg font-semibold text-white">Anonymous</h3>
          <div class="mt-4 mb-1">
            <span class="text-3xl font-bold text-white">Free</span>
          </div>
          <p class="text-sm text-slate-400 mb-6">No API key needed</p>
          <ul class="space-y-3 text-sm text-slate-300 mb-8 flex-1">
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> 10 screenshots/day</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> PNG, JPEG, WebP, PDF</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> All parameters</li>
          </ul>
          <a href="/take?url=https://example.com" class="block text-center border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition text-sm font-medium">Try it now</a>
        </div>

        <!-- Free -->
        <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col">
          <h3 class="text-lg font-semibold text-white">Free</h3>
          <div class="mt-4 mb-1">
            <span class="text-3xl font-bold text-white">$0</span>
            <span class="text-slate-500 text-sm">/mo</span>
          </div>
          <p class="text-sm text-slate-400 mb-6">With API key</p>
          <ul class="space-y-3 text-sm text-slate-300 mb-8 flex-1">
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> 100 screenshots/day</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> PNG, JPEG, WebP, PDF</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> All parameters</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> API key authentication</li>
          </ul>
          <a href="/keys" class="block text-center border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition text-sm font-medium">Get API Key</a>
        </div>

        <!-- Starter -->
        <div class="rounded-xl border-2 border-indigo-500 bg-slate-900/50 p-6 flex flex-col relative">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">Popular</div>
          <h3 class="text-lg font-semibold text-white">Starter</h3>
          <div class="mt-4 mb-1">
            <span class="text-3xl font-bold text-white">$9</span>
            <span class="text-slate-500 text-sm">/mo</span>
          </div>
          <p class="text-sm text-slate-400 mb-6">For growing projects</p>
          <ul class="space-y-3 text-sm text-slate-300 mb-8 flex-1">
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> 2,500 screenshots/day</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> PNG, JPEG, WebP, PDF</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> All parameters</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> Priority rendering</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> Email support</li>
          </ul>
          <a href="/keys" class="block text-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition text-sm font-medium">Get Started</a>
        </div>

        <!-- Pro -->
        <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col">
          <h3 class="text-lg font-semibold text-white">Pro</h3>
          <div class="mt-4 mb-1">
            <span class="text-3xl font-bold text-white">$29</span>
            <span class="text-slate-500 text-sm">/mo</span>
          </div>
          <p class="text-sm text-slate-400 mb-6">For high-volume apps</p>
          <ul class="space-y-3 text-sm text-slate-300 mb-8 flex-1">
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> 10,000 screenshots/day</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> PNG, JPEG, WebP, PDF</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> All parameters</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> Priority rendering</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> Priority support</li>
            <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> Custom viewport sizes</li>
          </ul>
          <a href="/keys" class="block text-center border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition text-sm font-medium">Get Started</a>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="py-20 border-t border-slate-800/50">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">
      <h2 class="text-center text-2xl sm:text-3xl font-bold text-white mb-12">Frequently asked questions</h2>

      <div class="space-y-4">
        <details class="group rounded-xl border border-slate-800 bg-slate-900/30">
          <summary class="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium">
            How does the free tier work?
            <span class="text-slate-500 group-open:rotate-45 transition-transform text-xl">+</span>
          </summary>
          <div class="px-6 pb-4 text-slate-400 text-sm leading-relaxed">
            Without an API key, you get 10 free screenshots per day (rate-limited by IP). Sign up for a free API key to get 100 screenshots per day. No credit card required.
          </div>
        </details>

        <details class="group rounded-xl border border-slate-800 bg-slate-900/30">
          <summary class="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium">
            Is ShotAPI compatible with ScreenshotOne?
            <span class="text-slate-500 group-open:rotate-45 transition-transform text-xl">+</span>
          </summary>
          <div class="px-6 pb-4 text-slate-400 text-sm leading-relaxed">
            Yes. ShotAPI uses the same parameter names and behavior as ScreenshotOne. If you are migrating from ScreenshotOne, you only need to change the base URL and API key. Your existing code should work as-is.
          </div>
        </details>

        <details class="group rounded-xl border border-slate-800 bg-slate-900/30">
          <summary class="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium">
            What formats are supported?
            <span class="text-slate-500 group-open:rotate-45 transition-transform text-xl">+</span>
          </summary>
          <div class="px-6 pb-4 text-slate-400 text-sm leading-relaxed">
            ShotAPI supports PNG, JPEG, WebP, and PDF output. You can control the quality for JPEG and WebP with the <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">image_quality</code> parameter (1-100).
          </div>
        </details>

        <details class="group rounded-xl border border-slate-800 bg-slate-900/30">
          <summary class="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium">
            Can I capture full-page screenshots?
            <span class="text-slate-500 group-open:rotate-45 transition-transform text-xl">+</span>
          </summary>
          <div class="px-6 pb-4 text-slate-400 text-sm leading-relaxed">
            Yes. Set <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">full_page=true</code> to capture the entire scrollable page. You can also target a specific element using the <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">selector</code> parameter with a CSS selector.
          </div>
        </details>

        <details class="group rounded-xl border border-slate-800 bg-slate-900/30">
          <summary class="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium">
            How fast are screenshots?
            <span class="text-slate-500 group-open:rotate-45 transition-transform text-xl">+</span>
          </summary>
          <div class="px-6 pb-4 text-slate-400 text-sm leading-relaxed">
            Most screenshots are returned in 1-3 seconds depending on the target site's complexity. We use headless Chromium with optimized settings to minimize capture time.
          </div>
        </details>

        <details class="group rounded-xl border border-slate-800 bg-slate-900/30">
          <summary class="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium">
            Do you block ads and cookie banners?
            <span class="text-slate-500 group-open:rotate-45 transition-transform text-xl">+</span>
          </summary>
          <div class="px-6 pb-4 text-slate-400 text-sm leading-relaxed">
            Yes. Use <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">block_ads=true</code> and <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">block_cookie_banners=true</code> to get clean screenshots without distracting overlays.
          </div>
        </details>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20 border-t border-slate-800/50">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
      <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">Start capturing screenshots today</h2>
      <p class="text-slate-400 mb-8 max-w-lg mx-auto">Free tier included. No credit card required. Get your API key in seconds.</p>
      <a href="/keys" class="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg text-lg font-medium transition">
        Get Free API Key
      </a>
    </div>
  </section>`;
}

function featureCard(title: string, description: string, iconPath: string): string {
  return `
    <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6 hover:border-slate-700 transition">
      <div class="w-10 h-10 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-4">
        <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${iconPath}
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-white mb-2">${title}</h3>
      <p class="text-sm text-slate-400 leading-relaxed">${description}</p>
    </div>`;
}
