'use client';

import { useState } from 'react';
import type { Portfolio } from '@/app/lib/types';
import { useCreatePortfolio } from '@/app/lib/hooks';

interface Props {
  portfolios: Portfolio[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function PortfolioSwitcher({ portfolios, selectedId, onSelect }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const createPortfolio = useCreatePortfolio();

  const handleCreate = async () => {
    if (!name.trim()) return;
    const portfolio = await createPortfolio.mutateAsync({ name: name.trim() });
    setName('');
    setCreating(false);
    onSelect(portfolio.id);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">Portfolios</h2>
        <button
          onClick={() => setCreating((v) => !v)}
          className="text-xs text-accent hover:underline"
        >
          {creating ? 'Cancel' : '+ New'}
        </button>
      </div>

      {creating && (
        <div className="mb-3 flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Portfolio name"
            className="flex-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleCreate}
            disabled={createPortfolio.isPending}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-black disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      {portfolios.length === 0 ? (
        <p className="text-sm text-muted">
          No portfolios yet — create one to start tracking holdings.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {portfolios.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onSelect(p.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  p.id === selectedId
                    ? 'bg-accent-soft text-accent'
                    : 'text-foreground hover:bg-surface-2'
                }`}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
