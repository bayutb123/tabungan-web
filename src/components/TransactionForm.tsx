'use client';

import { FormEvent, useState } from 'react';
import { TransactionType } from '@/types/saving';

type Props = {
  onSubmit: (payload: { type: TransactionType; amount: string; note: string; transactionDate: string }) => Promise<void>;
};

export default function TransactionForm({ onSubmit }: Props) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ type, amount, note, transactionDate });
      setAmount('');
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={submit}>
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <select className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
        <option value="deposit">Setoran</option>
        <option value="withdrawal">Penarikan</option>
      </select>
      <input className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Nominal (IDR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <input className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
      <textarea className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" rows={2} placeholder="Catatan" value={note} onChange={(e) => setNote(e.target.value)} />
      <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-60" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Tambah Transaksi'}
      </button>
    </form>
  );
}
