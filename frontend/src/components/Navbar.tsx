'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/auth-context';

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/market', label: 'Market' },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-semibold tracking-tight">Uncharted Atlas</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {user &&
            links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  pathname?.startsWith(l.href)
                    ? 'text-foreground'
                    : 'text-muted transition-colors hover:text-foreground'
                }
              >
                {l.label}
              </Link>
            ))}

          {loading ? null : user ? (
            <button
              onClick={handleSignOut}
              className="rounded-full border border-border px-3 py-1.5 text-muted transition-colors hover:border-accent hover:text-foreground"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-accent px-3 py-1.5 font-medium text-black transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
