export function ogImageApi(): string {
  return `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Generate OG Images with a Screenshot API",
    "description": "Use ShotAPI to generate dynamic Open Graph images from any URL. Perfect for social media previews and link cards.",
    "author": { "@type": "Organization", "name": "ShotAPI" },
    "publisher": { "@type": "Organization", "name": "ShotAPI" },
    "mainEntityOfPage": "https://shotapi.io/blog/og-image-api"
  }
  </script>

  <article class="py-16 sm:py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">

      <!-- Breadcrumb -->
      <nav class="mb-8 text-sm text-slate-500">
        <a href="/" class="hover:text-slate-300 transition">Home</a>
        <span class="mx-2">/</span>
        <a href="/blog/og-image-api" class="hover:text-slate-300 transition">Blog</a>
        <span class="mx-2">/</span>
        <span class="text-slate-300">OG Image API</span>
      </nav>

      <h1 class="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
        Generate OG Images<br>
        <span class="text-indigo-400">with a Screenshot API</span>
      </h1>

      <p class="text-lg text-slate-400 leading-relaxed mb-12 max-w-3xl">
        Open Graph images make your links stand out on Twitter, LinkedIn, Slack, and Discord.
        Instead of building a custom OG image service, use ShotAPI to screenshot a template page
        and get pixel-perfect social cards every time.
      </p>

      <!-- What are OG images -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">What are OG images and why they matter</h2>
        <p class="text-slate-300 leading-relaxed mb-4">
          When someone shares a link on social media, the platform looks for Open Graph meta tags
          in your HTML. The <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">og:image</code>
          tag tells the platform which image to display as the link preview card.
        </p>
        <p class="text-slate-300 leading-relaxed mb-6">
          A well-designed OG image can dramatically increase click-through rates. Posts with rich
          previews get significantly more engagement than bare links. The problem is generating
          them dynamically at scale.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6 text-center">
            <div class="text-2xl font-bold text-indigo-400 mb-2">2-3x</div>
            <p class="text-sm text-slate-400">More clicks on links with rich preview images</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6 text-center">
            <div class="text-2xl font-bold text-indigo-400 mb-2">1200x630</div>
            <p class="text-sm text-slate-400">Recommended OG image dimensions in pixels</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6 text-center">
            <div class="text-2xl font-bold text-indigo-400 mb-2">&lt; 2s</div>
            <p class="text-sm text-slate-400">Time to generate an OG image with ShotAPI</p>
          </div>
        </div>
      </section>

      <!-- How to use ShotAPI for OG images -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">How to use ShotAPI for OG image generation</h2>
        <p class="text-slate-300 leading-relaxed mb-6">
          The approach is simple: create an HTML template for your OG image, host it at a URL,
          and use ShotAPI to screenshot it at the right dimensions. Here is the workflow:
        </p>

        <div class="space-y-6 mb-8">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">1</div>
            <div class="flex-1">
              <h3 class="text-white font-medium mb-2">Create a template page</h3>
              <p class="text-sm text-slate-400">
                Build an HTML page that accepts query parameters (title, author, etc.) and renders
                a 1200x630 card design. Style it with CSS however you want.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">2</div>
            <div class="flex-1">
              <h3 class="text-white font-medium mb-2">Screenshot it with ShotAPI</h3>
              <p class="text-sm text-slate-400">
                Call ShotAPI with the template URL, setting viewport to 1200x630. The API returns
                a pixel-perfect image of your card.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">3</div>
            <div class="flex-1">
              <h3 class="text-white font-medium mb-2">Use the URL as your og:image</h3>
              <p class="text-sm text-slate-400">
                Point your og:image meta tag directly at the ShotAPI URL. Social platforms will fetch
                it when the link is shared.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Code examples -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Code examples</h2>

        <h3 class="text-lg font-semibold text-white mb-3">Direct URL approach</h3>
        <p class="text-slate-300 text-sm leading-relaxed mb-4">
          The simplest approach: construct the ShotAPI URL dynamically and use it directly
          in your og:image tag. No server-side code needed.
        </p>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mb-6">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">HTML meta tag</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-slate-500">&lt;!-- Your template page at: yoursite.com/og?title=Hello+World --&gt;</span>
<span class="text-violet-400">&lt;meta</span> <span class="text-sky-300">property</span>=<span class="text-amber-300">"og:image"</span>
  <span class="text-sky-300">content</span>=<span class="text-amber-300">"https://shotapi.io/take?
    url=https://yoursite.com/og?title=Hello+World
    &amp;viewport_width=1200
    &amp;viewport_height=630
    &amp;format=png
    &amp;access_key=YOUR_KEY"</span> <span class="text-violet-400">/&gt;</span></code></pre>
          </div>
        </div>

        <h3 class="text-lg font-semibold text-white mb-3">Server-side generation (Node.js)</h3>
        <p class="text-slate-300 text-sm leading-relaxed mb-4">
          For more control, generate the OG image URL on the server and cache the result:
        </p>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mb-6">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">Node.js</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-violet-400">function</span> <span class="text-emerald-400">getOgImageUrl</span>(title, author) {
  <span class="text-violet-400">const</span> templateUrl = <span class="text-amber-300">\`https://yoursite.com/og?\${new URLSearchParams({ title, author })}\`</span>;

  <span class="text-violet-400">const</span> params = <span class="text-violet-400">new</span> URLSearchParams({
    url: templateUrl,
    viewport_width: <span class="text-amber-300">'1200'</span>,
    viewport_height: <span class="text-amber-300">'630'</span>,
    format: <span class="text-amber-300">'png'</span>,
    access_key: process.env.SHOTAPI_KEY,
  });

  <span class="text-violet-400">return</span> <span class="text-amber-300">\`https://shotapi.io/take?\${params}\`</span>;
}

<span class="text-slate-500">// Use in your HTML template:</span>
<span class="text-slate-500">// &lt;meta property="og:image" content="\${getOgImageUrl('My Post', 'Jane')}" /&gt;</span></code></pre>
          </div>
        </div>

        <h3 class="text-lg font-semibold text-white mb-3">Screenshot any page as OG image</h3>
        <p class="text-slate-300 text-sm leading-relaxed mb-4">
          You do not even need a template page. Screenshot your actual page at OG dimensions:
        </p>

        <div class="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <span class="text-sm font-medium text-slate-300">curl</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm"><code><span class="text-emerald-400">curl</span> <span class="text-amber-300">"https://shotapi.io/take?\\
  url=https://yoursite.com/blog/my-post&amp;\\
  viewport_width=1200&amp;\\
  viewport_height=630&amp;\\
  format=png&amp;\\
  access_key=YOUR_KEY"</span> \\
  <span class="text-slate-500">--output</span> og-image.png</code></pre>
          </div>
        </div>
      </section>

      <!-- Best practices -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Best practices for OG images</h2>

        <div class="space-y-4">
          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Use 1200x630 viewport</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              This is the recommended OG image size for Facebook, Twitter, and LinkedIn. Set
              <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">viewport_width=1200</code> and
              <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">viewport_height=630</code>
              for consistent results across all platforms.
            </p>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Use PNG format</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              PNG gives the sharpest text rendering for OG images. JPEG can introduce artifacts
              around text. Use <code class="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">format=png</code>
              for the best quality.
            </p>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Keep text large and readable</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              OG images are often shown small in feeds. Use large, bold text (40px+) and limit
              content to a title, subtitle, and your brand. Avoid small details that disappear
              when scaled down.
            </p>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Cache the results</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              OG images do not change often. Cache the screenshot URL or save the image to your CDN.
              Generate a new one only when the content changes. This keeps your API usage low and
              response times fast.
            </p>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 class="text-white font-semibold mb-2">Test with social debuggers</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Use Facebook's Sharing Debugger and Twitter's Card Validator to preview how your OG
              images look before sharing. These tools also help clear cached previews after updates.
            </p>
          </div>
        </div>
      </section>

      <!-- Why use an API over custom solutions -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-6">Why use a screenshot API for OG images?</h2>
        <p class="text-slate-300 leading-relaxed mb-6">
          There are several ways to generate OG images. Here is why the screenshot approach wins
          for most teams:
        </p>

        <div class="overflow-x-auto rounded-xl border border-slate-800">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-900/50 border-b border-slate-800">
                <th class="text-left p-4 text-slate-300 font-medium">Approach</th>
                <th class="text-left p-4 text-slate-300 font-medium">Pros</th>
                <th class="text-left p-4 text-slate-300 font-medium">Cons</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              <tr>
                <td class="p-4 text-indigo-400 font-medium">Screenshot API (ShotAPI)</td>
                <td class="p-4 text-slate-300">Full CSS/HTML flexibility, no dependencies, instant setup</td>
                <td class="p-4 text-slate-400">Requires hosted template page</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Canvas/SVG (Satori)</td>
                <td class="p-4 text-slate-300">No external service needed</td>
                <td class="p-4 text-slate-400">Limited CSS support, complex setup</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Static images</td>
                <td class="p-4 text-slate-300">Simplest approach</td>
                <td class="p-4 text-slate-400">No dynamic content, manual updates</td>
              </tr>
              <tr>
                <td class="p-4 text-slate-300">Self-hosted Puppeteer</td>
                <td class="p-4 text-slate-300">Full control</td>
                <td class="p-4 text-slate-400">Heavy infrastructure, memory issues</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- CTA -->
      <section class="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/50 to-slate-950 p-8 sm:p-12 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">Start generating OG images</h2>
        <p class="text-slate-400 mb-8 max-w-lg mx-auto">
          Get a free API key and start creating dynamic Open Graph images for your content.
          100 free screenshots per day, no credit card required.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/keys" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg text-lg font-medium transition">
            Get Free API Key
          </a>
          <a href="/docs" class="w-full sm:w-auto border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-3 rounded-lg text-lg transition">
            Read the Docs
          </a>
        </div>
      </section>

    </div>
  </article>`;
}
