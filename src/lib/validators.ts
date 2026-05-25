import { SavingGoalStatus, TransactionType } from '@/types/saving';

type GoalInput = {
  name: string;
  targetAmount: number | string;
  status?: SavingGoalStatus;
};

type TransactionInput = {
  type: TransactionType;
  amount: number | string;
};

export function normalizeAmountInput(value: number | string): number {
  const normalized = Number.parseInt(String(value).replace(/[^\d-]/g, ''), 10);
  if (Number.isNaN(normalized)) {
    throw new Error('Nominal harus lebih dari Rp0.');
  }
  return normalized;
}

export function validateGoalInput(input: GoalInput): void {
  if (!input.name.trim()) {
    throw new Error('Nama tujuan tabungan wajib diisi.');
  }
  const targetAmount = normalizeAmountInput(input.targetAmount);
  if (targetAmount <= 0) {
    throw new Error('Target tabungan harus lebih dari Rp0.');
  }
  if (input.status && !['active', 'completed', 'archived'].includes(input.status)) {
    throw new Error('Terjadi kesalahan. Coba lagi.');
  }
}

export function validateTransactionInput(input: TransactionInput): void {
  if (!['deposit', 'withdrawal'].includes(input.type)) {
    throw new Error('Terjadi kesalahan. Coba lagi.');
  }
  const amount = normalizeAmountInput(input.amount);
  if (amount <= 0) {
    throw new Error('Nominal harus lebih dari Rp0.');
  }
}
