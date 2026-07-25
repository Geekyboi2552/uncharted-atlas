'use client';

import { useCorrelationMatrix } from '@/lib/hooks';
import type { CorrelationMatrix } from '@/lib/types';

function isMatrix(data: unknown): data is CorrelationMatrix {
  return !!data && typeof data === 'object' && !('message' in (data as object));
}

function cellColor(value: number | null): string {
  if (value === null || Number.isNaN(value)) return 'transparent';
  // -1 -> negative color, 0 -> surface, 1 -> accent color, interpolated via opacity
  const alpha = Math.min(1, Math.abs(value));
  return value >= 0
    ? `rgba(79, 184, 174, ${alpha * 0.8})`
    : `rgba(240, 101, 79, ${alpha * 0.8})`;
}

export function CorrelationHeatmap() {
  const { data, isLoading } = useCorrelationMatrix();

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-medium text-muted">Return Correlation</h2>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : !data || !isMatrix(data) ? (
        <p className="text-sm text-muted">
          Not enough price history yet to compute a correlation matrix.
        </p>
      ) : (
        <div className="scrollbar-thin overflow-x-auto">
          <table className="tabular border-separate border-spacing-0.5 text-xs">
            <thead>
              <tr>
                <th />
                {Object.keys(data).map((ticker) => (
                  <th key={ticker} className="px-1.5 py-1 font-normal text-muted">
                    {ticker}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([rowTicker, row]) => (
                <tr key={rowTicker}>
                  <td className="pr-2 text-right font-normal text-muted">{rowTicker}</td>
                  {Object.keys(data).map((colTicker) => {
                    const value = row[colTicker];
                    return (
                      <td
                        key={colTicker}
                        title={value !== null ? value.toFixed(2) : 'n/a'}
                        className="h-8 w-8 text-center"
                        style={{ backgroundColor: cellColor(value) }}
                      >
                        {value !== null ? value.toFixed(1) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
