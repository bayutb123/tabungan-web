export function calculateProgress(currentBalance: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min(100, Math.round((currentBalance / targetAmount) * 100));
}
