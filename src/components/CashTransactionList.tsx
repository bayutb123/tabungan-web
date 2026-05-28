'use client';

import { CashTransaction } from '@/types/saving';
import { formatIDR } from '@/lib/formatCurrency';

function trxLabel(type: CashTransaction['type']): string {
  if (type === 'income') return 'Pemasukan';
  if (type === 'expense') return 'Pengeluaran';
  if (type === 'transfer_to_savings') return 'Transfer ke Tabungan';
  return 'Tarik dari Tabungan';
}

export default function CashTransactionList({ transactions }: { transactions: CashTransaction[] }) {
  if (!transactions.length) {
    return <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">Belum ada transaksi.</p>;
  }

  return (
    <div className="space-y-2">
      {transactions.map((trx) => {
        const isIncome = trx.type === 'income' || trx.type === 'transfer_from_savings';
        return (
          <div key={trx.id} className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold tracking-tight">{trxLabel(trx.type)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">{new Intl.DateTimeFormat('id-ID').format(trx.transactionDate)}</p>
                {trx.categoryName ? <p className="text-xs text-slate-500 dark:text-slate-300">Kategori: {trx.categoryName}</p> : null}
                {trx.note ? <p className="text-xs text-slate-500 dark:text-slate-300">{trx.note}</p> : null}
              </div>
              <p className={`text-base font-semibold tabular-nums ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isIncome ? '+' : '-'}{formatIDR(trx.amount)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
