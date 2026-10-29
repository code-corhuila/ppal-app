import { describe, expect, it } from 'vitest';
import { mapProductDto } from './product.dto-mapper';

const validDto = {
  id: '7e1c5ae0-d4e0-47f7-9f2a-1b2c3d4e5f60',
  name: 'Whole Milk',
  quantity: 1,
  unit: 'L',
  category: 'dairy',
  expirationDate: '2026-10-30',
  createdAt: '2026-10-25T15:00:00.000Z',
  updatedAt: '2026-10-25T15:00:00.000Z'
};

describe('product DTO mapper', () => {
  it('maps a valid product representation', () => {
    expect(mapProductDto(validDto)).toMatchObject({
      name: 'Whole Milk',
      quantity: 1,
      unit: 'L',
      category: 'dairy',
      expirationDate: '2026-10-30'
    });
  });

  it('rejects an impossible calendar date', () => {
    expect(() => mapProductDto({ ...validDto, expirationDate: '2026-02-30' })).toThrow(
      'The server returned an invalid expiration date.'
    );
  });

  it('rejects unsupported units', () => {
    expect(() => mapProductDto({ ...validDto, unit: 'cup' })).toThrow(
      'The server returned an unsupported product unit.'
    );
  });

  it('rejects non-product response values', () => {
    expect(() => mapProductDto(null)).toThrow(
      'The server returned an invalid product representation.'
    );
  });

  it('rejects fractional quantities for countable units', () => {
    expect(() => mapProductDto({ ...validDto, quantity: 1.5, unit: 'unit' })).toThrow(
      'The server returned a fractional quantity for a countable unit.'
    );
  });

  it('rejects a name that violates the domain contract', () => {
    expect(() => mapProductDto({ ...validDto, name: '   ' })).toThrow(
      'The server returned an invalid product name.'
    );
  });
});
