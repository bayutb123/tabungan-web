export type Currency = 'IDR';
export type SavingGoalStatus = 'active' | 'completed' | 'archived';
export type TransactionType = 'deposit' | 'withdrawal' | 'adjustment';
export type CashTransactionType = 'income' | 'expense' | 'transfer_to_savings' | 'transfer_from_savings';

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

export interface CashAccount {
  id: 'default';
  ownerUid: string;
  currency: Currency;
  currentBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashTransaction {
  id: string;
  ownerUid: string;
  type: CashTransactionType;
  amount: number;
  currency: Currency;
  categoryId: string | null;
  categoryName: string | null;
  note: string | null;
  transactionDate: Date;
  relatedGoalId: string | null;
  relatedSavingTransactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionCategory {
  id: string;
  ownerUid: string;
  type: 'income' | 'expense';
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
