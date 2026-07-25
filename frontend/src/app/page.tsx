import Link from "next/link";

const metrics = [
  { label: "Sharpe", detail: "Return per unit of total risk" },
  { label: "Sortino", detail: "Return per unit of downside risk" },
  { label: "Treynor", detail: "Return per unit of market risk" },
  { label: "Correlation", detail: "Cross-instrument return relationships" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-6">
      <section className="flex w-full max-w-3xl flex-col items-center gap-8 pb-20 pt-28 text-center">
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs tracking-wide text-muted uppercase">
          BSE-listed instruments · daily refresh
        </span>

        <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          A free portfolio analytics terminal for the Indian market
        </h1>

        <p className="max-w-md text-lg leading-8 text-muted">
          Track holdings, compute risk-adjusted return metrics, and explore
          correlations across instruments — no Bloomberg subscription
          required.
        </p>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full bg-accent px-6 text-black transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
          <Link
            href="/market"
            className="flex h-12 items-center justify-center rounded-full border border-border px-6 transition-colors hover:border-accent"
          >
            Browse instruments
          </Link>
        </div>
      </section>

      <section className="grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border pb-24 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-surface p-5">
            <div className="tabular text-sm text-accent">{m.label}</div>
            <div className="mt-1 text-xs text-muted">{m.detail}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
