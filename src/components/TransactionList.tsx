'use client';

import { formatIDR } from '@/lib/formatCurrency';
import { SavingTransaction } from '@/types/saving';

export default function TransactionList({ transactions }: { transactions: SavingTransaction[] }) {
  if (!transactions.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-300">Belum ada transaksi.</p>;
  }

  return (
    <div className="space-y-2">
      {transactions.map((trx) => {
        const sign = trx.type === 'deposit' ? '+' : '-';
        return (
          <div key={trx.id} className="rounded-xl border bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{trx.type === 'deposit' ? 'Setoran' : 'Penarikan'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">{new Intl.DateTimeFormat('id-ID').format(trx.transactionDate)}</p>
              </div>
              <div className="text-right">
                <p className={trx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                  {sign}
                  {formatIDR(trx.amount)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-300">Saldo: {formatIDR(trx.balanceAfter)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
