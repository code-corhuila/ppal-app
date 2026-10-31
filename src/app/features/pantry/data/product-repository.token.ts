import { InjectionToken } from '@angular/core';
import type { ProductRepository } from '../domain/product';

export const PRODUCT_REPOSITORY = new InjectionToken<ProductRepository>('PRODUCT_REPOSITORY');
