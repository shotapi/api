import { Hono } from 'hono';
import { registerApiKey, getKeyUsage } from '../auth.js';
import { layout } from '../pages/layout.js';

const keys = new Hono();

// HTML signup page
keys.get('/', (c) => {
  return c.html(layout({
    title: 'Get Free API Key — ShotAPI',
    description: 'Get a free ShotAPI key. 100 screenshots per day, all formats, no credit card required.',
    path: '/keys',
    content: `<div class="max-w-lg mx-auto px-4 py-16">
      <h1 class="text-3xl font-bold text-white mb-4 text-center">Get your free API key</h1>
      <p class="text-slate-400 text-center mb-8">100 screenshots per day. All formats. No credit card.</p>

      <form id="key-form" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-300 mb-1">Email address</label>
          <input id="email" type="email" required placeholder="you@example.com"
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500">
        </div>
        <button type="submit" id="submit-btn"
          class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-medium transition">
          Get API Key
        </button>
        <p id="error-msg" class="text-red-400 text-sm hidden"></p>
      </form>

      <div id="key-result" class="hidden mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <p class="text-sm text-slate-400 mb-2">Your API key:</p>
        <code id="api-key" class="block bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-emerald-400 font-mono text-sm break-all"></code>
        <p class="text-xs text-slate-500 mt-3">Save this key — it won't be shown again.</p>
        <div class="mt-4 flex gap-3">
          <a href="/docs" class="text-sm text-indigo-400 hover:text-indigo-300 transition">Read the docs</a>
          <span class="text-slate-700">|</span>
          <a id="dashboard-link" href="/dashboard" class="text-sm text-indigo-400 hover:text-indigo-300 transition">View dashboard</a>
        </div>
      </div>

      <script>
        document.getElementById('key-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value;
          const btn = document.getElementById('submit-btn');
          const errMsg = document.getElementById('error-msg');
          errMsg.classList.add('hidden');
          btn.textContent = 'Creating...';
          btn.disabled = true;
          try {
            const res = await fetch('/keys', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create key');
            document.getElementById('api-key').textContent = data.key;
            document.getElementById('dashboard-link').href = '/dashboard?key=' + data.key;
            document.getElementById('key-form').classList.add('hidden');
            document.getElementById('key-result').classList.remove('hidden');
          } catch (err) {
            errMsg.textContent = err.message;
            errMsg.classList.remove('hidden');
            btn.textContent = 'Get API Key';
            btn.disabled = false;
          }
        });
      </script>
    </div>`,
  }));
});

// Register new API key (JSON API)
keys.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const email = body.email;

    if (!email || typeof email !== 'string') {
      return c.json({ error: true, message: 'email is required' }, 400);
    }

    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      return c.json({ error: true, message: 'Invalid email address' }, 400);
    }

    const keyInfo = await registerApiKey(email);

    return c.json({
      key: keyInfo.key,
      email: keyInfo.email,
      tier: keyInfo.tier,
      dailyLimit: 100,
      message: 'API key created. Use access_key query parameter or Authorization: Bearer header.',
    }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: true, message }, 400);
  }
});

// Get API key usage
keys.get('/:key/usage', async (c) => {
  const key = c.req.param('key');
  const usage = await getKeyUsage(key);

  if (!usage) {
    return c.json({ error: true, message: 'API key not found' }, 404);
  }

  return c.json({
    key,
    tier: usage.tier,
    usage: {
      today: usage.today,
      dailyLimit: usage.dailyLimit,
      remaining: Math.max(0, usage.dailyLimit - usage.today),
      total: usage.total,
    },
  });
});

export default keys;
