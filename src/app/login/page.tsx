'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, router, user]);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Tracker Tabungan</h1>
          <p className="text-slate-600 dark:text-slate-300">Kelola target tabunganmu dengan rapi.</p>
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <button
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-60"
            onClick={async () => {
              setError('');
              try {
                await signInWithGoogle();
                router.replace('/dashboard');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
              }
            }}
          >
            Masuk dengan Google
          </button>
        </div>
      </div>
    </div>
  );
}
