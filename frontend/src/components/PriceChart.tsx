'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { usePrices } from '@/lib/hooks';

interface Props {
  ticker: string | null;
}

export function PriceChart({ ticker }: Props) {
  const { data: prices, isLoading } = usePrices(ticker);

  if (!ticker) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-border bg-surface text-sm text-muted">
        Select an instrument to view its price history.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-border bg-surface text-sm text-muted">
        Loading price history…
      </div>
    );
  }

  if (!prices || prices.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-border bg-surface text-sm text-muted">
        No price history for {ticker} yet.
      </div>
    );
  }

  // API returns most-recent-first; chart wants chronological order.
  const chartData = [...prices].reverse();
  const latest = chartData[chartData.length - 1];
  const first = chartData[0];
  const changePct = ((latest.close - first.close) / first.close) * 100;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-muted">{ticker}</h2>
        <div className="tabular text-right">
          <div className="text-lg">₹{latest.close.toLocaleString('en-IN')}</div>
          <div className={`text-xs ${changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
            {changePct >= 0 ? '+' : ''}
            {changePct.toFixed(2)}% over period
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              tickFormatter={(d: string) => d.slice(5)}
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              domain={['auto', 'auto']}
              width={56}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
