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
      className="panel block p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">{goal.name}</h3>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {goal.status === 'active' ? 'Aktif' : goal.status === 'completed' ? 'Selesai' : 'Arsip'}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {formatIDR(goal.currentBalance)} / {formatIDR(goal.targetAmount)}
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-full bg-slate-900 dark:bg-white" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-300">{progress}% tercapai</p>
      </div>
    </Link>
  );
}
