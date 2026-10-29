import { Routes } from '@angular/router';
import { pendingChangesGuard } from './features/pantry/presentation/pending-changes.guard';

export const routes: Routes = [
  {
    path: 'pantry',
    loadComponent: () => import('./home/home.page').then((module) => module.HomePage)
  },
  {
    path: 'products/new',
    loadComponent: () => import('./features/pantry/presentation/product-form.page').then((module) => module.ProductFormPage),
    canDeactivate: [pendingChangesGuard]
  },
  {
    path: 'products/:id/edit',
    loadComponent: () => import('./features/pantry/presentation/product-form.page').then((module) => module.ProductFormPage),
    canDeactivate: [pendingChangesGuard]
  },
  { path: '', pathMatch: 'full', redirectTo: 'pantry' },
  { path: '**', redirectTo: 'pantry' }
];
