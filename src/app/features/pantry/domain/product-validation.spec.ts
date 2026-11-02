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
    expect(validateProductInput({ ...validInput, name: '  ', quantity: 0 }))
      .toMatchObject({
        name: 'Name is required.',
        quantity: 'Quantity must be greater than zero.'
      });
  });

  it('rejects names longer than 120 characters', () => {
    expect(validateProductInput({
      ...validInput,
      name: 'A'.repeat(121)
    }).name).toBe('Name must be at most 120 characters.');
  });

  it('requires integer counts for units and packages', () => {
    expect(validateProductInput({
      ...validInput,
      quantity: 1.5,
      unit: 'unit'
    }).quantity).toBe('Quantity must be an integer for Units and Packages.');
  });

  it('rejects quantities with more than three decimal places', () => {
    expect(validateProductInput({
      ...validInput,
      quantity: 1.2345,
      unit: 'kg'
    }).quantity).toBe('Quantity supports up to three decimal places.');
  });

  it('rejects quantities above the supported maximum', () => {
    expect(validateProductInput({
      ...validInput,
      quantity: 1000000000,
      unit: 'kg'
    }).quantity).toBe('Quantity is above the supported maximum.');
  });

  it('rejects unsupported units and categories', () => {
    expect(validateProductInput({
      ...validInput,
      unit: 'box' as ProductInput['unit'],
      category: 'unknown' as ProductInput['category']
    })).toMatchObject({
      unit: 'Select a valid unit.',
      category: 'Select a valid category.'
    });
  });

  it('rejects impossible calendar dates', () => {
    expect(validateProductInput({
      ...validInput,
      expirationDate: '2026-02-30'
    }).expirationDate).toBe('Enter a valid expiration date.');
  });

  it('rejects malformed date formats', () => {
    expect(validateProductInput({
      ...validInput,
      expirationDate: '11/15/2026'
    }).expirationDate).toBe('Enter a valid expiration date.');
  });

  it('allows a missing expiration date', () => {
    expect(validateProductInput({
      ...validInput,
      expirationDate: null
    })).toEqual({});
  });
});
