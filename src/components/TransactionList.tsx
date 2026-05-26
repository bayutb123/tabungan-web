'use client';

import { formatIDR } from '@/lib/formatCurrency';
import { SavingTransaction } from '@/types/saving';

function getTransactionPresentation(trx: SavingTransaction): { sign: '+' | '-'; label: string; amountClass: string } {
  if (trx.type === 'deposit') {
    return { sign: '+', label: 'Setoran', amountClass: 'text-emerald-600 dark:text-emerald-400' };
  }

  if (trx.type === 'withdrawal') {
    return { sign: '-', label: 'Penarikan', amountClass: 'text-rose-600 dark:text-rose-400' };
  }

  if (trx.amount >= 0) {
    return { sign: '+', label: 'Penyesuaian', amountClass: 'text-emerald-600 dark:text-emerald-400' };
  }

  return { sign: '-', label: 'Penyesuaian', amountClass: 'text-rose-600 dark:text-rose-400' };
}

export default function TransactionList({ transactions }: { transactions: SavingTransaction[] }) {
  if (!transactions.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-300">Belum ada transaksi.</p>;
  }

  return (
    <div className="space-y-2">
      {transactions.map((trx) => {
        const { sign, label, amountClass } = getTransactionPresentation(trx);
        return (
          <div key={trx.id} className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-semibold tracking-tight">{label}</p>
                {trx.note ? <p className="line-clamp-2 text-xs leading-relaxed text-slate-400 dark:text-slate-400">{trx.note}</p> : null}
                <p className="text-xs text-slate-500 dark:text-slate-300">{new Intl.DateTimeFormat('id-ID').format(trx.transactionDate)}</p>
              </div>
              <div className="flex-none text-right tabular-nums">
                <p className={`whitespace-nowrap text-base font-semibold ${amountClass}`}>
                  {sign}
                  {formatIDR(Math.abs(trx.amount))}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-300">Saldo: {formatIDR(trx.balanceAfter)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
