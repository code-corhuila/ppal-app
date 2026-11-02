import { describe, expect, it } from 'vitest';
import {
  compareExpirationDates,
  formatExpirationDate,
  getBogotaCalendarDate,
  getExpirationStatus
} from './expiration';
import type { Product } from './product';

const today = '2026-10-29';

const makeProduct = (name: string, expirationDate: string | null): Product => ({
  id: name,
  name,
  quantity: 1,
  unit: 'unit',
  category: 'dairy',
  expirationDate,
  createdAt: '2026-10-25T15:00:00.000Z',
  updatedAt: '2026-10-25T15:00:00.000Z'
});

describe('Bogota calendar date', () => {
  it('uses the Bogota calendar day when the UTC date is already the next day', () => {
    expect(getBogotaCalendarDate(new Date('2026-11-02T02:30:00.000Z')))
      .toBe('2026-11-01');
  });

  it('returns the expected local calendar day when UTC and Bogota dates align', () => {
    expect(getBogotaCalendarDate(new Date('2026-11-02T17:00:00.000Z')))
      .toBe('2026-11-02');
  });
});

describe('expiration classification', () => {
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

  it('handles null, undefined, and empty expiration values', () => {
    expect(getExpirationStatus(null, today)).toBe('no-expiration-date');
    expect(getExpirationStatus(undefined, today)).toBe('no-expiration-date');
    expect(getExpirationStatus('', today)).toBe('no-expiration-date');
  });
});

describe('expiration comparison', () => {
  it('sorts a dated product before an undated product', () => {
    expect(compareExpirationDates(
      makeProduct('Apples', '2026-11-10'),
      makeProduct('Rice', null)
    )).toBeLessThan(0);
  });

  it('sorts an undated product after a dated product', () => {
    expect(compareExpirationDates(
      makeProduct('Rice', null),
      makeProduct('Apples', '2026-11-10')
    )).toBeGreaterThan(0);
  });

  it('compares different expiration dates in chronological order', () => {
    expect(compareExpirationDates(
      makeProduct('Milk', '2026-10-30'),
      makeProduct('Apples', '2026-11-10')
    )).toBeLessThan(0);
  });

  it('uses the English product name when expiration dates match', () => {
    expect(compareExpirationDates(
      makeProduct('Apples', '2026-11-10'),
      makeProduct('Rice', '2026-11-10')
    )).toBeLessThan(0);
  });

  it('uses the English product name when both products have no expiration date', () => {
    expect(compareExpirationDates(
      makeProduct('Apples', null),
      makeProduct('Rice', null)
    )).toBeLessThan(0);
  });

  it('returns zero when the names and expiration dates match', () => {
    expect(compareExpirationDates(
      makeProduct('Apples', '2026-11-10'),
      makeProduct('Apples', '2026-11-10')
    )).toBe(0);
  });
});

describe('expiration date formatting', () => {
  it('returns a clear label when the date is missing', () => {
    expect(formatExpirationDate(null)).toBe('No expiration date');
  });

  it('formats a date-only value in English without a timezone shift', () => {
    expect(formatExpirationDate('2026-11-15')).toBe('Nov 15, 2026');
  });
});
