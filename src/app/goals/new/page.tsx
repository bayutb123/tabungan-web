'use client';

import { useRouter } from 'next/navigation';
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
        <div className="mx-auto w-full max-w-2xl space-y-3">
          <div className="panel p-5">
            <h2 className="text-2xl font-semibold tracking-tight">Tambah Tujuan</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Buat goal baru dengan format input yang sama seperti quick actions.</p>
          </div>
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
        </div>
      </AppShell>
    </AuthGuard>
  );
}
