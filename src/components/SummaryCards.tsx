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
        <div key={item.label} className="panel p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">{item.label}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
