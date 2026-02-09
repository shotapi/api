export function websiteThumbnails(): string {
  return `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Website Thumbnail API — Generate Previews at Scale",
    "description": "Generate website thumbnails and previews at scale. Perfect for directories, link aggregators, and portfolio sites.",
    "author": { "@type": "Organization", "name": "ShotAPI" },
    "publisher": { "@type": "Organization", "name": "ShotAPI" },
    "mainEntityOfPage": "https://shotapi.io/use-cases/website-thumbnails"
  }
  </script>

  <article class="py-16 sm:py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">

      <!-- Breadcrumb -->
      <nav class="mb-8 text-sm text-slate-500">
        <a href="/" class="hover:text-slate-300 transition">Home</a>
        <span class="mx-2">/</span>
        <a href="/use-cases/website-thumbnails" class="hover:text-slate-300 transition">Use Cases</a>
        <span class="mx-2">/</span>
        <span class="text-slate-300">Website Thumbnails</span>
      </nav>

      <h1 class="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
        Website Thumbnail API<br>
        <span class="text-indigo-400">Generate Previews at Scale</span>
      </h1>

      <p class="text-lg text-slate-400 leading-relaxed mb-12 max-w-3xl">
        Building a link directory, bookmark manager, or portfolio site? Show users what a website looks
        like before they click. ShotAPI generates website thumbnails on demand via a simple API call.
      </p>

      <!-- Use cases -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Common use cases for website thumbnails</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Link directories</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Sites like Product Hunt, Hacker News, or niche directories benefit from visual previews.
              Instead of just showing a URL and title, show what the site actually looks like.
              Users make faster decisions when they can see the destination.
            </p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Bookmark managers</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Visual bookmarks are easier to scan than text lists. Generate a thumbnail when the user
              saves a URL, and display it in a grid layout. This is the approach tools like
              Raindrop.io and Toby use.
            </p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Portfolio and gallery sites</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Web designers and agencies showcase their work with live screenshots of client sites.
              Auto-generate thumbnails instead of manually taking and uploading screenshots that
              go stale.
            </p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Content aggregators</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Newsletter tools, RSS readers, and content curation platforms use thumbnails to
              make article lists more engaging. A visual preview increases the likelihood that
              users will click through.
            </p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Search results</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Custom search engines and internal tools can display website previews alongside
              results. This provides context that helps users find the right link faster.
            </p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-lg font-semibold text-white mb-2">Competitive analysis tools</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              SaaS tools that analyze competitors or track website changes use screenshots
              as a visual changelog. Capture sites periodically and compare them over time.
            </p>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">How it works</h2>
        <p class="text-slate-300 leading-relaxed mb-6">
          ShotAPI captures a website using a headless Chromium browser and returns the image directly.
          You control the viewport size, format, and capture behavior through URL parameters.
        </p>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mb-6">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Basic thumbnail</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?\\
  url=https://stripe.com&amp;\\
  format=webp&amp;\\
  viewport_width=1280&amp;\\
  viewport_height=720&amp;\\
  access_key=YOUR_KEY"</span> \\
  <span class="text-slate-500">--output</span> stripe-thumb.webp</code></pre>
          </div>
        </div>

        <h3 class="text-lg font-semibold text-white mb-3">Key parameters for thumbnails</h3>
        <div class="overflow-x-auto rounded-xl border border-slate-800">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-900/50 border-b border-slate-800">
                <th class="text-left p-4 text-slate-300 font-medium">Parameter</th>
                <th class="text-left p-4 text-slate-300 font-medium">Recommended value</th>
                <th class="text-left p-4 text-slate-300 font-medium">Why</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              <tr>
                <td class="p-4"><code class="text-indigo-400 text-xs">viewport_width</code></td>
                <td class="p-4 text-white">1280</td>
                <td class="p-4 text-slate-400">Standard desktop width, captures most layouts well</td>
              </tr>
              <tr>
                <td class="p-4"><code class="text-indigo-400 text-xs">viewport_height</code></td>
                <td class="p-4 text-white">720</td>
                <td class="p-4 text-slate-400">16:9 ratio, looks good as a thumbnail card</td>
              </tr>
              <tr>
                <td class="p-4"><code class="text-indigo-400 text-xs">format</code></td>
                <td class="p-4 text-white">webp</td>
                <td class="p-4 text-slate-400">Smallest file size, supported by all modern browsers</td>
              </tr>
              <tr>
                <td class="p-4"><code class="text-indigo-400 text-xs">image_quality</code></td>
                <td class="p-4 text-white">80</td>
                <td class="p-4 text-slate-400">Good quality at small file sizes for thumbnails</td>
              </tr>
              <tr>
                <td class="p-4"><code class="text-indigo-400 text-xs">block_ads</code></td>
                <td class="p-4 text-white">true</td>
                <td class="p-4 text-slate-400">Cleaner thumbnails without ad clutter</td>
              </tr>
              <tr>
                <td class="p-4"><code class="text-indigo-400 text-xs">block_cookie_banners</code></td>
                <td class="p-4 text-white">true</td>
                <td class="p-4 text-slate-400">Remove cookie consent overlays from captures</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Code example: thumbnail grid -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Building a thumbnail grid</h2>
        <p class="text-slate-300 leading-relaxed mb-6">
          Here is a practical example: a Node.js function that generates thumbnail URLs for a list of
          websites, ready to display in a grid layout.
        </p>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mb-6">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Node.js — thumbnail grid</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">const</span> SHOTAPI_KEY = process.env.SHOTAPI_KEY;

<span class="text-violet-400">function</span> <span class="text-emerald-400">getThumbnailUrl</span>(siteUrl) {
  <span class="text-violet-400">const</span> params = <span class="text-violet-400">new</span> URLSearchParams({
    url: siteUrl,
    format: <span class="text-amber-300">'webp'</span>,
    viewport_width: <span class="text-amber-300">'1280'</span>,
    viewport_height: <span class="text-amber-300">'720'</span>,
    image_quality: <span class="text-amber-300">'80'</span>,
    block_ads: <span class="text-amber-300">'true'</span>,
    block_cookie_banners: <span class="text-amber-300">'true'</span>,
    access_key: SHOTAPI_KEY,
  });
  <span class="text-violet-400">return</span> <span class="text-amber-300">\`https://shotapi.io/take?\${params}\`</span>;
}

<span class="text-slate-500">// Generate thumbnails for a list of sites</span>
<span class="text-violet-400">const</span> sites = [
  <span class="text-amber-300">'https://github.com'</span>,
  <span class="text-amber-300">'https://stripe.com'</span>,
  <span class="text-amber-300">'https://vercel.com'</span>,
  <span class="text-amber-300">'https://linear.app'</span>,
];

<span class="text-violet-400">const</span> thumbnails = sites.map(url =&gt; ({
  url,
  thumbnail: getThumbnailUrl(url),
}));

<span class="text-slate-500">// Use in your HTML template:</span>
<span class="text-slate-500">// &lt;img src="\${thumbnail}" alt="Preview of \${url}" loading="lazy" /&gt;</span></code></pre>
          </div>
        </div>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">HTML — display the grid</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">&lt;div</span> <span class="text-sky-300">class</span>=<span class="text-amber-300">"grid grid-cols-2 gap-4"</span><span class="text-violet-400">&gt;</span>
  <span class="text-violet-400">&lt;div</span> <span class="text-sky-300">class</span>=<span class="text-amber-300">"rounded-lg overflow-hidden border"</span><span class="text-violet-400">&gt;</span>
    <span class="text-violet-400">&lt;img</span>
      <span class="text-sky-300">src</span>=<span class="text-amber-300">"https://shotapi.io/take?url=https://github.com&amp;format=webp&amp;viewport_width=1280&amp;viewport_height=720&amp;access_key=KEY"</span>
      <span class="text-sky-300">alt</span>=<span class="text-amber-300">"GitHub preview"</span>
      <span class="text-sky-300">loading</span>=<span class="text-amber-300">"lazy"</span>
      <span class="text-sky-300">class</span>=<span class="text-amber-300">"w-full"</span>
    <span class="text-violet-400">/&gt;</span>
    <span class="text-violet-400">&lt;p&gt;</span>github.com<span class="text-violet-400">&lt;/p&gt;</span>
  <span class="text-violet-400">&lt;/div&gt;</span>
<span class="text-violet-400">&lt;/div&gt;</span></code></pre>
          </div>
        </div>
      </section>

      <!-- Performance tips -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Performance tips for thumbnails at scale</h2>

        <div class="space-y-4">
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Cache aggressively</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Websites do not change their design every minute. Cache thumbnails for 24 hours or more.
              Save the image to your CDN or object storage rather than hitting the API on every page load.
              This reduces API usage and makes your pages load faster.
            </p>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Use WebP format</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              WebP produces images 25-35% smaller than PNG at comparable quality. For thumbnails
              that are displayed at small sizes, the visual difference is imperceptible. Set
              <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">format=webp</code> and
              <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">image_quality=80</code>.
            </p>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Lazy load images</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Add <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">loading="lazy"</code>
              to your img tags. Browsers will only fetch the thumbnail when it scrolls into view. This
              is especially important for grids with many thumbnails.
            </p>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Generate in the background</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Do not block user actions on thumbnail generation. When a user adds a new URL, save it
              immediately and generate the thumbnail asynchronously. Show a placeholder until the
              thumbnail is ready.
            </p>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Set appropriate viewport sizes</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Do not capture at 1920px if you display thumbnails at 300px wide. A 1280x720 viewport
              provides enough detail for most thumbnail use cases while keeping capture times fast.
            </p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/50 to-slate-950 p-8 sm:p-12 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">Start generating website thumbnails</h2>
        <p class="text-slate-400 mb-8 max-w-lg mx-auto">
          100 free thumbnails per day. WebP, PNG, JPEG support. Ad and cookie banner blocking included.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/keys" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg text-lg font-medium transition">
            Get Free API Key
          </a>
          <a href="/docs" class="w-full sm:w-auto border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-3 rounded-lg text-lg transition">
            API Documentation
          </a>
        </div>
      </section>

    </div>
  </article>`;
}
