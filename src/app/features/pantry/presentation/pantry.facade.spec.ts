import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PRODUCT_REPOSITORY } from '../data/product-repository.token';
import type { Product, ProductRepository } from '../domain/product';
import { PantryFacade } from './pantry.facade';

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

async function createFacade(repository: ProductRepository): Promise<PantryFacade> {
  await TestBed.configureTestingModule({
    providers: [
      PantryFacade,
      { provide: PRODUCT_REPOSITORY, useValue: repository }
    ]
  }).compileComponents();

  return TestBed.inject(PantryFacade);
}

describe('PantryFacade', () => {
  it('sorts dated products first and undated products last', async () => {
    const repository = {
      list: async () => [
        makeProduct('Rice', null),
        makeProduct('Apples', '2026-11-10'),
        makeProduct('Greek Yogurt', '2026-10-23')
      ]
    } as unknown as ProductRepository;
    const facade = await createFacade(repository);

    await facade.load();

    expect(facade.state().status).toBe('loaded');
    expect(facade.state().products.map((product) => product.name))
      .toEqual(['Greek Yogurt', 'Apples', 'Rice']);
  });

  it('treats a successful empty response as loaded empty data', async () => {
    const repository = { list: async () => [] } as unknown as ProductRepository;
    const facade = await createFacade(repository);

    await facade.load();

    expect(facade.state()).toEqual({
      status: 'loaded',
      products: [],
      errorMessage: null
    });
  });

  it('keeps API failure distinct from an empty pantry', async () => {
    const repository = {
      list: async () => { throw new Error('Network unavailable'); }
    } as unknown as ProductRepository;
    const facade = await createFacade(repository);

    await facade.load();

    expect(facade.state().status).toBe('error');
    expect(facade.state().products).toEqual([]);
    expect(facade.state().errorMessage).toContain('Check your connection');
  });
});
