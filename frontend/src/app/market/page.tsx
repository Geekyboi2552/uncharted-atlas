'use client';

import { useState } from 'react';
import { InstrumentList } from '@/components/InstrumentList';
import { PriceChart } from '@/components/PriceChart';

export default function MarketPage() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold">Market</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <InstrumentList selected={selectedTicker} onSelect={setSelectedTicker} />
        <PriceChart ticker={selectedTicker} />
      </div>
    </main>
  );
}
