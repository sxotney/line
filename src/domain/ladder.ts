export function nextIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(current + 1, total - 1);
}
