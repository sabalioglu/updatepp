export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else if (diffDays <= 7) {
    return `Expires in ${diffDays} days`;
  } else {
    return formatDate(d);
  }
}

export function getExpiryStatus(expiryDate: string | Date | null): 'fresh' | 'expiring' | 'expired' {
  if (!expiryDate) return 'fresh';
  
  const d = new Date(expiryDate);
  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'expiring';
  return 'fresh';
}

export function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}