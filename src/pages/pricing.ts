export function pricingPage(): string {
  return `<div class="max-w-5xl mx-auto px-4 sm:px-6 py-16">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
      <p class="text-lg text-slate-400 max-w-2xl mx-auto">No hidden fees. No per-screenshot charges on paid plans. Just a flat monthly rate.</p>
    </div>

    <!-- Pricing cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      <!-- Free -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-white mb-1">Free</h3>
        <p class="text-slate-400 text-sm mb-4">For trying things out</p>
        <div class="mb-6">
          <span class="text-4xl font-bold text-white">$0</span>
          <span class="text-slate-400">/month</span>
        </div>
        <ul class="space-y-3 text-sm text-slate-300 mb-6">
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> 100 screenshots/day</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> All formats (PNG, JPEG, WebP, PDF)</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Full page capture</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Dark mode support</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Custom viewport</li>
          <li class="flex items-start gap-2"><span class="text-slate-600 mt-0.5">&#10007;</span> <span class="text-slate-500">Priority support</span></li>
        </ul>
        <a href="/keys" class="block text-center bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition font-medium">Get Free Key</a>
      </div>

      <!-- Starter -->
      <div class="bg-slate-900 border-2 border-indigo-500 rounded-xl p-6 relative">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
        <h3 class="text-lg font-semibold text-white mb-1">Starter</h3>
        <p class="text-slate-400 text-sm mb-4">For side projects & MVPs</p>
        <div class="mb-6">
          <span class="text-4xl font-bold text-white">$9</span>
          <span class="text-slate-400">/month</span>
        </div>
        <ul class="space-y-3 text-sm text-slate-300 mb-6">
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> <strong>2,500</strong> screenshots/day</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> All formats (PNG, JPEG, WebP, PDF)</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Full page capture</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Dark mode support</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Custom viewport</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Email support</li>
        </ul>
        <a href="/keys" class="block text-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition font-medium">Get Started</a>
      </div>

      <!-- Pro -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-white mb-1">Pro</h3>
        <p class="text-slate-400 text-sm mb-4">For production apps</p>
        <div class="mb-6">
          <span class="text-4xl font-bold text-white">$29</span>
          <span class="text-slate-400">/month</span>
        </div>
        <ul class="space-y-3 text-sm text-slate-300 mb-6">
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> <strong>10,000</strong> screenshots/day</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> All formats (PNG, JPEG, WebP, PDF)</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Full page capture</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Dark mode support</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Custom viewport</li>
          <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&#10003;</span> Priority support</li>
        </ul>
        <a href="/keys" class="block text-center bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition font-medium">Get Started</a>
      </div>
    </div>

    <!-- FAQ -->
    <div class="max-w-3xl mx-auto">
      <h2 class="text-2xl font-bold text-white mb-6 text-center">Pricing FAQ</h2>
      <div class="space-y-3">
        <details class="bg-slate-900 border border-slate-800 rounded-xl">
          <summary class="p-4 cursor-pointer text-white font-medium hover:text-indigo-300 transition">What happens if I hit my daily limit?</summary>
          <p class="px-4 pb-4 text-slate-400">You'll receive a 429 response with a message indicating when your limit resets (midnight UTC). Your API key continues to work the next day.</p>
        </details>
        <details class="bg-slate-900 border border-slate-800 rounded-xl">
          <summary class="p-4 cursor-pointer text-white font-medium hover:text-indigo-300 transition">Can I upgrade or downgrade anytime?</summary>
          <p class="px-4 pb-4 text-slate-400">Yes. Changes take effect immediately. If you downgrade, you keep the higher limit until the end of your current billing period.</p>
        </details>
        <details class="bg-slate-900 border border-slate-800 rounded-xl">
          <summary class="p-4 cursor-pointer text-white font-medium hover:text-indigo-300 transition">Is there a per-screenshot charge?</summary>
          <p class="px-4 pb-4 text-slate-400">No. Paid plans include a fixed daily limit with no per-screenshot fees. Use as many as your plan allows each day.</p>
        </details>
        <details class="bg-slate-900 border border-slate-800 rounded-xl">
          <summary class="p-4 cursor-pointer text-white font-medium hover:text-indigo-300 transition">Do you offer annual billing?</summary>
          <p class="px-4 pb-4 text-slate-400">Not yet, but we're considering it. All plans are currently month-to-month with no commitment.</p>
        </details>
      </div>
    </div>
  </div>`;
}
