import { describe, expect, it } from 'vitest';
import { validateProductInput } from './product-validation';
import type { ProductInput } from './product';

const validInput: ProductInput = {
  name: 'Whole Milk',
  quantity: 1,
  unit: 'L',
  category: 'dairy',
  expirationDate: '2026-10-30'
};

describe('product validation', () => {
  it('accepts a valid product', () => {
    expect(validateProductInput(validInput)).toEqual({});
  });

  it('rejects blank names and zero quantities', () => {
    expect(validateProductInput({ ...validInput, name: '  ', quantity: 0 })).toMatchObject({
      name: 'Name is required.',
      quantity: 'Quantity must be greater than zero.'
    });
  });

  it('requires integer counts for units and packages', () => {
    expect(validateProductInput({ ...validInput, quantity: 1.5, unit: 'unit' }).quantity)
      .toBe('Quantity must be an integer for Units and Packages.');
  });

  it('rejects quantities with more than three decimal places', () => {
    expect(validateProductInput({ ...validInput, quantity: 1.2345, unit: 'kg' }).quantity)
      .toBe('Quantity supports up to three decimal places.');
  });

  it('rejects impossible calendar dates', () => {
    expect(validateProductInput({ ...validInput, expirationDate: '2026-02-30' }).expirationDate)
      .toBe('Enter a valid expiration date.');
  });

  it('allows a missing expiration date', () => {
    expect(validateProductInput({ ...validInput, expirationDate: null })).toEqual({});
  });
});
