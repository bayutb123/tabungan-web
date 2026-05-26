export type Currency = 'IDR';
export type SavingGoalStatus = 'active' | 'completed' | 'archived';
export type TransactionType = 'deposit' | 'withdrawal' | 'adjustment';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  currency: Currency;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingGoal {
  id: string;
  ownerUid: string;
  name: string;
  targetAmount: number;
  currentBalance: number;
  currency: Currency;
  targetDate: Date | null;
  note: string | null;
  category: string | null;
  status: SavingGoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingTransaction {
  id: string;
  ownerUid: string;
  goalId: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  transactionDate: Date;
  balanceAfter: number;
  createdAt: Date;
}
