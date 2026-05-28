'use client';

import { FormEvent, useState } from 'react';
import { SavingGoal } from '@/types/saving';

type Props = {
  mode: 'to_savings' | 'from_savings';
  goals: SavingGoal[];
  maxCashBalance: number;
  onSubmit: (payload: { goalId: string; amount: number; note: string | null; transactionDate: Date }) => Promise<void>;
};

function parseDateOnlyAsLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatRupiahInput(value: string): string {
  if (!value) return '';
  const numberValue = Number.parseInt(value, 10);
  if (!Number.isFinite(numberValue)) return '';
  return new Intl.NumberFormat('id-ID').format(numberValue);
}

export default function TransferToSavingDialog({ mode, goals, maxCashBalance, onSubmit }: Props) {
  const [goalId, setGoalId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedGoal = goals.find((goal) => goal.id === goalId) ?? null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const parsedAmount = Number.parseInt(amount, 10);

    if (!goalId) {
      setError('Tujuan tabungan wajib dipilih.');
      return;
    }
    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      setError('Nominal harus lebih dari Rp0.');
      return;
    }
    if (mode === 'to_savings' && parsedAmount > maxCashBalance) {
      setError('Saldo tersedia tidak cukup.');
      return;
    }
    if (mode === 'from_savings' && selectedGoal && parsedAmount > selectedGoal.currentBalance) {
      setError('Saldo tabungan tidak cukup.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ goalId, amount: parsedAmount, note: note.trim() || null, transactionDate: parseDateOnlyAsLocalDate(transactionDate) });
      setGoalId('');
      setAmount('');
      setNote('');
    } catch {
      setError('Transaksi gagal disimpan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={submit}>
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <select className="input-base" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
        <option value="">Pilih tujuan tabungan</option>
        {goals.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.name}
          </option>
        ))}
      </select>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-300">Rp</span>
        <input
          className="input-base pl-10"
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={formatRupiahInput(amount)}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
        />
      </div>
      <input className="input-base" type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
      <textarea className="input-base min-h-20" rows={2} placeholder="Catatan" value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}
