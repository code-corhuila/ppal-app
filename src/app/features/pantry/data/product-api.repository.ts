import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom, type Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Product, ProductInput, ProductRepository } from '../domain/product';
import { mapProductDto } from './product.dto-mapper';
import { ProductApiError } from './product-api-error';

@Injectable({ providedIn: 'root' })
export class ProductApiRepository implements ProductRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = Capacitor.isNativePlatform()
    ? environment.nativeApiBaseUrl
    : environment.apiBaseUrl;

  async list(): Promise<Product[]> {
    const value = await firstValueFrom(this.http.get<unknown>(this.baseUrl + '/products'));
    if (!Array.isArray(value)) throw new ProductApiError('The server returned an invalid product list.');
    return value.map(mapProductDto);
  }

  getById(id: string): Promise<Product> {
    return this.mapResponse(this.http.get<unknown>(this.baseUrl + '/products/' + encodeURIComponent(id)));
  }

  create(input: ProductInput): Promise<Product> {
    return this.mapResponse(this.http.post<unknown>(this.baseUrl + '/products', this.toRequestBody(input)));
  }

  update(id: string, input: ProductInput): Promise<Product> {
    return this.mapResponse(this.http.put<unknown>(this.baseUrl + '/products/' + encodeURIComponent(id), this.toRequestBody(input)));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.baseUrl + '/products/' + encodeURIComponent(id)));
  }

  private async mapResponse(response: Observable<unknown>): Promise<Product> {
    return mapProductDto(await firstValueFrom(response));
  }

  private toRequestBody(input: ProductInput): ProductInput {
    return {
      ...input,
      name: input.name.trim(),
      expirationDate: input.expirationDate || null
    };
  }
}
