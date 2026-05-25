'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingState from '@/components/LoadingState';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { formatIDR } from '@/lib/formatCurrency';
import { calculateProgress } from '@/lib/progress';
import { addTransaction, deleteGoal, getGoal, subscribeTransactions } from '@/lib/firebase/firestore';
import { SavingGoal, SavingTransaction } from '@/types/saving';
import { useAuth } from '@/providers/AuthProvider';

function parseDateOnlyAsLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error('Terjadi kesalahan. Coba lagi.');
  }
  return new Date(year, month - 1, day);
}

export default function GoalDetailPage() {
  const { user } = useAuth();
  const { goalId } = useParams<{ goalId: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<SavingGoal | null>(null);
  const [transactions, setTransactions] = useState<SavingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getGoal(user.uid, goalId)
      .then(setGoal)
      .catch((err) => setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.'))
      .finally(() => setLoading(false));

    const unsub = subscribeTransactions(user.uid, goalId, setTransactions, () => setError('Koneksi bermasalah. Coba lagi.'));
    return () => unsub();
  }, [goalId, user]);

  if (loading) {
    return (
      <AuthGuard>
        <AppShell>
          <LoadingState />
        </AppShell>
      </AuthGuard>
    );
  }

  if (!goal) {
    return (
      <AuthGuard>
        <AppShell>
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error || 'Data tabungan tidak ditemukan.'}
          </p>
        </AppShell>
      </AuthGuard>
    );
  }

  const progress = calculateProgress(goal.currentBalance, goal.targetAmount);

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-4">
          {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{goal.name}</h2>
              <p>
                  Saldo: {formatIDR(goal.currentBalance)} / {formatIDR(goal.targetAmount)}
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-brand-600" style={{ width: `${progress}%` }} />
              </div>
              <p>{progress}% tercapai</p>
                {goal.targetDate ? (
                  <p className="text-sm text-slate-500">
                    Target date: {new Intl.DateTimeFormat('id-ID').format(goal.targetDate)}
                  </p>
                ) : null}
              <div className="flex gap-2">
                <Link href={`/goals/${goal.id}/edit`} className="rounded-lg border px-3 py-2">
                    Edit
                </Link>
                <button className="rounded-lg border border-red-300 px-3 py-2 text-red-700" onClick={() => setConfirmOpen(true)}>
                    Hapus
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Tambah Transaksi</h3>
                <TransactionForm
                  onSubmit={async (payload) => {
                    if (!user) return;
                    await addTransaction({
                      uid: user.uid,
                      goalId: goal.id,
                      type: payload.type,
                      amount: payload.amount,
                      note: payload.note,
                      transactionDate: parseDateOnlyAsLocalDate(payload.transactionDate),
                    });
                    const latest = await getGoal(user.uid, goal.id);
                    setGoal(latest);
                  }}
                />
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Riwayat Transaksi</h3>
                <TransactionList transactions={transactions} />
            </div>
          </div>
        </div>
      </AppShell>
      <ConfirmDialog
        open={confirmOpen}
        title="Hapus Tujuan"
        description="Apakah kamu yakin ingin menghapus tujuan ini?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (!user) return;
          await deleteGoal(user.uid, goal.id);
          router.push('/dashboard');
        }}
      />
    </AuthGuard>
  );
}
