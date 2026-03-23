export const statusColor = (s: string) => {
  if (
    s === 'delivered' ||
    s === 'claimed' ||
    s === 'completed' ||
    s === 'redeemed'
  )
    return 'secondary';
  if (
    s === 'pending' ||
    s === 'unclaimed' ||
    s === 'active' ||
    s === 'pending-claim'
  )
    return 'outline';
  return 'default';
};

export const getDaysLeft = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff : 0;
};

export const getTitle = (section: string) => {
  return section.replace('-', ' ');
};
