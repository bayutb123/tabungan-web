'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import EmptyState from '@/components/EmptyState';
import GoalCard from '@/components/GoalCard';
import LoadingState from '@/components/LoadingState';
import SummaryCards from '@/components/SummaryCards';
import { calculateProgress } from '@/lib/progress';
import { subscribeGoals } from '@/lib/firebase/firestore';
import { SavingGoal, SavingGoalStatus } from '@/types/saving';
import { useAuth } from '@/providers/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SavingGoalStatus>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeGoals(
      user.uid,
      { status: statusFilter },
      (next) => {
        setGoals(next);
        setLoading(false);
      },
      () => {
        setError('Koneksi bermasalah. Coba lagi.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [statusFilter, user]);

  const filteredGoals = useMemo(
    () => goals.filter((goal) => goal.name.toLowerCase().includes(search.toLowerCase())),
    [goals, search]
  );

  const summary = useMemo(() => {
    const totalBalance = goals.reduce((sum, goal) => sum + goal.currentBalance, 0);
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    return {
      totalBalance,
      totalTarget,
      totalProgress: calculateProgress(totalBalance, totalTarget),
      activeCount: goals.filter((goal) => goal.status === 'active').length,
    };
  }, [goals]);

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-4">
          <SummaryCards {...summary} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="w-full rounded-lg border px-3 py-2" placeholder="Cari tujuan" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select
              className="min-w-44 rounded-lg border px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | SavingGoalStatus)}
            >
              <option value="all">Semua</option>
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
              <option value="archived">Arsip</option>
            </select>
            <Link href="/goals/new" className="rounded-lg bg-brand-600 px-4 py-2 text-center text-white">
              Tambah Tujuan
            </Link>
          </div>
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {loading ? <LoadingState /> : null}
          {!loading && !filteredGoals.length ? (
            <EmptyState title="Belum ada tujuan." description="Tambah tujuan tabungan pertama kamu sekarang." />
          ) : null}
          <div className="space-y-2">
            {filteredGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
