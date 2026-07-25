// frontend/src/app/page.tsx
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
            Uncharted Atlas
          </span>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
            A free portfolio analytics terminal for the Indian market
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Track holdings, compute Sharpe, Sortino, and Treynor ratios, and
            explore correlations across BSE-listed instruments — no
            Bloomberg subscription required.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          
            href="/login"
            className="flex h-12 items-center justify-center rounded-full bg-black px-6 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Get Started
          </a>
          
            href="/dashboard"
            className="flex h-12 items-center justify-center rounded-full border border-black/[.1] px-6 transition-colors hover:bg-black/[.04] dark:border-white/[.15] dark:hover:bg-[#1a1a1a]"
          >
            View Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
