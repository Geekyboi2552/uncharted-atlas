'use client';

import { useState } from 'react';
import { useHoldings, useAddHolding, useInstruments } from '@/lib/hooks';

interface Props {
  portfolioId: number | null;
}

export function HoldingsTable({ portfolioId }: Props) {
  const { data: holdings, isLoading } = useHoldings(portfolioId);
  const { data: instruments } = useInstruments();
  const addHolding = useAddHolding(portfolioId);

  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setError(null);
    if (!ticker || !quantity || !price) return;
    try {
      await addHolding.mutateAsync({
        ticker: ticker.toUpperCase(),
        quantity: parseFloat(quantity),
        average_buy_price: parseFloat(price),
      });
      setTicker('');
      setQuantity('');
      setPrice('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add holding.');
    }
  };

  if (!portfolioId) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
        Select or create a portfolio to view holdings.
      </div>
    );
  }

  const totalValue =
    holdings?.reduce((sum, h) => sum + h.quantity * h.average_buy_price, 0) ?? 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">Holdings</h2>
        <span className="tabular text-sm text-foreground">
          ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2">
        <input
          list="instrument-tickers"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Ticker"
          className="col-span-1 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
        <datalist id="instrument-tickers">
          {instruments?.map((i) => (
            <option key={i.id} value={i.ticker}>
              {i.name}
            </option>
          ))}
        </datalist>
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          type="number"
          className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Avg. buy price"
          type="number"
          className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={handleAdd}
          disabled={addHolding.isPending}
          className="rounded-lg bg-accent px-2 py-1.5 text-sm font-medium text-black disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-negative">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted">Loading holdings…</p>
      ) : !holdings || holdings.length === 0 ? (
        <p className="text-sm text-muted">No holdings yet. Add your first position above.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="py-2 font-normal">Ticker</th>
              <th className="py-2 font-normal">Name</th>
              <th className="py-2 text-right font-normal">Qty</th>
              <th className="py-2 text-right font-normal">Avg. Price</th>
              <th className="py-2 text-right font-normal">Value</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {holdings.map((h) => (
              <tr key={h.id} className="border-b border-border/50 last:border-0">
                <td className="py-2 font-medium text-accent">{h.ticker}</td>
                <td className="py-2 text-muted">{h.name}</td>
                <td className="py-2 text-right">{h.quantity}</td>
                <td className="py-2 text-right">₹{h.average_buy_price.toLocaleString('en-IN')}</td>
                <td className="py-2 text-right">
                  ₹{(h.quantity * h.average_buy_price).toLocaleString('en-IN', {
                    maximumFractionDigits: 0,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
