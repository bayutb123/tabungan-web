'use client';

import { useRouter } from 'next/navigation';
import { Stack, Typography } from '@mui/material';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import GoalForm from '@/components/GoalForm';
import { createGoal } from '@/lib/firebase/firestore';
import { useAuth } from '@/providers/AuthProvider';

export default function NewGoalPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <AuthGuard>
      <AppShell>
        <Stack spacing={2}>
          <Typography variant="h5">Tambah Tujuan</Typography>
          <GoalForm
            mode="create"
            onSubmit={async (values) => {
              if (!user) return;
              await createGoal(user.uid, {
                name: values.name,
                targetAmount: values.targetAmount,
                targetDate: values.targetDate ? new Date(values.targetDate) : null,
                note: values.note,
                category: values.category,
              });
              router.push('/dashboard');
            }}
          />
        </Stack>
      </AppShell>
    </AuthGuard>
  );
}
