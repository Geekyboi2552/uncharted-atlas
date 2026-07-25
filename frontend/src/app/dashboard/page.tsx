'use client';

import { useEffect, useState } from 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { usePortfolios } from '@/app/lib/hooks';
import { PortfolioSwitcher } from '@/components/PortfolioSwitcher';
import { HoldingsTable } from '@/components/HoldingsTable';
import { MetricsPanel } from '@/components/MetricsPanel';
import { CorrelationHeatmap } from '@/components/CorrelationHeatmap';

const ResponsiveGridLayout = WidthProvider(Responsive);

const layouts: { lg: Layout } = {
  lg: [
    { i: 'portfolios', x: 0, y: 0, w: 3, h: 6, minW: 2, minH: 4 },
    { i: 'holdings', x: 3, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'metrics', x: 9, y: 0, w: 3, h: 6, minW: 3, minH: 4 },
    { i: 'correlation', x: 0, y: 6, w: 12, h: 6, minW: 4, minH: 4 },
  ],
};

export default function DashboardPage() {
  const { data: portfolios, isLoading } = usePortfolios();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedId && portfolios && portfolios.length > 0) {
      setSelectedId(portfolios[0].id);
    }
  }, [portfolios, selectedId]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>

      {isLoading ? (
        <p className="text-sm text-muted">Loading your portfolios…</p>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1024, md: 768, sm: 0 }}
          cols={{ lg: 12, md: 6, sm: 1 }}
          rowHeight={40}
          margin={[16, 16]}
          draggableHandle=".drag-handle"
        >
          <div key="portfolios" className="flex flex-col">
            <div className="drag-handle mb-1 cursor-move text-[10px] uppercase tracking-wide text-muted">
              ⠿ drag
            </div>
            <PortfolioSwitcher
              portfolios={portfolios ?? []}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          <div key="holdings" className="flex flex-col">
            <div className="drag-handle mb-1 cursor-move text-[10px] uppercase tracking-wide text-muted">
              ⠿ drag
            </div>
            <HoldingsTable portfolioId={selectedId} />
          </div>

          <div key="metrics" className="flex flex-col">
            <div className="drag-handle mb-1 cursor-move text-[10px] uppercase tracking-wide text-muted">
              ⠿ drag
            </div>
            <MetricsPanel portfolioId={selectedId} />
          </div>

          <div key="correlation" className="flex flex-col">
            <div className="drag-handle mb-1 cursor-move text-[10px] uppercase tracking-wide text-muted">
              ⠿ drag
            </div>
            <CorrelationHeatmap />
          </div>
        </ResponsiveGridLayout>
      )}
    </main>
  );
}
