import { useState } from "react";

export default function KeySignupForm() {
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create key");
      setApiKey(data.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (apiKey) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <p className="mb-2 text-sm text-muted-foreground">Your API key:</p>
        <code className="block break-all rounded-lg border border-border bg-zinc-950 px-4 py-3 font-mono text-sm text-emerald-400">
          {apiKey}
        </code>
        <p className="mt-3 text-xs text-muted-foreground">
          Save this key — it won't be shown again.
        </p>
        <div className="mt-4 flex gap-3 text-sm">
          <a
            href="/docs"
            className="text-muted-foreground underline transition hover:text-foreground"
          >
            Read the docs
          </a>
          <span className="text-border">|</span>
          <a
            href={`/dashboard?key=${apiKey}`}
            className="text-muted-foreground underline transition hover:text-foreground"
          >
            View dashboard
          </a>
          <span className="text-border">|</span>
          <a
            href={`/dashboard?key=${apiKey}`}
            id="upgrade-link"
            className="text-emerald-500 underline transition hover:text-emerald-400"
          >
            Upgrade plan
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary py-3 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Get API Key"}
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
