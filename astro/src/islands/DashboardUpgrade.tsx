import { useState } from "react";

interface Props {
  apiKey: string;
  hasStripe: boolean;
}

export default function DashboardUpgrade({ apiKey, hasStripe }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function upgrade(plan: string) {
    setError("");
    setLoading(plan);

    try {
      const res = await fetch("/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, plan }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || "Something went wrong. Please try again."
        );
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  if (!hasStripe) {
    return (
      <a
        href="mailto:hello@shotapi.io?subject=Upgrade%20to%20Starter%20or%20Pro"
        className="inline-flex h-11 items-center rounded-md bg-primary px-6 font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        Contact us to upgrade
      </a>
    );
  }

  return (
    <div>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => upgrade("starter")}
          disabled={loading !== null}
          className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {loading === "starter" ? "Redirecting..." : "Starter — $9/mo"}
          <span className="ml-1 text-sm text-primary-foreground/70">
            (2,500/day)
          </span>
        </button>
        <button
          onClick={() => upgrade("pro")}
          disabled={loading !== null}
          className="rounded-md border border-border bg-secondary px-6 py-3 font-medium text-secondary-foreground transition hover:bg-secondary/80 disabled:opacity-50"
        >
          {loading === "pro" ? "Redirecting..." : "Pro — $29/mo"}
          <span className="ml-1 text-sm text-muted-foreground">
            (10,000/day)
          </span>
        </button>
      </div>
      {error && (
        <p className="mt-3 text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
