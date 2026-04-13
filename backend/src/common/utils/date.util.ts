/**
 * Calculates the number of days left until a given end date.
 * Mirrors frontend: src/lib/utils/date.ts → getDaysLeft
 */
export const getDaysLeft = (endDate: string | Date | null): number => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff : 0;
};
