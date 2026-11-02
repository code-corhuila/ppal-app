import type { Product } from './product';

export type ExpirationStatus = 'expired' | 'expiring-soon' | 'not-expiring-soon' | 'no-expiration-date';

export function getBogotaCalendarDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  return year + '-' + month + '-' + day;
}

function addCalendarDays(dateOnly: string, days: number): string {
  const [yearText, monthText, dayText] = dateOnly.split('-');
  const date = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText) + days));
  return date.toISOString().slice(0, 10);
}

export function getExpirationStatus(
  expirationDate: string | null | undefined,
  today = getBogotaCalendarDate()
): ExpirationStatus {
  if (!expirationDate) return 'no-expiration-date';
  if (expirationDate < today) return 'expired';
  if (expirationDate <= addCalendarDays(today, 3)) return 'expiring-soon';
  return 'not-expiring-soon';
}

export function compareExpirationDates(left: Product, right: Product): number {
  if (left.expirationDate === null && right.expirationDate !== null) return 1;
  if (left.expirationDate !== null && right.expirationDate === null) return -1;
  if (left.expirationDate && right.expirationDate && left.expirationDate !== right.expirationDate) {
    return left.expirationDate.localeCompare(right.expirationDate);
  }
  return left.name.localeCompare(right.name, 'en');
}

export function formatExpirationDate(dateOnly: string | null): string {
  if (!dateOnly) return 'No expiration date';
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}
