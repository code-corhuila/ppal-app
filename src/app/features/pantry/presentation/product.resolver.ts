import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import type { Product } from '../domain/product';
import { PantryFacade } from './pantry.facade';

export type ProductRouteResolution =
  | { status: 'loaded'; product: Product }
  | { status: 'error'; message: string };

export const productResolver: ResolveFn<ProductRouteResolution> = async (route) => {
  const id = route.paramMap.get('id');
  if (!id) {
    return { status: 'error', message: 'No product ID was supplied.' };
  }

  try {
    const product = await inject(PantryFacade).getById(id);
    return { status: 'loaded', product };
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'The product could not be loaded. Return to the pantry and try again.';
    return { status: 'error', message };
  }
};
