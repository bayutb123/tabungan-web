'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import CashSummaryCards from '@/components/CashSummaryCards';
import CashTransactionForm from '@/components/CashTransactionForm';
import EmptyState from '@/components/EmptyState';
import GoalCard from '@/components/GoalCard';
import LoadingState from '@/components/LoadingState';
import TransferToSavingDialog from '@/components/TransferToSavingDialog';
import {
  addCashTransaction,
  subscribeCategories,
  subscribeGoals,
  subscribeToCashAccount,
  subscribeToCashTransactions,
  transferFromSavingGoal,
  transferToSavingGoal,
} from '@/lib/firebase/firestore';
import { formatIDR } from '@/lib/formatCurrency';
import { CashAccount, CashTransaction, SavingGoal, SavingGoalStatus, TransactionCategory } from '@/types/saving';
import { useAuth } from '@/providers/AuthProvider';

function monthRange(base: Date): { start: Date; end: Date } {
  const start = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function trxLabel(type: CashTransaction['type']): string {
  if (type === 'income') return 'Pemasukan';
  if (type === 'expense') return 'Pengeluaran';
  if (type === 'transfer_to_savings') return 'Transfer ke Tabungan';
  return 'Tarik dari Tabungan';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [cashAccount, setCashAccount] = useState<CashAccount | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [incomeCategories, setIncomeCategories] = useState<TransactionCategory[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<TransactionCategory[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SavingGoalStatus>('all');
  const [search, setSearch] = useState('');
  const [activeDialog, setActiveDialog] = useState<null | 'income' | 'expense' | 'to_savings' | 'from_savings'>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const { start, end } = monthRange(new Date());

    const unsubGoals = subscribeGoals(
      user.uid,
      { status: statusFilter },
      (next) => {
        setGoals(next);
        setLoading(false);
      },
      () => {
        setError('Koneksi bermasalah. Coba lagi.');
        setLoading(false);
      }
    );

    const unsubCash = subscribeToCashAccount(user.uid, setCashAccount);
    const unsubIncome = subscribeToCashTransactions({
      uid: user.uid,
      type: 'income',
      startDate: start,
      endDate: end,
      callback: (rows) => setMonthlyIncome(rows.reduce((sum, row) => sum + row.amount, 0)),
    });
    const unsubExpense = subscribeToCashTransactions({
      uid: user.uid,
      type: 'expense',
      startDate: start,
      endDate: end,
      callback: (rows) => setMonthlyExpense(rows.reduce((sum, row) => sum + row.amount, 0)),
    });
    const unsubIncomeCategories = subscribeCategories(user.uid, 'income', setIncomeCategories);
    const unsubExpenseCategories = subscribeCategories(user.uid, 'expense', setExpenseCategories);
    const unsubRecentTransactions = subscribeToCashTransactions({
      uid: user.uid,
      type: 'all',
      limitCount: 20,
      callback: setRecentTransactions,
    });

    return () => {
      unsubGoals();
      unsubCash();
      unsubIncome();
      unsubExpense();
      unsubIncomeCategories();
      unsubExpenseCategories();
      unsubRecentTransactions();
    };
  }, [statusFilter, user]);

  const filteredGoals = useMemo(
    () => goals.filter((goal) => goal.name.toLowerCase().includes(search.toLowerCase())),
    [goals, search]
  );

  const totalSavings = useMemo(
    () =>
      goals
        .filter((goal) => goal.status === 'active' || goal.status === 'completed')
        .reduce((sum, goal) => sum + goal.currentBalance, 0),
    [goals]
  );

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-6">
          <CashSummaryCards
            cashBalance={cashAccount?.currentBalance ?? 0}
            totalSavings={totalSavings}
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
          />

          <div className="panel p-4">
            <p className="mb-3 text-sm font-semibold">Quick Actions</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <button className="btn-primary" type="button" onClick={() => setActiveDialog('income')}>
                Tambah Pemasukan
              </button>
              <button className="btn-primary" type="button" onClick={() => setActiveDialog('expense')}>
                Tambah Pengeluaran
              </button>
              <button className="btn-primary" type="button" onClick={() => setActiveDialog('to_savings')}>
                Transfer ke Tabungan
              </button>
              <button className="btn-primary" type="button" onClick={() => setActiveDialog('from_savings')}>
                Tarik dari Tabungan
              </button>
            </div>
          </div>

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold tracking-tight">Riwayat Transaksi</h3>
                <Link href="/transactions" className="btn-ghost">
                  Lihat Semua
                </Link>
              </div>
              {recentTransactions.length ? (
                <div className="space-y-2">
                  {recentTransactions.map((trx) => {
                    const isPositive = trx.type === 'income' || trx.type === 'transfer_from_savings';
                    return (
                      <div key={trx.id} className="panel p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{trxLabel(trx.type)}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-300">
                              {new Intl.DateTimeFormat('id-ID').format(trx.transactionDate)}
                            </p>
                            {trx.categoryName ? <p className="text-xs text-slate-500 dark:text-slate-300">{trx.categoryName}</p> : null}
                          </div>
                          <p className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isPositive ? '+' : '-'}{formatIDR(trx.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Belum ada transaksi." description="Tambahkan pemasukan atau pengeluaran pertamamu." />
              )}
            </section>

            <section className="space-y-3" id="tabungan">
              <h3 className="text-lg font-semibold tracking-tight">Tujuan Tabungan</h3>
              <div className="panel-soft flex flex-col gap-2 p-3">
                <input className="input-base" placeholder="Cari tujuan" value={search} onChange={(e) => setSearch(e.target.value)} />
                <select
                  className="input-base"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | SavingGoalStatus)}
                >
                  <option value="all">Semua</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                  <option value="archived">Arsip</option>
                </select>
                <Link href="/goals/new" className="btn-primary">
                  Tambah Tujuan
                </Link>
              </div>
              {loading ? <LoadingState /> : null}
              {!loading && !filteredGoals.length ? (
                <EmptyState title="Belum ada tujuan." description="Tambah tujuan tabungan pertama kamu sekarang." />
              ) : null}
              <div className="space-y-3">
                {filteredGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          </div>
        </div>

        <ActionDialog open={activeDialog === 'income'} title="Tambah Pemasukan" onClose={() => setActiveDialog(null)}>
          <CashTransactionForm
            mode="create-income"
            categories={incomeCategories}
            onSubmit={async (payload) => {
              await addCashTransaction({ uid: user!.uid, type: 'income', ...payload });
              setActiveDialog(null);
            }}
          />
        </ActionDialog>
        <ActionDialog open={activeDialog === 'expense'} title="Tambah Pengeluaran" onClose={() => setActiveDialog(null)}>
          <CashTransactionForm
            mode="create-expense"
            categories={expenseCategories}
            onSubmit={async (payload) => {
              await addCashTransaction({ uid: user!.uid, type: 'expense', ...payload });
              setActiveDialog(null);
            }}
          />
        </ActionDialog>
        <ActionDialog open={activeDialog === 'to_savings'} title="Transfer ke Tabungan" onClose={() => setActiveDialog(null)}>
          <TransferToSavingDialog
            mode="to_savings"
            goals={goals.filter((goal) => goal.status !== 'archived')}
            maxCashBalance={cashAccount?.currentBalance ?? 0}
            onSubmit={async (payload) => {
              await transferToSavingGoal({ uid: user!.uid, ...payload });
              setActiveDialog(null);
            }}
          />
        </ActionDialog>
        <ActionDialog open={activeDialog === 'from_savings'} title="Tarik dari Tabungan" onClose={() => setActiveDialog(null)}>
          <TransferToSavingDialog
            mode="from_savings"
            goals={goals.filter((goal) => goal.status !== 'archived')}
            maxCashBalance={cashAccount?.currentBalance ?? 0}
            onSubmit={async (payload) => {
              await transferFromSavingGoal({ uid: user!.uid, ...payload });
              setActiveDialog(null);
            }}
          />
        </ActionDialog>
      </AppShell>
    </AuthGuard>
  );
}

function ActionDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <dialog open className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <button type="button" aria-label="Tutup dialog" className="absolute inset-0 h-full w-full cursor-default" onClick={onClose} />
      <div className="panel relative z-10 w-full max-w-lg p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="btn-ghost">
            Batal
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
