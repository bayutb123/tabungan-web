import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './client';
import { calculateProgress } from '@/lib/progress';
import { normalizeAmountInput, validateGoalInput, validateTransactionInput } from '@/lib/validators';
import { SavingGoal, SavingGoalStatus, SavingTransaction, TransactionType } from '@/types/saving';

type GoalInput = {
  name: string;
  targetAmount: number | string;
  targetDate?: Date | null;
  note?: string | null;
  category?: string | null;
  status?: SavingGoalStatus;
};

type GoalFilter = {
  status?: 'all' | SavingGoalStatus;
};

type AddTransactionInput = {
  uid: string;
  goalId: string;
  type: TransactionType;
  amount: number | string;
  note?: string | null;
  transactionDate: Date;
};

const toDate = (value: unknown): Date => {
  if (value instanceof Timestamp) return value.toDate();
  return new Date();
};

function mapGoal(snap: { id: string; data: () => Record<string, unknown> }): SavingGoal {
  const data = snap.data();
  return {
    id: snap.id,
    ownerUid: String(data.ownerUid),
    name: String(data.name),
    targetAmount: Number(data.targetAmount),
    currentBalance: Number(data.currentBalance),
    currency: 'IDR',
    targetDate: data.targetDate instanceof Timestamp ? data.targetDate.toDate() : null,
    note: (data.note as string | null) ?? null,
    category: (data.category as string | null) ?? null,
    status: data.status as SavingGoalStatus,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapTransaction(snap: { id: string; data: () => Record<string, unknown> }): SavingTransaction {
  const data = snap.data();
  return {
    id: snap.id,
    ownerUid: String(data.ownerUid),
    goalId: String(data.goalId),
    type: data.type as TransactionType,
    amount: Number(data.amount),
    note: (data.note as string | null) ?? null,
    transactionDate: toDate(data.transactionDate),
    balanceAfter: Number(data.balanceAfter),
    createdAt: toDate(data.createdAt),
  };
}

export function subscribeGoals(
  uid: string,
  filters: GoalFilter,
  callback: (goals: SavingGoal[]) => void,
  onError?: (error: Error) => void
): () => void {
  const goalsRef = collection(db, 'users', uid, 'savingGoals');
  const q =
    filters.status && filters.status !== 'all'
      ? query(goalsRef, where('status', '==', filters.status), orderBy('updatedAt', 'desc'))
      : query(goalsRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map(mapGoal)),
    (error) => onError?.(error)
  );
}

export async function getGoal(uid: string, goalId: string): Promise<SavingGoal> {
  const goalRef = doc(db, 'users', uid, 'savingGoals', goalId);
  const snapshot = await getDoc(goalRef);
  if (!snapshot.exists()) {
    throw new Error('Data tabungan tidak ditemukan.');
  }
  return mapGoal(snapshot);
}

export async function createGoal(uid: string, input: GoalInput): Promise<void> {
  validateGoalInput({ name: input.name, targetAmount: input.targetAmount, status: 'active' });
  const targetAmount = normalizeAmountInput(input.targetAmount);

  await addDoc(collection(db, 'users', uid, 'savingGoals'), {
    ownerUid: uid,
    name: input.name.trim(),
    targetAmount,
    currentBalance: 0,
    currency: 'IDR',
    targetDate: input.targetDate ? Timestamp.fromDate(input.targetDate) : null,
    note: input.note?.trim() || null,
    category: input.category?.trim() || null,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateGoal(uid: string, goalId: string, input: GoalInput): Promise<void> {
  validateGoalInput({ name: input.name, targetAmount: input.targetAmount, status: input.status });
  const goalRef = doc(db, 'users', uid, 'savingGoals', goalId);
  const targetAmount = normalizeAmountInput(input.targetAmount);
  const currentGoal = await getGoal(uid, goalId);
  const status = input.status ?? (calculateProgress(currentGoal.currentBalance, targetAmount) >= 100 ? 'completed' : 'active');

  await updateDoc(goalRef, {
    name: input.name.trim(),
    targetAmount,
    targetDate: input.targetDate ? Timestamp.fromDate(input.targetDate) : null,
    note: input.note?.trim() || null,
    category: input.category?.trim() || null,
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGoal(uid: string, goalId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'savingGoals', goalId));
}

export function subscribeTransactions(
  uid: string,
  goalId: string,
  callback: (transactions: SavingTransaction[]) => void,
  onError?: (error: Error) => void
): () => void {
  const transactionsRef = collection(db, 'users', uid, 'savingGoals', goalId, 'transactions');
  const q = query(transactionsRef, orderBy('transactionDate', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map(mapTransaction)),
    (error) => onError?.(error)
  );
}

export async function addTransaction(input: AddTransactionInput): Promise<void> {
  validateTransactionInput({ type: input.type, amount: input.amount });
  const amount = normalizeAmountInput(input.amount);

  await runTransaction(db, async (transaction) => {
    const goalRef = doc(db, 'users', input.uid, 'savingGoals', input.goalId);
    const goalSnap = await transaction.get(goalRef);
    if (!goalSnap.exists()) {
      throw new Error('Data tabungan tidak ditemukan.');
    }

    const goal = goalSnap.data();
    const currentBalance = Number(goal.currentBalance);
    const targetAmount = Number(goal.targetAmount);
    const delta = input.type === 'deposit' ? amount : -amount;
    const newBalance = currentBalance + delta;
    if (newBalance < 0) {
      throw new Error('Saldo tidak cukup untuk penarikan.');
    }

    const trxRef = doc(collection(goalRef, 'transactions'));
    const nextStatus: SavingGoalStatus = newBalance >= targetAmount ? 'completed' : 'active';

    transaction.set(trxRef, {
      id: trxRef.id,
      ownerUid: input.uid,
      goalId: input.goalId,
      type: input.type,
      amount,
      note: input.note?.trim() || null,
      transactionDate: Timestamp.fromDate(input.transactionDate),
      balanceAfter: newBalance,
      createdAt: serverTimestamp(),
    });

    transaction.update(goalRef, {
      currentBalance: newBalance,
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function deleteTransaction(uid: string, goalId: string, transactionId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'savingGoals', goalId, 'transactions', transactionId));
}
