'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
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
        <Stack spacing={3}>
          <SummaryCards {...summary} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="Cari tujuan" value={search} onChange={(e) => setSearch(e.target.value)} />
            <TextField
              select
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | SavingGoalStatus)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">Semua</MenuItem>
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="completed">Selesai</MenuItem>
              <MenuItem value="archived">Arsip</MenuItem>
            </TextField>
            <Button component={Link} href="/goals/new" variant="contained">
              Tambah Tujuan
            </Button>
          </Stack>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {loading ? <LoadingState /> : null}
          {!loading && !filteredGoals.length ? (
            <EmptyState title="Belum ada tujuan." description="Tambah tujuan tabungan pertama kamu sekarang." />
          ) : null}
          <Stack spacing={2}>
            {filteredGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </Stack>
        </Stack>
      </AppShell>
    </AuthGuard>
  );
}
