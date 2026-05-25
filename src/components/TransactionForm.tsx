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
    <form className="panel space-y-3 p-5" onSubmit={submit}>
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <select className="input-base" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
        <option value="deposit">Setoran</option>
        <option value="withdrawal">Penarikan</option>
      </select>
      <input className="input-base" placeholder="Nominal (IDR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <input className="input-base" type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
      <textarea className="input-base min-h-20" rows={2} placeholder="Catatan" value={note} onChange={(e) => setNote(e.target.value)} />
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Tambah Transaksi'}
      </button>
    </form>
  );
}
