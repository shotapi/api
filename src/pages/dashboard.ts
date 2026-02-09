import { getClient } from '../db.js';

export async function dashboardPage(apiKey: string): Promise<string> {
  const db = getClient();

  // Get key info
  const keyResult = await db.execute({ sql: 'SELECT * FROM api_keys WHERE key = ?', args: [apiKey] });
  const keyInfo = keyResult.rows[0];
  if (!keyInfo) {
    return `<div class="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 class="text-2xl font-bold text-white mb-4">API Key Not Found</h1>
      <p class="text-slate-400">The provided API key does not exist.</p>
      <a href="/keys" class="inline-block mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition">Get an API Key</a>
    </div>`;
  }

  const DAILY_LIMITS: Record<string, number> = {
    free: 100,
    starter: 2500,
    pro: 10000,
  };
  const tier = keyInfo.tier as string;
  const dailyLimit = DAILY_LIMITS[tier] || 100;

  // Get last 7 days usage in a batch
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const dayQueries = dates.map(dateStr => ({
    sql: 'SELECT COALESCE(SUM(request_count), 0) as count FROM daily_stats WHERE date = ? AND api_key = ?',
    args: [dateStr, apiKey],
  }));

  const totalQuery = { sql: 'SELECT COUNT(*) as count FROM requests WHERE api_key = ?', args: [apiKey] };

  const results = await db.batch([...dayQueries, totalQuery], 'read');

  const days = dates.map((date, i) => ({
    date,
    count: Number(results[i].rows[0].count) || 0,
  }));

  const totalRequests = Number(results[results.length - 1].rows[0].count) || 0;
  const maxCount = Math.max(...days.map(d => d.count), 1);
  const todayUsage = days[days.length - 1].count;

  return `<div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <h1 class="text-3xl font-bold text-white mb-2">Dashboard</h1>
    <p class="text-slate-400 mb-8">Usage overview for your API key</p>

    <!-- Key info -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p class="text-sm text-slate-400 mb-1">Plan</p>
        <p class="text-xl font-bold text-white capitalize">${tier}</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p class="text-sm text-slate-400 mb-1">Today</p>
        <p class="text-xl font-bold text-white">${todayUsage} <span class="text-sm text-slate-500">/ ${dailyLimit}</span></p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p class="text-sm text-slate-400 mb-1">Total Requests</p>
        <p class="text-xl font-bold text-white">${totalRequests.toLocaleString()}</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p class="text-sm text-slate-400 mb-1">API Key</p>
        <p class="text-sm font-mono text-slate-300 truncate">${apiKey.slice(0, 10)}...${apiKey.slice(-4)}</p>
      </div>
    </div>

    <!-- Usage chart (CSS only) -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
      <h2 class="text-lg font-semibold text-white mb-4">Last 7 Days</h2>
      <div class="flex items-end gap-2 h-40">
        ${days.map(d => {
          const height = maxCount > 0 ? Math.max((d.count / maxCount) * 100, 2) : 2;
          const label = d.date.split('-').slice(1).join('/');
          return `<div class="flex-1 flex flex-col items-center gap-1">
            <span class="text-xs text-slate-400">${d.count}</span>
            <div class="w-full bg-indigo-600 rounded-t" style="height: ${height}%"></div>
            <span class="text-xs text-slate-500">${label}</span>
          </div>`;
        }).join('')}
      </div>
    </div>

    ${tier === 'free' ? `
    <!-- Upgrade CTA -->
    <div class="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-700/50 rounded-xl p-6 text-center">
      <h2 class="text-xl font-bold text-white mb-2">Need more screenshots?</h2>
      <p class="text-slate-300 mb-4">Upgrade your plan for higher daily limits.</p>
      ${process.env.STRIPE_SECRET_KEY ? `
      <div class="flex justify-center gap-4">
        <button onclick="upgrade('starter')"
          class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition font-medium">
          Starter — $9/mo <span class="text-indigo-200 text-sm">(2,500/day)</span>
        </button>
        <button onclick="upgrade('pro')"
          class="bg-white hover:bg-slate-100 text-slate-900 px-6 py-3 rounded-lg transition font-medium">
          Pro — $29/mo <span class="text-slate-500 text-sm">(10,000/day)</span>
        </button>
      </div>
      <p id="upgrade-error" class="text-red-400 text-sm mt-3 hidden"></p>
      <script>
        async function upgrade(plan) {
          const errEl = document.getElementById('upgrade-error');
          errEl.classList.add('hidden');
          const btn = event.target.closest('button');
          const origText = btn.innerHTML;
          btn.disabled = true;
          btn.textContent = 'Redirecting...';
          try {
            const res = await fetch('/billing/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ api_key: '${apiKey}', plan }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
            window.location.href = data.url;
          } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove('hidden');
            btn.innerHTML = origText;
            btn.disabled = false;
          }
        }
      </script>` : `
      <a href="mailto:hello@shotapi.io?subject=Upgrade%20to%20Starter%20or%20Pro"
        class="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition font-medium">
        Contact us to upgrade
      </a>`}
    </div>` : ''}
  </div>`;
}
