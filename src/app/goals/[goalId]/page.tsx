'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Alert, Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
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
          <Alert severity="error">{error || 'Data tabungan tidak ditemukan.'}</Alert>
        </AppShell>
      </AuthGuard>
    );
  }

  const progress = calculateProgress(goal.currentBalance, goal.targetAmount);

  return (
    <AuthGuard>
      <AppShell>
        <Stack spacing={3}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h5">{goal.name}</Typography>
                <Typography>
                  Saldo: {formatIDR(goal.currentBalance)} / {formatIDR(goal.targetAmount)}
                </Typography>
                <LinearProgress value={progress} variant="determinate" />
                <Typography>{progress}% tercapai</Typography>
                {goal.targetDate ? (
                  <Typography color="text.secondary">
                    Target date: {new Intl.DateTimeFormat('id-ID').format(goal.targetDate)}
                  </Typography>
                ) : null}
                <Stack direction="row" spacing={1}>
                  <Button component={Link} href={`/goals/${goal.id}/edit`} variant="outlined">
                    Edit
                  </Button>
                  <Button color="error" variant="outlined" onClick={() => setConfirmOpen(true)}>
                    Hapus
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Tambah Transaksi</Typography>
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
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Riwayat Transaksi</Typography>
                <TransactionList transactions={transactions} />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
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
