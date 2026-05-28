'use client';

import { FormEvent, useMemo, useState } from 'react';
import { TransactionCategory } from '@/types/saving';

type Mode = 'create-income' | 'create-expense' | 'edit-income' | 'edit-expense';

type Props = {
  mode: Mode;
  categories: TransactionCategory[];
  initialValues?: { amount?: number; categoryId?: string; note?: string; transactionDate?: string };
  onSubmit: (payload: { amount: number; categoryId: string; categoryName: string; note: string | null; transactionDate: Date }) => Promise<void>;
  onCancel?: () => void;
};

function parseDateOnlyAsLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export default function CashTransactionForm({ mode, categories, initialValues, onSubmit, onCancel }: Props) {
  const [amount, setAmount] = useState(initialValues?.amount ? String(initialValues.amount) : '');
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
  const [note, setNote] = useState(initialValues?.note ?? '');
  const [transactionDate, setTransactionDate] = useState(initialValues?.transactionDate ?? new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedCategory = useMemo(() => categories.find((cat) => cat.id === categoryId) ?? null, [categories, categoryId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const parsedAmount = Number.parseInt(amount, 10);
    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      setError('Nominal harus lebih dari Rp0.');
      return;
    }
    if (!selectedCategory) {
      setError('Kategori wajib dipilih.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        amount: parsedAmount,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        note: note.trim() || null,
        transactionDate: parseDateOnlyAsLocalDate(transactionDate),
      });
      setAmount('');
      setCategoryId('');
      setNote('');
    } catch {
      setError('Transaksi gagal disimpan.');
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = mode.includes('income') ? 'Pemasukan' : 'Pengeluaran';

  return (
    <form className="space-y-3" onSubmit={submit}>
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <p className="text-sm text-slate-600 dark:text-slate-300">Tipe: {typeLabel}</p>
      <input className="input-base" type="number" min={1} step={1} placeholder="Nominal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <select className="input-base" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Pilih kategori</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <input className="input-base" type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
      <textarea className="input-base min-h-20" rows={2} placeholder="Catatan" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex gap-2">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
        {onCancel ? (
          <button className="btn-ghost" type="button" onClick={onCancel}>
            Batal
          </button>
        ) : null}
      </div>
    </form>
  );
}
