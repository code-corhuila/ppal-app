import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import type { Product, ProductCategory, ProductInput, ProductUnit } from '../domain/product';
import type { ProductRouteResolution } from './product.resolver';
import { validateProductInput, type ProductField, type ProductFieldErrors } from '../domain/product-validation';
import { ProductApiError } from '../data/product-api-error';
import { PantryFacade } from './pantry.facade';
import { NativeFeedbackService } from './native-feedback.service';
import type { PendingChangesPage } from './pending-changes.guard';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.page.html',
  styleUrls: ['./product-form.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar
  ]
})
export class ProductFormPage implements PendingChangesPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly facade = inject(PantryFacade);
  private readonly nativeFeedback = inject(NativeFeedbackService);
  readonly productId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly isEditMode = computed(() => this.productId() !== null);
  readonly isLoading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly fieldErrors = signal<ProductFieldErrors>({});
  private savedSuccessfully = false;

  readonly form = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    quantity: this.formBuilder.nonNullable.control(1, [Validators.required, Validators.min(0.001)]),
    unit: this.formBuilder.nonNullable.control<ProductUnit>('unit', [Validators.required]),
    category: this.formBuilder.nonNullable.control<ProductCategory>('dairy', [Validators.required]),
    expirationDate: this.formBuilder.control<string | null>(null)
  });

  constructor() {
    if (!this.isEditMode()) return;

    const resolution = this.route.snapshot.data['productResult'] as ProductRouteResolution | undefined;
    if (!resolution) {
      this.loadError.set('The edit route did not provide a product result.');
      return;
    }
    if (resolution.status === 'error') {
      this.loadError.set(resolution.message);
      return;
    }

    this.form.patchValue({
      name: resolution.product.name,
      quantity: resolution.product.quantity,
      unit: resolution.product.unit,
      category: resolution.product.category,
      expirationDate: resolution.product.expirationDate
    }, { emitEvent: false });
    this.form.markAsPristine();
  }

  hasFieldError(field: ProductField): boolean {
    return Boolean(this.fieldErrors()[field]) || Boolean(this.form.get(field)?.touched && this.form.get(field)?.invalid);
  }

  fieldError(field: ProductField): string {
    const configured = this.fieldErrors()[field];
    if (configured) return configured;
    const control = this.form.get(field);
    if (control?.hasError('required')) return field === 'name' ? 'Name is required.' : 'This field is required.';
    if (control?.hasError('maxlength')) return 'Name must be at most 120 characters.';
    if (control?.hasError('min')) return 'Quantity must be greater than zero.';
    return 'Check this value.';
  }

  clearFieldError(field: ProductField): void {
    const errors = { ...this.fieldErrors() };
    delete errors[field];
    this.fieldErrors.set(errors);
    this.saveError.set(null);
  }

  async save(): Promise<void> {
    this.saveError.set(null);
    this.fieldErrors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const input: ProductInput = {
      name: value.name.trim(),
      quantity: Number(value.quantity),
      unit: value.unit,
      category: value.category,
      expirationDate: value.expirationDate || null
    };
    const validationErrors = validateProductInput(input);
    if (Object.keys(validationErrors).length > 0) {
      this.fieldErrors.set(validationErrors);
      return;
    }

    this.saving.set(true);
    try {
      const id = this.productId();
      if (id) await this.facade.update(id, input);
      else await this.facade.create(input);
      await this.nativeFeedback.acknowledgeSuccess();
      this.savedSuccessfully = true;
      this.form.markAsPristine();
      await this.router.navigateByUrl('/pantry');
    } catch (error) {
      if (error instanceof ProductApiError) {
        this.saveError.set(error.message);
        this.fieldErrors.set(error.fieldErrors as ProductFieldErrors);
      } else {
        this.saveError.set('The product could not be saved. Your entries are still available; try again.');
      }
    } finally {
      this.saving.set(false);
    }
  }

  async requestBack(): Promise<void> {
    const allowed = await this.canDeactivate();
    if (allowed) {
      this.form.markAsPristine();
      await this.router.navigateByUrl('/pantry');
    }
  }

  async canDeactivate(): Promise<boolean> {
    if (this.savedSuccessfully || !this.form.dirty || this.saving()) return true;
    const alert = await this.alertController.create({
      header: 'Discard changes?',
      message: 'Your unsaved product changes will be lost.',
      buttons: [
        { text: 'Keep Editing', role: 'cancel' },
        { text: 'Discard Changes', role: 'confirm' }
      ]
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    return result.role === 'confirm';
  }

}
