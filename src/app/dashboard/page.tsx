'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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
import { CashAccount, SavingGoal, SavingGoalStatus, TransactionCategory } from '@/types/saving';
import { useAuth } from '@/providers/AuthProvider';

function monthRange(base: Date): { start: Date; end: Date } {
  const start = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [cashAccount, setCashAccount] = useState<CashAccount | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [incomeCategories, setIncomeCategories] = useState<TransactionCategory[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SavingGoalStatus>('all');
  const [search, setSearch] = useState('');

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

    return () => {
      unsubGoals();
      unsubCash();
      unsubIncome();
      unsubExpense();
      unsubIncomeCategories();
      unsubExpenseCategories();
    };
  }, [statusFilter, user]);

  const filteredGoals = useMemo(
    () => goals.filter((goal) => goal.name.toLowerCase().includes(search.toLowerCase())),
    [goals, search]
  );

  const totalSavings = useMemo(
    () => goals.filter((goal) => goal.status === 'active' || goal.status === 'completed').reduce((sum, goal) => sum + goal.currentBalance, 0),
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

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="panel p-4">
              <p className="mb-3 text-sm font-semibold">Tambah Pemasukan</p>
              <CashTransactionForm
                mode="create-income"
                categories={incomeCategories}
                onSubmit={async (payload) => addCashTransaction({ uid: user!.uid, type: 'income', ...payload })}
              />
            </div>
            <div className="panel p-4">
              <p className="mb-3 text-sm font-semibold">Tambah Pengeluaran</p>
              <CashTransactionForm
                mode="create-expense"
                categories={expenseCategories}
                onSubmit={async (payload) => addCashTransaction({ uid: user!.uid, type: 'expense', ...payload })}
              />
            </div>
            <div className="panel p-4 space-y-5">
              <div>
                <p className="mb-3 text-sm font-semibold">Transfer ke Tabungan</p>
                <TransferToSavingDialog
                  mode="to_savings"
                  goals={goals.filter((goal) => goal.status !== 'archived')}
                  maxCashBalance={cashAccount?.currentBalance ?? 0}
                  onSubmit={async (payload) => transferToSavingGoal({ uid: user!.uid, ...payload })}
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold">Tarik dari Tabungan</p>
                <TransferToSavingDialog
                  mode="from_savings"
                  goals={goals.filter((goal) => goal.status !== 'archived')}
                  maxCashBalance={cashAccount?.currentBalance ?? 0}
                  onSubmit={async (payload) => transferFromSavingGoal({ uid: user!.uid, ...payload })}
                />
              </div>
            </div>
          </div>

          <div className="panel-soft flex flex-col gap-2 p-3 sm:flex-row" id="tabungan">
            <input className="input-base" placeholder="Cari tujuan" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select
              className="input-base min-w-44"
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

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {loading ? <LoadingState /> : null}
          {!loading && !filteredGoals.length ? (
            <EmptyState title="Belum ada tujuan." description="Tambah tujuan tabungan pertama kamu sekarang." />
          ) : null}
          <div className="space-y-3">
            {filteredGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
