'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import CashTransactionList from '@/components/CashTransactionList';
import CategorySelect from '@/components/CategorySelect';
import MonthFilter from '@/components/MonthFilter';
import TransactionTypeToggle from '@/components/TransactionTypeToggle';
import { subscribeCategories, subscribeToCashTransactions } from '@/lib/firebase/firestore';
import { CashTransaction, CashTransactionType, TransactionCategory } from '@/types/saving';
import { useAuth } from '@/providers/AuthProvider';

function monthRange(base: Date): { start: Date; end: Date } {
  const start = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date());
  const [type, setType] = useState<CashTransactionType | 'all'>('all');
  const [categoryId, setCategoryId] = useState<string | 'all'>('all');
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubCategories = subscribeCategories(user.uid, 'all', setCategories);
    return () => unsubCategories();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const { start, end } = monthRange(month);
    const unsub = subscribeToCashTransactions({
      uid: user.uid,
      startDate: start,
      endDate: end,
      type,
      categoryId,
      callback: setTransactions,
    });
    return () => unsub();
  }, [categoryId, month, type, user]);

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Riwayat Transaksi</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MonthFilter value={month} onChange={setMonth} />
            <TransactionTypeToggle value={type} onChange={setType} />
            <CategorySelect value={categoryId} categories={categories} onChange={setCategoryId} />
          </div>
          <CashTransactionList transactions={transactions} />
        </div>
      </AppShell>
    </AuthGuard>
  );
}
