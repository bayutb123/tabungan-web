'use client';

import { FormEvent, useState } from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField } from '@mui/material';
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
    <Box component="form" onSubmit={submit}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField label="Nama Tujuan" required value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
        <TextField label="Target (IDR)" required type="number" value={values.targetAmount} onChange={(e) => setValues({ ...values, targetAmount: e.target.value })} />
        <TextField label="Target Date" type="date" value={values.targetDate} onChange={(e) => setValues({ ...values, targetDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Kategori" value={values.category} onChange={(e) => setValues({ ...values, category: e.target.value })} />
        <TextField label="Catatan" multiline minRows={3} value={values.note} onChange={(e) => setValues({ ...values, note: e.target.value })} />
        {mode === 'edit' ? (
          <TextField select label="Status" value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as SavingGoalStatus })}>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="completed">Selesai</MenuItem>
            <MenuItem value="archived">Arsip</MenuItem>
          </TextField>
        ) : null}
        <Button disabled={loading} variant="contained" type="submit">
          {loading ? 'Menyimpan...' : mode === 'create' ? 'Simpan Tujuan' : 'Update Tujuan'}
        </Button>
      </Stack>
    </Box>
  );
}
