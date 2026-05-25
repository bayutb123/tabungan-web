'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Alert, Stack, Typography } from '@mui/material';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import GoalForm from '@/components/GoalForm';
import LoadingState from '@/components/LoadingState';
import { getGoal, updateGoal } from '@/lib/firebase/firestore';
import { SavingGoal } from '@/types/saving';
import { useAuth } from '@/providers/AuthProvider';

export default function EditGoalPage() {
  const { user } = useAuth();
  const params = useParams<{ goalId: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<SavingGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getGoal(user.uid, params.goalId)
      .then(setGoal)
      .catch((err) => setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.'))
      .finally(() => setLoading(false));
  }, [params.goalId, user]);

  return (
    <AuthGuard>
      <AppShell>
        <Stack spacing={2}>
          <Typography variant="h5">Edit Tujuan</Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {loading ? <LoadingState /> : null}
          {goal ? (
            <GoalForm
              mode="edit"
              initialData={goal}
              onSubmit={async (values) => {
                if (!user) return;
                await updateGoal(user.uid, goal.id, {
                  name: values.name,
                  targetAmount: values.targetAmount,
                  targetDate: values.targetDate ? new Date(values.targetDate) : null,
                  note: values.note,
                  category: values.category,
                  status: values.status,
                });
                router.push(`/goals/${goal.id}`);
              }}
            />
          ) : null}
        </Stack>
      </AppShell>
    </AuthGuard>
  );
}
