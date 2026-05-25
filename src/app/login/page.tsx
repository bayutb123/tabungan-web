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
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="panel-soft w-full p-7">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Welcome</p>
            <h1 className="text-3xl font-semibold tracking-tight">Tracker Tabungan</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Kelola target tabunganmu dengan rapi.</p>
          </div>
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <button
            disabled={loading}
            className="btn-primary w-full"
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
