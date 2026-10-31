import { describe, expect, it } from 'vitest';
import { compareExpirationDates, getExpirationStatus } from './expiration';
import type { Product } from './product';

describe('expiration classification', () => {
  const today = '2026-10-29';

  it('marks a date before today as expired', () => {
    expect(getExpirationStatus('2026-10-28', today)).toBe('expired');
  });

  it('includes today and the third calendar day in expiring soon', () => {
    expect(getExpirationStatus(today, today)).toBe('expiring-soon');
    expect(getExpirationStatus('2026-11-01', today)).toBe('expiring-soon');
  });

  it('marks the fourth calendar day as not expiring soon', () => {
    expect(getExpirationStatus('2026-11-02', today)).toBe('not-expiring-soon');
  });

  it('handles a missing expiration date', () => {
    expect(getExpirationStatus(null, today)).toBe('no-expiration-date');
  });

  it('sorts dated products by date and undated products last', () => {
    const product = (name: string, expirationDate: string | null): Product => ({
      id: name, name, quantity: 1, unit: 'unit', category: 'dairy', expirationDate, createdAt: '', updatedAt: ''
    });
    const values = [
      product('Rice', null),
      product('Apples', '2026-11-10'),
      product('Greek Yogurt', '2026-10-23')
    ].sort(compareExpirationDates);
    expect(values.map((item) => item.name)).toEqual(['Greek Yogurt', 'Apples', 'Rice']);
  });
});
