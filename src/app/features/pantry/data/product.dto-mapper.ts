import { PRODUCT_CATEGORIES, PRODUCT_UNITS, type Product, type ProductCategory, type ProductUnit } from '../domain/product';
import { ProductApiError } from './product-api-error';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== 'string' || value.length === 0) {
    throw new ProductApiError('The server returned an invalid product representation.');
  }
  return value;
}

function isRealCalendarDate(value: string): boolean {
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function mapProductDto(value: unknown): Product {
  if (!isRecord(value)) {
    throw new ProductApiError('The server returned an invalid product representation.');
  }

  const id = requireString(value, 'id');
  const name = requireString(value, 'name');
  const createdAt = requireString(value, 'createdAt');
  const updatedAt = requireString(value, 'updatedAt');
  const quantity = value['quantity'];
  const unit = value['unit'];
  const category = value['category'];
  const expirationDate = value['expirationDate'];

  if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) {
    throw new ProductApiError('The server returned an invalid product quantity.');
  }
  if (typeof unit !== 'string' || !(PRODUCT_UNITS as readonly string[]).includes(unit)) {
    throw new ProductApiError('The server returned an unsupported product unit.');
  }
  if (typeof category !== 'string' || !(PRODUCT_CATEGORIES as readonly string[]).includes(category)) {
    throw new ProductApiError('The server returned an unsupported product category.');
  }
  if (expirationDate !== null && (typeof expirationDate !== 'string' || !isRealCalendarDate(expirationDate))) {
    throw new ProductApiError('The server returned an invalid expiration date.');
  }

  return {
    id,
    name,
    quantity,
    unit: unit as ProductUnit,
    category: category as ProductCategory,
    expirationDate: expirationDate as string | null,
    createdAt,
    updatedAt
  };
}
