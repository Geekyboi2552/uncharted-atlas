import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950">
      <div className="z-10 max-w-2xl w-full flex flex-col items-center font-mono text-center">
        
        {/* Terminal Header */}
        <h1 className="text-5xl font-bold text-emerald-500 mb-6 tracking-tight">
          UNCHARTED ATLAS
        </h1>
        
        <p className="text-slate-400 mb-12 text-lg">
          Quantitative Analytics & Ingestion Engine v1.0.0
        </p>

        {/* Entry Button */}
        <Link
          href="/dashboard"
          className="border-2 border-emerald-500 text-emerald-500 px-8 py-3 text-lg hover:bg-emerald-500 hover:text-slate-950 transition-all duration-200 uppercase tracking-widest font-semibold"
        >
          Initialize Workspace
        </Link>
        
      </div>
    </main>
  );
}
