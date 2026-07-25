import Link from 'next/link';
import { PriceChart } from '@/components/PriceChart';

export default async function InstrumentPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <Link href="/market" className="mb-4 inline-block text-sm text-muted hover:text-accent">
        ← All instruments
      </Link>
      <h1 className="mb-6 text-xl font-semibold">{upperTicker}</h1>
      <PriceChart ticker={upperTicker} />
    </main>
  );
}
