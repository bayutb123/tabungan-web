'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useThemeMode } from '@/providers/ThemeProvider';

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, signOutUser } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-[#0a0a0a]/80">
        <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <h1 className="mr-auto text-sm font-semibold tracking-tight">Tracker Tabungan</h1>
          <Link href="/dashboard" className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Dashboard
          </Link>
          <Link href="/settings" className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Settings
          </Link>
          <button type="button" className="btn-ghost !rounded-lg !px-2.5 !py-1.5 !text-xs" onClick={toggleMode}>
            {mode === 'dark' ? 'Light' : 'Dark'}
          </button>
          <div className="flex items-center gap-2">
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="Avatar" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs dark:bg-slate-700">
                {user?.displayName?.charAt(0) ?? 'U'}
              </div>
            )}
            <button type="button" className="btn-ghost !rounded-lg !px-2.5 !py-1.5 !text-xs" onClick={() => signOutUser()}>
              Keluar
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
