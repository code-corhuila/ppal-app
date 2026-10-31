import { inject, Injectable, signal } from '@angular/core';
import { PRODUCT_REPOSITORY } from '../data/product-repository.token';
import type { Product, ProductInput } from '../domain/product';
import { compareExpirationDates } from '../domain/expiration';

export type PantryLoadStatus = 'loading' | 'loaded' | 'error';

export interface PantryViewState {
  status: PantryLoadStatus;
  products: Product[];
  errorMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class PantryFacade {
  private readonly repository = inject(PRODUCT_REPOSITORY);

  readonly state = signal<PantryViewState>({
    status: 'loading',
    products: [],
    errorMessage: null
  });

  async load(): Promise<void> {
    this.state.set({ status: 'loading', products: [], errorMessage: null });
    try {
      const products = (await this.repository.list()).slice().sort(compareExpirationDates);
      this.state.set({ status: 'loaded', products, errorMessage: null });
    } catch {
      this.state.set({
        status: 'error',
        products: [],
        errorMessage: 'We could not load your pantry. Check your connection and try again.'
      });
    }
  }

  getById(id: string): Promise<Product> {
    return this.repository.getById(id);
  }

  create(input: ProductInput): Promise<Product> {
    return this.repository.create(input);
  }

  update(id: string, input: ProductInput): Promise<Product> {
    return this.repository.update(id, input);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
