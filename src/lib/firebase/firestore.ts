import {
  DocumentReference,
  QueryConstraint,
  Timestamp,
  Transaction,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './client';
import { calculateProgress } from '@/lib/progress';
import { normalizeAmountInput, validateGoalInput, validateTransactionInput } from '@/lib/validators';
import {
  CashAccount,
  CashTransaction,
  CashTransactionType,
  SavingGoal,
  SavingGoalStatus,
  SavingTransaction,
  TransactionCategory,
  TransactionType,
} from '@/types/saving';

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

const DEFAULT_CATEGORIES: Array<Pick<TransactionCategory, 'name' | 'type' | 'sortOrder'>> = [
  { name: 'Gaji', type: 'income', sortOrder: 1 },
  { name: 'Freelance', type: 'income', sortOrder: 2 },
  { name: 'Bonus', type: 'income', sortOrder: 3 },
  { name: 'Hadiah', type: 'income', sortOrder: 4 },
  { name: 'Lainnya', type: 'income', sortOrder: 5 },
  { name: 'Makan & Minum', type: 'expense', sortOrder: 1 },
  { name: 'Transportasi', type: 'expense', sortOrder: 2 },
  { name: 'Belanja', type: 'expense', sortOrder: 3 },
  { name: 'Tagihan', type: 'expense', sortOrder: 4 },
  { name: 'Hiburan', type: 'expense', sortOrder: 5 },
  { name: 'Kesehatan', type: 'expense', sortOrder: 6 },
  { name: 'Pendidikan', type: 'expense', sortOrder: 7 },
  { name: 'Lainnya', type: 'expense', sortOrder: 8 },
];

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

function mapCashAccount(snap: { data: () => Record<string, unknown> }): CashAccount {
  const data = snap.data();
  return {
    id: 'default',
    ownerUid: String(data.ownerUid),
    currency: 'IDR',
    currentBalance: Number(data.currentBalance ?? 0),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapCashTransaction(snap: { id: string; data: () => Record<string, unknown> }): CashTransaction {
  const data = snap.data();
  return {
    id: snap.id,
    ownerUid: String(data.ownerUid),
    type: data.type as CashTransactionType,
    amount: Number(data.amount),
    currency: 'IDR',
    categoryId: (data.categoryId as string | null) ?? null,
    categoryName: (data.categoryName as string | null) ?? null,
    note: (data.note as string | null) ?? null,
    transactionDate: toDate(data.transactionDate),
    relatedGoalId: (data.relatedGoalId as string | null) ?? null,
    relatedSavingTransactionId: (data.relatedSavingTransactionId as string | null) ?? null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapCategory(snap: { id: string; data: () => Record<string, unknown> }): TransactionCategory {
  const data = snap.data();
  return {
    id: snap.id,
    ownerUid: String(data.ownerUid),
    type: data.type as 'income' | 'expense',
    name: String(data.name),
    icon: (data.icon as string | null) ?? null,
    color: (data.color as string | null) ?? null,
    isDefault: Boolean(data.isDefault),
    sortOrder: Number(data.sortOrder ?? 0),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function trimNote(note?: string | null): string | null {
  return note?.trim() || null;
}

function buildCashTransactionData(input: {
  uid: string;
  type: CashTransactionType;
  amount: number;
  categoryId?: string | null;
  categoryName?: string | null;
  note?: string | null;
  transactionDate: Date;
  relatedGoalId?: string | null;
  relatedSavingTransactionId?: string | null;
}) {
  return {
    ownerUid: input.uid,
    type: input.type,
    amount: input.amount,
    currency: 'IDR' as const,
    categoryId: input.categoryId ?? null,
    categoryName: input.categoryName ?? null,
    note: trimNote(input.note),
    transactionDate: Timestamp.fromDate(input.transactionDate),
    relatedGoalId: input.relatedGoalId ?? null,
    relatedSavingTransactionId: input.relatedSavingTransactionId ?? null,
    updatedAt: serverTimestamp(),
  };
}

function buildSavingTransactionData(input: {
  uid: string;
  goalId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  note?: string | null;
  transactionDate: Date;
  balanceAfter: number;
  relatedCashTransactionId?: string | null;
}) {
  return {
    ownerUid: input.uid,
    goalId: input.goalId,
    type: input.type,
    amount: input.amount,
    note: trimNote(input.note),
    transactionDate: Timestamp.fromDate(input.transactionDate),
    balanceAfter: input.balanceAfter,
    relatedCashTransactionId: input.relatedCashTransactionId ?? null,
    createdAt: serverTimestamp(),
  };
}

function setCashAccountBalance(params: {
  tx: Transaction;
  cashRef: DocumentReference;
  cashExists: boolean;
  uid: string;
  nextBalance: number;
}) {
  if (!params.cashExists) {
    params.tx.set(params.cashRef, {
      id: 'default',
      ownerUid: params.uid,
      currency: 'IDR',
      currentBalance: params.nextBalance,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  params.tx.update(params.cashRef, { currentBalance: params.nextBalance, updatedAt: serverTimestamp() });
}

function updateGoalBalanceAndStatus(params: {
  tx: Transaction;
  goalRef: DocumentReference;
  nextGoalBalance: number;
  targetAmount: number;
}) {
  params.tx.update(params.goalRef, {
    currentBalance: params.nextGoalBalance,
    status: params.nextGoalBalance >= params.targetAmount ? 'completed' : 'active',
    updatedAt: serverTimestamp(),
  });
}

async function runSavingTransfer(input: {
  uid: string;
  goalId: string;
  amount: number;
  note?: string | null;
  transactionDate: Date;
  direction: 'to_savings' | 'from_savings';
}): Promise<void> {
  await runTransaction(db, async (tx) => {
    const cashRef = doc(db, 'users', input.uid, 'cashAccounts', 'default');
    const goalRef = doc(db, 'users', input.uid, 'savingGoals', input.goalId);

    const [cashSnap, goalSnap] = await Promise.all([tx.get(cashRef), tx.get(goalRef)]);
    if (!goalSnap.exists()) throw new Error('Data tabungan tidak ditemukan.');

    const cashBalance = cashSnap.exists() ? Number(cashSnap.data().currentBalance ?? 0) : 0;
    const goal = goalSnap.data();
    const goalBalance = Number(goal.currentBalance ?? 0);
    const targetAmount = Number(goal.targetAmount ?? 0);

    if (input.direction === 'to_savings' && cashBalance < input.amount) throw new Error('Saldo tersedia tidak cukup.');
    if (input.direction === 'from_savings' && goalBalance < input.amount) throw new Error('Saldo tabungan tidak cukup.');

    const isToSavings = input.direction === 'to_savings';
    const nextCashBalance = isToSavings ? cashBalance - input.amount : cashBalance + input.amount;
    const nextGoalBalance = isToSavings ? goalBalance + input.amount : goalBalance - input.amount;
    const cashType: CashTransactionType = isToSavings ? 'transfer_to_savings' : 'transfer_from_savings';
    const savingType: 'deposit' | 'withdrawal' = isToSavings ? 'deposit' : 'withdrawal';

    const cashTrxRef = doc(collection(db, 'users', input.uid, 'cashTransactions'));
    const savingTrxRef = doc(collection(goalRef, 'transactions'));

    setCashAccountBalance({ tx, cashRef, cashExists: cashSnap.exists(), uid: input.uid, nextBalance: nextCashBalance });
    updateGoalBalanceAndStatus({ tx, goalRef, nextGoalBalance, targetAmount });

    tx.set(cashTrxRef, {
      id: cashTrxRef.id,
      ...buildCashTransactionData({
        uid: input.uid,
        type: cashType,
        amount: input.amount,
        note: input.note,
        transactionDate: input.transactionDate,
        relatedGoalId: input.goalId,
        relatedSavingTransactionId: savingTrxRef.id,
      }),
      createdAt: serverTimestamp(),
    });

    tx.set(savingTrxRef, {
      id: savingTrxRef.id,
      ...buildSavingTransactionData({
        uid: input.uid,
        goalId: input.goalId,
        type: savingType,
        amount: input.amount,
        note: input.note,
        transactionDate: input.transactionDate,
        balanceAfter: nextGoalBalance,
        relatedCashTransactionId: cashTrxRef.id,
      }),
    });
  });
}

export async function ensureDefaultCashAccount(uid: string): Promise<void> {
  const cashRef = doc(db, 'users', uid, 'cashAccounts', 'default');
  const cashSnap = await getDoc(cashRef);
  if (cashSnap.exists()) return;

  await runTransaction(db, async (transaction) => {
    const latest = await transaction.get(cashRef);
    if (latest.exists()) return;
    transaction.set(cashRef, {
      id: 'default',
      ownerUid: uid,
      currency: 'IDR',
      currentBalance: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function seedDefaultCategories(uid: string): Promise<void> {
  const categoriesRef = collection(db, 'users', uid, 'categories');
  const existing = await getDocs(query(categoriesRef, limit(1)));
  if (!existing.empty) return;

  const batch = writeBatch(db);
  DEFAULT_CATEGORIES.forEach((category) => {
    const ref = doc(categoriesRef);
    batch.set(ref, {
      id: ref.id,
      ownerUid: uid,
      type: category.type,
      name: category.name,
      icon: null,
      color: null,
      isDefault: true,
      sortOrder: category.sortOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export function subscribeToCashAccount(uid: string, callback: (account: CashAccount | null) => void): () => void {
  const cashRef = doc(db, 'users', uid, 'cashAccounts', 'default');
  return onSnapshot(cashRef, (snapshot) => {
    callback(snapshot.exists() ? mapCashAccount(snapshot) : null);
  });
}

export function subscribeCategories(
  uid: string,
  type: 'income' | 'expense' | 'all',
  callback: (categories: TransactionCategory[]) => void
): () => void {
  const categoriesRef = collection(db, 'users', uid, 'categories');
  const q =
    type === 'all'
      ? query(categoriesRef, orderBy('type', 'asc'), orderBy('sortOrder', 'asc'))
      : query(categoriesRef, where('type', '==', type), orderBy('sortOrder', 'asc'));

  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(mapCategory)));
}

export function subscribeToCashTransactions(params: {
  uid: string;
  startDate?: Date;
  endDate?: Date;
  type?: CashTransactionType | 'all';
  categoryId?: string | 'all';
  limitCount?: number;
  includeCreatedAtOrder?: boolean;
  callback: (transactions: CashTransaction[]) => void;
  onError?: (error: Error) => void;
}): () => void {
  const cashTrxRef = collection(db, 'users', params.uid, 'cashTransactions');
  const filters: QueryConstraint[] = [];

  if (params.startDate) {
    filters.push(where('transactionDate', '>=', Timestamp.fromDate(params.startDate)));
  }
  if (params.endDate) {
    filters.push(where('transactionDate', '<=', Timestamp.fromDate(params.endDate)));
  }
  if (params.type && params.type !== 'all') {
    filters.push(where('type', '==', params.type));
  }
  if (params.categoryId && params.categoryId !== 'all') {
    filters.push(where('categoryId', '==', params.categoryId));
  }

  const constraints: QueryConstraint[] = [...filters, orderBy('transactionDate', 'desc')];
  if (params.includeCreatedAtOrder !== false) {
    constraints.push(orderBy('createdAt', 'desc'));
  }
  if (params.limitCount) constraints.push(limit(params.limitCount));

  const q = query(cashTrxRef, ...constraints);
  return onSnapshot(
    q,
    (snapshot) => params.callback(snapshot.docs.map(mapCashTransaction)),
    (error) => params.onError?.(error)
  );
}

export async function addCashTransaction(input: {
  uid: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  categoryName: string;
  note?: string | null;
  transactionDate: Date;
}): Promise<void> {
  if (!Number.isInteger(input.amount) || input.amount <= 0) throw new Error('Nominal harus lebih dari Rp0.');
  if (!input.categoryId.trim()) throw new Error('Kategori wajib dipilih.');

  await runTransaction(db, async (tx) => {
    const cashRef = doc(db, 'users', input.uid, 'cashAccounts', 'default');
    const cashSnap = await tx.get(cashRef);
    const currentBalance = cashSnap.exists() ? Number(cashSnap.data().currentBalance ?? 0) : 0;

    const delta = input.type === 'income' ? input.amount : -input.amount;
    const newBalance = currentBalance + delta;
    if (newBalance < 0) throw new Error('Saldo tersedia tidak cukup.');

    const trxRef = doc(collection(db, 'users', input.uid, 'cashTransactions'));
    setCashAccountBalance({ tx, cashRef, cashExists: cashSnap.exists(), uid: input.uid, nextBalance: newBalance });

    tx.set(trxRef, {
      id: trxRef.id,
      ...buildCashTransactionData({
        uid: input.uid,
        type: input.type,
        amount: input.amount,
        categoryId: input.categoryId,
        categoryName: input.categoryName,
        note: input.note,
        transactionDate: input.transactionDate,
      }),
      createdAt: serverTimestamp(),
    });
  });
}

export async function updateCashTransaction(input: {
  uid: string;
  transactionId: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  note?: string | null;
  transactionDate: Date;
}): Promise<void> {
  if (!Number.isInteger(input.amount) || input.amount <= 0) throw new Error('Nominal harus lebih dari Rp0.');
  if (!input.categoryId.trim()) throw new Error('Kategori wajib dipilih.');

  await runTransaction(db, async (tx) => {
    const trxRef = doc(db, 'users', input.uid, 'cashTransactions', input.transactionId);
    const cashRef = doc(db, 'users', input.uid, 'cashAccounts', 'default');

    const [trxSnap, cashSnap] = await Promise.all([tx.get(trxRef), tx.get(cashRef)]);
    if (!trxSnap.exists()) throw new Error('Transaksi tidak ditemukan.');

    const trx = trxSnap.data();
    if (!['income', 'expense'].includes(String(trx.type))) throw new Error('Transaksi ini tidak bisa diedit.');

    const currentBalance = cashSnap.exists() ? Number(cashSnap.data().currentBalance ?? 0) : 0;
    const oldSigned = trx.type === 'income' ? Number(trx.amount) : -Number(trx.amount);
    const newSigned = trx.type === 'income' ? input.amount : -input.amount;
    const nextBalance = currentBalance - oldSigned + newSigned;
    if (nextBalance < 0) throw new Error('Saldo tersedia tidak cukup.');

    setCashAccountBalance({ tx, cashRef, cashExists: cashSnap.exists(), uid: input.uid, nextBalance });
    tx.update(trxRef, {
      amount: input.amount,
      categoryId: input.categoryId,
      categoryName: input.categoryName,
      note: trimNote(input.note),
      transactionDate: Timestamp.fromDate(input.transactionDate),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function deleteCashTransaction(input: { uid: string; transactionId: string }): Promise<void> {
  await runTransaction(db, async (tx) => {
    const trxRef = doc(db, 'users', input.uid, 'cashTransactions', input.transactionId);
    const cashRef = doc(db, 'users', input.uid, 'cashAccounts', 'default');

    const [trxSnap, cashSnap] = await Promise.all([tx.get(trxRef), tx.get(cashRef)]);
    if (!trxSnap.exists()) throw new Error('Transaksi tidak ditemukan.');

    const trx = trxSnap.data();
    if (!['income', 'expense'].includes(String(trx.type))) throw new Error('Transaksi transfer tidak bisa dihapus.');

    const currentBalance = cashSnap.exists() ? Number(cashSnap.data().currentBalance ?? 0) : 0;
    const reversal = trx.type === 'income' ? -Number(trx.amount) : Number(trx.amount);
    const nextBalance = currentBalance + reversal;
    if (nextBalance < 0) throw new Error('Saldo tersedia tidak cukup.');

    setCashAccountBalance({ tx, cashRef, cashExists: cashSnap.exists(), uid: input.uid, nextBalance });
    tx.delete(trxRef);
  });
}

export async function transferToSavingGoal(input: {
  uid: string;
  goalId: string;
  amount: number;
  note?: string | null;
  transactionDate: Date;
}): Promise<void> {
  if (!Number.isInteger(input.amount) || input.amount <= 0) throw new Error('Nominal harus lebih dari Rp0.');
  await runSavingTransfer({ ...input, direction: 'to_savings' });
}

export async function transferFromSavingGoal(input: {
  uid: string;
  goalId: string;
  amount: number;
  note?: string | null;
  transactionDate: Date;
}): Promise<void> {
  if (!Number.isInteger(input.amount) || input.amount <= 0) throw new Error('Nominal harus lebih dari Rp0.');
  await runSavingTransfer({ ...input, direction: 'from_savings' });
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
  const goalRef = doc(db, 'users', uid, 'savingGoals', goalId);
  const transactionsRef = collection(db, 'users', uid, 'savingGoals', goalId, 'transactions');

  while (true) {
    const page = await getDocs(query(transactionsRef, limit(500)));
    if (page.empty) break;

    const batch = writeBatch(db);
    page.docs.forEach((transactionDoc) => batch.delete(transactionDoc.ref));
    await batch.commit();
  }

  await deleteDoc(goalRef);
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
  const normalizedAmount = normalizeAmountInput(input.amount);
  const amount = input.type === 'adjustment' ? normalizedAmount : Math.abs(normalizedAmount);

  await runTransaction(db, async (transaction) => {
    const goalRef = doc(db, 'users', input.uid, 'savingGoals', input.goalId);
    const goalSnap = await transaction.get(goalRef);
    if (!goalSnap.exists()) {
      throw new Error('Data tabungan tidak ditemukan.');
    }

    const goal = goalSnap.data();
    const currentBalance = Number(goal.currentBalance);
    const targetAmount = Number(goal.targetAmount);
    let delta = amount;
    if (input.type === 'withdrawal') {
      delta = -amount;
    }
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
