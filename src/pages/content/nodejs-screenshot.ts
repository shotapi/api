export function nodejsScreenshot(): string {
  return `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to Take Screenshots in Node.js — The Complete Guide",
    "description": "Learn how to capture website screenshots in Node.js using ShotAPI, Puppeteer, and Playwright. Code examples included.",
    "author": { "@type": "Organization", "name": "ShotAPI" },
    "publisher": { "@type": "Organization", "name": "ShotAPI" },
    "mainEntityOfPage": "https://shotapi.io/guides/nodejs-screenshot"
  }
  </script>

  <article class="py-16 sm:py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">

      <!-- Breadcrumb -->
      <nav class="mb-8 text-sm text-slate-500">
        <a href="/" class="hover:text-slate-300 transition">Home</a>
        <span class="mx-2">/</span>
        <a href="/guides/nodejs-screenshot" class="hover:text-slate-300 transition">Guides</a>
        <span class="mx-2">/</span>
        <span class="text-slate-300">Node.js Screenshots</span>
      </nav>

      <h1 class="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
        How to Take Screenshots<br>
        <span class="text-indigo-400">in Node.js</span>
      </h1>

      <p class="text-lg text-slate-400 leading-relaxed mb-12 max-w-3xl">
        There are three main approaches to capturing website screenshots in Node.js: using a screenshot
        API like ShotAPI, running Puppeteer, or using Playwright. This guide covers all three with
        working code examples so you can choose the right one for your project.
      </p>

      <!-- Overview -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Three approaches compared</h2>
        <div class="overflow-x-auto rounded-xl border border-slate-800 mb-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-900/50 border-b border-slate-800">
                <th class="text-left p-4 text-slate-300 font-medium">Aspect</th>
                <th class="text-left p-4 text-indigo-400 font-medium">ShotAPI</th>
                <th class="text-left p-4 text-slate-400 font-medium">Puppeteer</th>
                <th class="text-left p-4 text-slate-400 font-medium">Playwright</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              <tr>
                <td class="p-4 text-slate-300">Setup</td>
                <td class="p-4 text-white font-medium">npm install not needed</td>
                <td class="p-4 text-slate-400">npm install + Chromium (~400MB)</td>
                <td class="p-4 text-slate-400">npm install + browsers (~600MB)</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Lines of code</td>
                <td class="p-4 text-white font-medium">5-8 lines</td>
                <td class="p-4 text-slate-400">15-25 lines</td>
                <td class="p-4 text-slate-400">15-25 lines</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Browser management</td>
                <td class="p-4 text-white font-medium">Managed for you</td>
                <td class="p-4 text-slate-400">You manage it</td>
                <td class="p-4 text-slate-400">You manage it</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Deployment</td>
                <td class="p-4 text-white font-medium">Works everywhere</td>
                <td class="p-4 text-slate-400">Needs Chromium in container</td>
                <td class="p-4 text-slate-400">Needs browser in container</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Browser automation</td>
                <td class="p-4 text-slate-400">No</td>
                <td class="p-4 text-white font-medium">Full (Chromium)</td>
                <td class="p-4 text-white font-medium">Full (multi-browser)</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Cost</td>
                <td class="p-4 text-white font-medium">Free tier (100/day)</td>
                <td class="p-4 text-slate-400">Free (+ hosting costs)</td>
                <td class="p-4 text-slate-400">Free (+ hosting costs)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Approach 1: ShotAPI -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-2">Approach 1: ShotAPI (recommended for most projects)</h2>
        <p class="text-slate-400 text-sm mb-6">Best for: production apps, serverless, minimal code</p>

        <p class="text-slate-300 leading-relaxed mb-6">
          ShotAPI is a hosted screenshot service. You make an HTTP request with the target URL
          and parameters, and get back an image. No browser to install, no infrastructure to manage.
          It works with native <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">fetch</code>
          in Node.js 18+ or any HTTP library.
        </p>

        <div class="rounded-xl bg-slate-900 border border-indigo-500/30 overflow-hidden mb-4">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-indigo-400">ShotAPI — Node.js (using native fetch)</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">import</span> { writeFile } <span class="text-violet-400">from</span> <span class="text-amber-300">'node:fs/promises'</span>;

<span class="text-violet-400">const</span> params = <span class="text-violet-400">new</span> URLSearchParams({
  url: <span class="text-amber-300">'https://github.com'</span>,
  format: <span class="text-amber-300">'png'</span>,
  viewport_width: <span class="text-amber-300">'1280'</span>,
  viewport_height: <span class="text-amber-300">'720'</span>,
});

<span class="text-violet-400">const</span> response = <span class="text-violet-400">await</span> fetch(<span class="text-amber-300">\`https://shotapi.io/take?\${params}\`</span>, {
  headers: { <span class="text-amber-300">'Authorization'</span>: <span class="text-amber-300">\`Bearer \${process.env.SHOTAPI_KEY}\`</span> },
});

<span class="text-violet-400">const</span> buffer = Buffer.from(<span class="text-violet-400">await</span> response.arrayBuffer());
<span class="text-violet-400">await</span> writeFile(<span class="text-amber-300">'screenshot.png'</span>, buffer);
console.log(<span class="text-amber-300">'Screenshot saved!'</span>);</code></pre>
          </div>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-sm">
          <p class="text-slate-300"><strong class="text-white">Why choose this:</strong>
            No dependencies to install. No browser to manage. Works on serverless platforms (Vercel, AWS Lambda,
            Cloudflare Workers) where running Chromium is either impossible or extremely complex.
            The free tier gives you 100 screenshots per day.
          </p>
        </div>
      </section>

      <!-- Approach 2: Puppeteer -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-2">Approach 2: Puppeteer</h2>
        <p class="text-slate-400 text-sm mb-6">Best for: automation tasks, E2E testing, private URLs</p>

        <p class="text-slate-300 leading-relaxed mb-6">
          Puppeteer is Google's official Node.js library for controlling headless Chromium. It gives you
          full browser automation capabilities, which means you can interact with pages before capturing them.
        </p>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mb-4">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Install</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-emerald-400">npm</span> install puppeteer
<span class="text-slate-500"># Downloads Chromium (~170MB) automatically</span></code></pre>
          </div>
        </div>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mb-4">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Puppeteer — screenshot.mjs</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">import</span> puppeteer <span class="text-violet-400">from</span> <span class="text-amber-300">'puppeteer'</span>;

<span class="text-violet-400">const</span> browser = <span class="text-violet-400">await</span> puppeteer.launch({
  headless: <span class="text-amber-300">'new'</span>,
});

<span class="text-violet-400">const</span> page = <span class="text-violet-400">await</span> browser.newPage();
<span class="text-violet-400">await</span> page.setViewport({ width: <span class="text-amber-300">1280</span>, height: <span class="text-amber-300">720</span> });

<span class="text-violet-400">await</span> page.goto(<span class="text-amber-300">'https://github.com'</span>, {
  waitUntil: <span class="text-amber-300">'networkidle0'</span>,
});

<span class="text-violet-400">await</span> page.screenshot({
  path: <span class="text-amber-300">'screenshot.png'</span>,
  type: <span class="text-amber-300">'png'</span>,
});

<span class="text-violet-400">await</span> browser.close();
console.log(<span class="text-amber-300">'Screenshot saved!'</span>);</code></pre>
          </div>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-sm">
          <p class="text-slate-300"><strong class="text-white">Why choose this:</strong>
            Full browser automation. You can click buttons, fill forms, wait for animations, and interact
            with the page before capturing. Works with localhost and private URLs. Essential for E2E testing pipelines.
          </p>
        </div>

        <div class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm mt-4">
          <p class="text-amber-200"><strong>Watch out for:</strong>
            Puppeteer downloads Chromium, which adds ~400MB to your project. In Docker, you need
            additional system libraries (fonts, libX11, etc.). Memory leaks are common without careful
            browser lifecycle management. Not suitable for serverless environments.
          </p>
        </div>
      </section>

      <!-- Approach 3: Playwright -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-2">Approach 3: Playwright</h2>
        <p class="text-slate-400 text-sm mb-6">Best for: cross-browser testing, advanced automation</p>

        <p class="text-slate-300 leading-relaxed mb-6">
          Playwright is Microsoft's browser automation library. It supports Chromium, Firefox, and WebKit,
          making it ideal when you need cross-browser screenshot consistency. The API is similar to Puppeteer
          but with some ergonomic improvements.
        </p>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mb-4">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Install</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-emerald-400">npm</span> install playwright
<span class="text-emerald-400">npx</span> playwright install chromium
<span class="text-slate-500"># Or install all browsers: npx playwright install</span></code></pre>
          </div>
        </div>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mb-4">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Playwright — screenshot.mjs</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">import</span> { chromium } <span class="text-violet-400">from</span> <span class="text-amber-300">'playwright'</span>;

<span class="text-violet-400">const</span> browser = <span class="text-violet-400">await</span> chromium.launch();
<span class="text-violet-400">const</span> context = <span class="text-violet-400">await</span> browser.newContext({
  viewport: { width: <span class="text-amber-300">1280</span>, height: <span class="text-amber-300">720</span> },
});

<span class="text-violet-400">const</span> page = <span class="text-violet-400">await</span> context.newPage();
<span class="text-violet-400">await</span> page.goto(<span class="text-amber-300">'https://github.com'</span>, {
  waitUntil: <span class="text-amber-300">'networkidle'</span>,
});

<span class="text-violet-400">await</span> page.screenshot({
  path: <span class="text-amber-300">'screenshot.png'</span>,
  type: <span class="text-amber-300">'png'</span>,
});

<span class="text-violet-400">await</span> browser.close();
console.log(<span class="text-amber-300">'Screenshot saved!'</span>);</code></pre>
          </div>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-sm">
          <p class="text-slate-300"><strong class="text-white">Why choose this:</strong>
            Multi-browser support out of the box. Better auto-wait mechanisms than Puppeteer.
            More reliable in CI/CD environments. Actively maintained by Microsoft. If you already use
            Playwright for testing, reuse it for screenshots.
          </p>
        </div>
      </section>

      <!-- When to use which -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">When to use which approach</h2>

        <div class="space-y-4">
          <div class="rounded-xl border border-indigo-500/30 bg-slate-900/30 p-6">
            <h3 class="text-indigo-400 font-semibold mb-2">Choose ShotAPI when...</h3>
            <ul class="space-y-2 text-sm text-slate-300">
              <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> You need screenshots of public websites</li>
              <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> You are deploying to serverless (Vercel, Lambda, Workers)</li>
              <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> You want zero dependencies and minimal code</li>
              <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> You are building thumbnails, OG images, or previews</li>
              <li class="flex items-start gap-2"><span class="text-indigo-400 mt-0.5">&#10003;</span> You do not want to manage browser infrastructure</li>
            </ul>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Choose Puppeteer when...</h3>
            <ul class="space-y-2 text-sm text-slate-300">
              <li class="flex items-start gap-2"><span class="text-slate-500 mt-0.5">&#10003;</span> You need to interact with pages before screenshotting</li>
              <li class="flex items-start gap-2"><span class="text-slate-500 mt-0.5">&#10003;</span> You are capturing localhost or private/authenticated pages</li>
              <li class="flex items-start gap-2"><span class="text-slate-500 mt-0.5">&#10003;</span> Screenshots are part of your E2E test suite</li>
              <li class="flex items-start gap-2"><span class="text-slate-500 mt-0.5">&#10003;</span> You only need Chromium support</li>
            </ul>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Choose Playwright when...</h3>
            <ul class="space-y-2 text-sm text-slate-300">
              <li class="flex items-start gap-2"><span class="text-slate-500 mt-0.5">&#10003;</span> You need cross-browser screenshots (Chrome, Firefox, Safari)</li>
              <li class="flex items-start gap-2"><span class="text-slate-500 mt-0.5">&#10003;</span> You already use Playwright for testing</li>
              <li class="flex items-start gap-2"><span class="text-slate-500 mt-0.5">&#10003;</span> You need advanced automation with better auto-waiting</li>
              <li class="flex items-start gap-2"><span class="text-slate-500 mt-0.5">&#10003;</span> You are running in CI/CD and need reliability</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Advanced: error handling -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Production-ready: error handling with ShotAPI</h2>
        <p class="text-slate-300 leading-relaxed mb-6">
          Here is a more complete example with proper error handling, retries, and TypeScript types:
        </p>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">screenshot.ts — production-ready</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">import</span> { writeFile } <span class="text-violet-400">from</span> <span class="text-amber-300">'node:fs/promises'</span>;

<span class="text-violet-400">interface</span> ScreenshotOptions {
  url: <span class="text-sky-300">string</span>;
  format?: <span class="text-amber-300">'png'</span> | <span class="text-amber-300">'jpeg'</span> | <span class="text-amber-300">'webp'</span> | <span class="text-amber-300">'pdf'</span>;
  width?: <span class="text-sky-300">number</span>;
  height?: <span class="text-sky-300">number</span>;
  fullPage?: <span class="text-sky-300">boolean</span>;
}

<span class="text-violet-400">async function</span> <span class="text-emerald-400">takeScreenshot</span>(options: ScreenshotOptions): Promise&lt;Buffer&gt; {
  <span class="text-violet-400">const</span> params = <span class="text-violet-400">new</span> URLSearchParams({
    url: options.url,
    format: options.format ?? <span class="text-amber-300">'png'</span>,
    viewport_width: String(options.width ?? <span class="text-amber-300">1280</span>),
    viewport_height: String(options.height ?? <span class="text-amber-300">720</span>),
    ...(options.fullPage &amp;&amp; { full_page: <span class="text-amber-300">'true'</span> }),
  });

  <span class="text-violet-400">const</span> response = <span class="text-violet-400">await</span> fetch(
    <span class="text-amber-300">\`https://shotapi.io/take?\${params}\`</span>,
    {
      headers: {
        <span class="text-amber-300">'Authorization'</span>: <span class="text-amber-300">\`Bearer \${process.env.SHOTAPI_KEY}\`</span>,
      },
    }
  );

  <span class="text-violet-400">if</span> (!response.ok) {
    <span class="text-violet-400">throw new</span> Error(
      <span class="text-amber-300">\`Screenshot failed: \${response.status} \${response.statusText}\`</span>
    );
  }

  <span class="text-violet-400">return</span> Buffer.from(<span class="text-violet-400">await</span> response.arrayBuffer());
}

<span class="text-slate-500">// Usage</span>
<span class="text-violet-400">const</span> image = <span class="text-violet-400">await</span> takeScreenshot({
  url: <span class="text-amber-300">'https://github.com'</span>,
  format: <span class="text-amber-300">'webp'</span>,
  width: <span class="text-amber-300">1440</span>,
});

<span class="text-violet-400">await</span> writeFile(<span class="text-amber-300">'github.webp'</span>, image);</code></pre>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/50 to-slate-950 p-8 sm:p-12 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">Start taking screenshots in Node.js</h2>
        <p class="text-slate-400 mb-8 max-w-lg mx-auto">
          Get a free API key and capture your first screenshot in under a minute.
          No dependencies, no browser installation, no Docker configuration.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/keys" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg text-lg font-medium transition">
            Get Free API Key
          </a>
          <a href="/docs" class="w-full sm:w-auto border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-3 rounded-lg text-lg transition">
            Full API Reference
          </a>
        </div>
      </section>

    </div>
  </article>`;
}
