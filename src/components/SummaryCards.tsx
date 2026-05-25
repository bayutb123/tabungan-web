'use client';

import { formatIDR } from '@/lib/formatCurrency';

type Props = {
  totalBalance: number;
  totalTarget: number;
  totalProgress: number;
  activeCount: number;
};

export default function SummaryCards({ totalBalance, totalTarget, totalProgress, activeCount }: Props) {
  const items = [
    { label: 'Total Saldo', value: formatIDR(totalBalance) },
    { label: 'Total Target', value: formatIDR(totalTarget) },
    { label: 'Progress Keseluruhan', value: `${totalProgress}%` },
    { label: 'Goal Aktif', value: String(activeCount) },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">{item.label}</p>
          <p className="text-lg font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
