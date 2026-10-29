import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AlertController,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController
} from '@ionic/angular';
import type { Product, ProductCategory, ProductUnit } from '../features/pantry/domain/product';
import { formatExpirationDate, getExpirationStatus } from '../features/pantry/domain/expiration';
import { PantryFacade } from '../features/pantry/presentation/pantry.facade';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  produce: 'Produce',
  dairy: 'Dairy',
  pantry_staples: 'Pantry Staples',
  canned_goods: 'Canned Goods',
  bakery: 'Bakery',
  meat_eggs: 'Meat & Eggs',
  snacks_other: 'Snacks & Other'
};

const UNIT_LABELS: Record<ProductUnit, string> = {
  unit: 'units',
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  L: 'L',
  package: 'packages'
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    RouterLink,
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    IonSpinner,
    IonTitle,
    IonToolbar
  ]
})
export class HomePage {
  readonly facade = inject(PantryFacade);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  readonly searchTerm = signal('');
  readonly visibleProducts = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase('en');
    const products = this.facade.state().products;
    return term ? products.filter((product) => product.name.toLocaleLowerCase('en').includes(term)) : products;
  });

  ionViewWillEnter(): void {
    void this.facade.load();
  }

  retry(): void {
    void this.facade.load();
  }

  onSearchChanged(event: CustomEvent<{ value?: string | null }>): void {
    this.searchTerm.set(event.detail.value ?? '');
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  categoryLabel(category: ProductCategory): string {
    return CATEGORY_LABELS[category];
  }

  unitLabel(unit: ProductUnit): string {
    return UNIT_LABELS[unit];
  }

  formatDate(value: string | null): string {
    return formatExpirationDate(value);
  }

  statusLabel(product: Product): string {
    const labels = {
      expired: 'Expired',
      'expiring-soon': 'Expiring Soon',
      'not-expiring-soon': 'Not Expiring Soon',
      'no-expiration-date': 'No Expiration Date'
    } as const;
    return labels[getExpirationStatus(product.expirationDate)];
  }

  statusColor(product: Product): 'danger' | 'warning' | 'success' | 'medium' {
    const status = getExpirationStatus(product.expirationDate);
    if (status === 'expired') return 'danger';
    if (status === 'expiring-soon') return 'warning';
    if (status === 'not-expiring-soon') return 'success';
    return 'medium';
  }

  async confirmDelete(product: Product): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete product?',
      message: 'Delete "' + product.name + '" from your pantry? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => { void this.deleteProduct(product); } }
      ]
    });
    await alert.present();
  }

  private async deleteProduct(product: Product): Promise<void> {
    try {
      await this.facade.delete(product.id);
      await this.facade.load();
      const toast = await this.toastController.create({ message: 'Product deleted.', duration: 1800, position: 'bottom' });
      await toast.present();
    } catch {
      const alert = await this.alertController.create({
        header: 'Delete failed',
        message: 'The API did not confirm deletion. The product remains visible until a successful refresh.',
        buttons: [
          { text: 'Close', role: 'cancel' },
          { text: 'Try Again', role: 'confirm', handler: () => { void this.deleteProduct(product); } }
        ]
      });
      await alert.present();
    }
  }
}
