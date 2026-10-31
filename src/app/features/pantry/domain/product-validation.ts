import { PRODUCT_CATEGORIES, PRODUCT_UNITS, type ProductCategory, type ProductInput, type ProductUnit } from './product';

export type ProductField = 'name' | 'quantity' | 'unit' | 'category' | 'expirationDate';
export type ProductFieldErrors = Partial<Record<ProductField, string>>;

function isRealCalendarDate(value: string): boolean {
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function validateProductInput(input: ProductInput): ProductFieldErrors {
  const errors: ProductFieldErrors = {};
  if (!input.name.trim()) errors.name = 'Name is required.';
  if (input.name.trim().length > 120) errors.name = 'Name must be at most 120 characters.';
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than zero.';
  } else if ((input.unit === 'unit' || input.unit === 'package') && !Number.isInteger(input.quantity)) {
    errors.quantity = 'Quantity must be an integer for Units and Packages.';
  } else if (input.quantity > 999999999) {
    errors.quantity = 'Quantity is above the supported maximum.';
  } else if (Math.abs(input.quantity - Math.round(input.quantity * 1000) / 1000) > 1e-9) {
    errors.quantity = 'Quantity supports up to three decimal places.';
  }
  if (!(PRODUCT_UNITS as readonly string[]).includes(input.unit as ProductUnit)) {
    errors.unit = 'Select a valid unit.';
  }
  if (!(PRODUCT_CATEGORIES as readonly string[]).includes(input.category as ProductCategory)) {
    errors.category = 'Select a valid category.';
  }
  if (input.expirationDate !== null && !isRealCalendarDate(input.expirationDate)) {
    errors.expirationDate = 'Enter a valid expiration date.';
  }
  return errors;
}
