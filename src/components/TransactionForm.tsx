'use client';

import { FormEvent, useState } from 'react';
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
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
    <Stack component="form" spacing={2} onSubmit={submit}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField select label="Jenis Transaksi" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
        <MenuItem value="deposit">Setoran</MenuItem>
        <MenuItem value="withdrawal">Penarikan</MenuItem>
      </TextField>
      <TextField label="Nominal (IDR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <TextField
        label="Tanggal Transaksi"
        type="date"
        value={transactionDate}
        onChange={(e) => setTransactionDate(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField label="Catatan" multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Tambah Transaksi'}
      </Button>
    </Stack>
  );
}
