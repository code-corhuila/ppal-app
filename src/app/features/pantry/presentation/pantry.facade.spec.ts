import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PRODUCT_REPOSITORY } from '../data/product-repository.token';
import type { Product, ProductInput, ProductRepository } from '../domain/product';
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

const validInput: ProductInput = {
  name: 'Olive Oil',
  quantity: 2,
  unit: 'L',
  category: 'pantry_staples',
  expirationDate: '2026-11-15'
};

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

  it('forwards getById to the repository and returns its product', async () => {
    const product = makeProduct('Apples', '2026-11-10');
    const getById = vi.fn(async (_id: string) => product);
    const repository = { getById } as unknown as ProductRepository;
    const facade = await createFacade(repository);

    await expect(facade.getById('Apples')).resolves.toEqual(product);
    expect(getById).toHaveBeenCalledWith('Apples');
  });

  it('forwards create to the repository and returns the created product', async () => {
    const created: Product = {
      ...makeProduct(validInput.name, validInput.expirationDate),
      quantity: validInput.quantity,
      unit: validInput.unit,
      category: validInput.category
    };
    const create = vi.fn(async (_input: ProductInput) => created);
    const repository = { create } as unknown as ProductRepository;
    const facade = await createFacade(repository);

    await expect(facade.create(validInput)).resolves.toEqual(created);
    expect(create).toHaveBeenCalledWith(validInput);
  });

  it('forwards update to the repository and returns the updated product', async () => {
    const updated: Product = {
      ...makeProduct(validInput.name, validInput.expirationDate),
      quantity: 3,
      unit: validInput.unit,
      category: validInput.category
    };
    const update = vi.fn(async (_id: string, _input: ProductInput) => updated);
    const repository = { update } as unknown as ProductRepository;
    const facade = await createFacade(repository);

    await expect(facade.update('olive-oil-id', validInput)).resolves.toEqual(updated);
    expect(update).toHaveBeenCalledWith('olive-oil-id', validInput);
  });

  it('forwards delete to the repository', async () => {
    const deleteProduct = vi.fn(async (_id: string): Promise<void> => undefined);
    const repository = { delete: deleteProduct } as unknown as ProductRepository;
    const facade = await createFacade(repository);

    await expect(facade.delete('rice-id')).resolves.toBeUndefined();
    expect(deleteProduct).toHaveBeenCalledWith('rice-id');
  });
});
