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
    <form onSubmit={submit} className="panel space-y-3 p-5">
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <input className="input-base" placeholder="Nama Tujuan" required value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
      <input className="input-base" placeholder="Target (IDR)" required type="number" value={values.targetAmount} onChange={(e) => setValues({ ...values, targetAmount: e.target.value })} />
      <input className="input-base" type="date" value={values.targetDate} onChange={(e) => setValues({ ...values, targetDate: e.target.value })} />
      <input className="input-base" placeholder="Kategori" value={values.category} onChange={(e) => setValues({ ...values, category: e.target.value })} />
      <textarea className="input-base min-h-24" placeholder="Catatan" rows={3} value={values.note} onChange={(e) => setValues({ ...values, note: e.target.value })} />
      {mode === 'edit' ? (
        <select className="input-base" value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as SavingGoalStatus })}>
          <option value="active">Aktif</option>
          <option value="completed">Selesai</option>
          <option value="archived">Arsip</option>
        </select>
      ) : null}
      <button disabled={loading} className="btn-primary" type="submit">
        {loading ? 'Menyimpan...' : mode === 'create' ? 'Simpan Tujuan' : 'Update Tujuan'}
      </button>
    </form>
  );
}
