'use client';

import { useState } from 'react';
import { useInstruments } from '@/app/lib/hooks';

interface Props {
  selected: string | null;
  onSelect: (ticker: string) => void;
}

export function InstrumentList({ selected, onSelect }: Props) {
  const { data: instruments, isLoading } = useInstruments();
  const [query, setQuery] = useState('');

  const filtered = instruments?.filter(
    (i) =>
      i.ticker.toLowerCase().includes(query.toLowerCase()) ||
      i.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search instruments…"
        className="mb-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm outline-none focus:border-accent"
      />

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : !filtered || filtered.length === 0 ? (
        <p className="text-sm text-muted">No instruments found.</p>
      ) : (
        <ul className="scrollbar-thin max-h-96 overflow-y-auto">
          {filtered.map((i) => (
            <li key={i.id}>
              <button
                onClick={() => onSelect(i.ticker)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  i.ticker === selected ? 'bg-accent-soft text-accent' : 'hover:bg-surface-2'
                }`}
              >
                <span className="font-medium">{i.ticker}</span>
                <span className="truncate pl-3 text-xs text-muted">{i.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
