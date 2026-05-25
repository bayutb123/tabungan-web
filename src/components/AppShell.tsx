'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useThemeMode } from '@/providers/ThemeProvider';

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, signOutUser } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  return (
    <div>
      <header className="bg-brand-700 text-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <h1 className="mr-auto text-lg font-semibold">Tracker Tabungan</h1>
          <Link href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </Link>
          <Link href="/settings" className="text-sm hover:underline">
            Settings
          </Link>
          <button type="button" className="rounded-md bg-white/20 px-2 py-1 text-xs" onClick={toggleMode}>
            {mode === 'dark' ? 'Light' : 'Dark'}
          </button>
          <div className="flex items-center gap-2">
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="Avatar" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs">
                {user?.displayName?.charAt(0) ?? 'U'}
              </div>
            )}
            <button type="button" className="rounded-md bg-white/20 px-2 py-1 text-xs" onClick={() => signOutUser()}>
              Keluar
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
