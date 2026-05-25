'use client';

import { FormEvent, useState } from 'react';
import { SavingGoal, SavingGoalStatus } from '@/types/saving';

type GoalFormValues = {
  name: string;
  targetAmount: string;
  targetDate: string;
  note: string;
  category: string;
  status: SavingGoalStatus;
};

type Props = {
  mode: 'create' | 'edit';
  initialData?: SavingGoal;
  onSubmit: (values: GoalFormValues) => Promise<void>;
};

export default function GoalForm({ mode, initialData, onSubmit }: Props) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<GoalFormValues>({
    name: initialData?.name ?? '',
    targetAmount: String(initialData?.targetAmount ?? ''),
    targetDate: initialData?.targetDate ? initialData.targetDate.toISOString().slice(0, 10) : '',
    note: initialData?.note ?? '',
    category: initialData?.category ?? '',
    status: initialData?.status ?? 'active',
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <input className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Nama Tujuan" required value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
      <input className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Target (IDR)" required type="number" value={values.targetAmount} onChange={(e) => setValues({ ...values, targetAmount: e.target.value })} />
      <input className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" type="date" value={values.targetDate} onChange={(e) => setValues({ ...values, targetDate: e.target.value })} />
      <input className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Kategori" value={values.category} onChange={(e) => setValues({ ...values, category: e.target.value })} />
      <textarea className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Catatan" rows={3} value={values.note} onChange={(e) => setValues({ ...values, note: e.target.value })} />
        {mode === 'edit' ? (
          <select className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as SavingGoalStatus })}>
            <option value="active">Aktif</option>
            <option value="completed">Selesai</option>
            <option value="archived">Arsip</option>
          </select>
        ) : null}
      <button disabled={loading} className="rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-60" type="submit">
          {loading ? 'Menyimpan...' : mode === 'create' ? 'Simpan Tujuan' : 'Update Tujuan'}
      </button>
    </form>
  );
}
