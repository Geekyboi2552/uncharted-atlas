'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFromAPI } from 'frontend/src/app/lib/api.ts';

// Define the shape of your instrument data
interface Instrument {
  ticker: string;
  name: string;
  asset_class: string;
}

export default function WatchlistWidget() {
  const { data: instruments, isLoading, error } = useQuery<Instrument[]>({
    queryKey: ['instruments'],
    queryFn: () => fetchFromAPI('/instruments'),
  });

  if (isLoading) return <div className="p-4 text-emerald-500 animate-pulse">Loading data streams...</div>;
  if (error) return <div className="p-4 text-red-500">Error connecting to data feed.</div>;

  return (
    <div className="h-full w-full bg-slate-900 border border-slate-800 rounded-md p-4 overflow-auto flex flex-col">
      <h2 className="text-emerald-500 font-mono text-sm font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
        Active Watchlist
      </h2>
      <table className="w-full text-left text-sm font-mono text-slate-300">
        <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
          <tr>
            <th className="px-4 py-2 rounded-tl-sm">Ticker</th>
            <th className="px-4 py-2">Entity Name</th>
            <th className="px-4 py-2 rounded-tr-sm">Class</th>
          </tr>
        </thead>
        <tbody>
          {instruments?.map((stock) => (
            <tr key={stock.ticker} className="border-b border-slate-800/50 hover:bg-slate-800 transition-colors">
              <td className="px-4 py-3 font-semibold text-emerald-400">{stock.ticker}</td>
              <td className="px-4 py-3">{stock.name}</td>
              <td className="px-4 py-3 text-slate-500">{stock.asset_class}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}