'use client';

import { formatIDR } from '@/lib/formatCurrency';

type Props = {
  cashBalance: number;
  totalSavings: number;
  monthlyIncome: number;
  monthlyExpense: number;
};

export default function CashSummaryCards({ cashBalance, totalSavings, monthlyIncome, monthlyExpense }: Props) {
  const totalAssets = cashBalance + totalSavings;
  const items = [
    { label: 'Saldo Tersedia', value: formatIDR(cashBalance) },
    { label: 'Total Tabungan', value: formatIDR(totalSavings) },
    { label: 'Total Aset', value: formatIDR(totalAssets) },
    { label: 'Pemasukan Bulan Ini', value: formatIDR(monthlyIncome) },
    { label: 'Pengeluaran Bulan Ini', value: formatIDR(monthlyExpense) },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="panel p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">{item.label}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
