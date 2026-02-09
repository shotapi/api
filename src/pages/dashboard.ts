import { getDb } from '../db.js';

export function dashboardPage(apiKey: string): string {
  const db = getDb();

  // Get key info
  const keyInfo = db.prepare('SELECT * FROM api_keys WHERE key = ?').get(apiKey) as any;
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
  const dailyLimit = DAILY_LIMITS[keyInfo.tier] || 100;

  // Get last 7 days usage
  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const row = db.prepare(
      'SELECT COALESCE(SUM(request_count), 0) as count FROM daily_stats WHERE date = ? AND api_key = ?'
    ).get(dateStr, apiKey) as { count: number };
    days.push({ date: dateStr, count: row.count });
  }

  const maxCount = Math.max(...days.map(d => d.count), 1);
  const todayUsage = days[days.length - 1].count;
  const totalRequests = db.prepare('SELECT COUNT(*) as count FROM requests WHERE api_key = ?').get(apiKey) as { count: number };

  return `<div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <h1 class="text-3xl font-bold text-white mb-2">Dashboard</h1>
    <p class="text-slate-400 mb-8">Usage overview for your API key</p>

    <!-- Key info -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p class="text-sm text-slate-400 mb-1">Plan</p>
        <p class="text-xl font-bold text-white capitalize">${keyInfo.tier}</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p class="text-sm text-slate-400 mb-1">Today</p>
        <p class="text-xl font-bold text-white">${todayUsage} <span class="text-sm text-slate-500">/ ${dailyLimit}</span></p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p class="text-sm text-slate-400 mb-1">Total Requests</p>
        <p class="text-xl font-bold text-white">${totalRequests.count.toLocaleString()}</p>
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

    ${keyInfo.tier === 'free' ? `
    <!-- Upgrade CTA -->
    <div class="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-700/50 rounded-xl p-6 text-center">
      <h2 class="text-xl font-bold text-white mb-2">Need more screenshots?</h2>
      <p class="text-slate-300 mb-4">Upgrade to Starter for 2,500/day or Pro for 10,000/day.</p>
      <a href="/pricing" class="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition font-medium">View Plans</a>
    </div>` : ''}
  </div>`;
}
