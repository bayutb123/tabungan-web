'use client';

import { CashTransactionType } from '@/types/saving';

export default function TransactionTypeToggle({ value, onChange }: { value: CashTransactionType | 'all'; onChange: (value: CashTransactionType | 'all') => void }) {
  return (
    <select className="input-base" value={value} onChange={(e) => onChange(e.target.value as CashTransactionType | 'all')}>
      <option value="all">Semua Tipe</option>
      <option value="income">Pemasukan</option>
      <option value="expense">Pengeluaran</option>
      <option value="transfer_to_savings">Transfer ke Tabungan</option>
      <option value="transfer_from_savings">Tarik dari Tabungan</option>
    </select>
  );
}
