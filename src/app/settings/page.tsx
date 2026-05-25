'use client';

import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/providers/AuthProvider';

export default function SettingsPage() {
  const { user, signOutUser } = useAuth();
  return (
    <AuthGuard>
      <AppShell>
        <div className="panel max-w-xl p-5">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-lg dark:bg-slate-700">
                {user?.displayName?.charAt(0) ?? 'U'}
              </div>
            )}
            <p>Nama: {user?.displayName}</p>
            <p>Email: {user?.email}</p>
            <p>Mata uang: IDR</p>
            <button
              className="inline-flex items-center justify-center rounded-xl border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900/80 dark:text-red-400 dark:hover:bg-red-950/30"
              onClick={async () => {
                await signOutUser();
              }}
            >
              Keluar
            </button>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
