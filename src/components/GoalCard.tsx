'use client';

import Link from 'next/link';
import { SavingGoal } from '@/types/saving';
import { formatIDR } from '@/lib/formatCurrency';
import { calculateProgress } from '@/lib/progress';

export default function GoalCard({ goal }: { goal: SavingGoal }) {
  const progress = calculateProgress(goal.currentBalance, goal.targetAmount);
  return (
    <Link
      href={`/goals/${goal.id}`}
      className="block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{goal.name}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
            {goal.status === 'active' ? 'Aktif' : goal.status === 'completed' ? 'Selesai' : 'Arsip'}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {formatIDR(goal.currentBalance)} / {formatIDR(goal.targetAmount)}
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-full bg-brand-600" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm">{progress}% tercapai</p>
      </div>
    </Link>
  );
}
