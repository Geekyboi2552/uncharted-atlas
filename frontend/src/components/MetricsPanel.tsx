'use client';

import { usePortfolioAnalytics } from '@/lib/hooks';

const LABELS: Record<string, string> = {
  sharpe_ratio: 'Sharpe',
  sortino_ratio: 'Sortino',
  annualized_volatility: 'Ann. Volatility',
  max_drawdown: 'Max Drawdown',
};

const PERCENT_METRICS = new Set(['annualized_volatility', 'max_drawdown']);

interface Props {
  portfolioId: number | null;
}

export function MetricsPanel({ portfolioId }: Props) {
  const { data: metrics, isLoading, isError } = usePortfolioAnalytics(portfolioId);

  if (!portfolioId) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
        Select a portfolio to see risk metrics.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-medium text-muted">Risk Metrics</h2>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : isError || !metrics || metrics.length === 0 ? (
        <p className="text-sm text-muted">
          No computed metrics yet for this portfolio. Metrics populate after the daily
          ingestion + analytics job runs.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((m) => {
            const isNegative = m.value < 0;
            const label = LABELS[m.metric_name] ?? m.metric_name;
            const display = PERCENT_METRICS.has(m.metric_name)
              ? `${(m.value * 100).toFixed(2)}%`
              : m.value.toFixed(2);
            return (
              <div key={m.metric_name} className="rounded-lg bg-surface-2 p-3">
                <div className="text-xs text-muted">{label}</div>
                <div
                  className={`tabular mt-1 text-lg ${
                    isNegative ? 'text-negative' : 'text-positive'
                  }`}
                >
                  {display}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
