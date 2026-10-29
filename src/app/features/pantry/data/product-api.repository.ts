import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Product, ProductInput, ProductRepository } from '../domain/product';

@Injectable({ providedIn: 'root' })
export class ProductApiRepository implements ProductRepository {
  private readonly baseUrl = Capacitor.isNativePlatform()
    ? environment.nativeApiBaseUrl
    : environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  list(): Promise<Product[]> {
    return firstValueFrom(this.http.get<Product[]>(this.baseUrl + '/products'));
  }

  getById(id: string): Promise<Product> {
    return firstValueFrom(this.http.get<Product>(this.baseUrl + '/products/' + encodeURIComponent(id)));
  }

  create(input: ProductInput): Promise<Product> {
    return firstValueFrom(this.http.post<Product>(this.baseUrl + '/products', this.toRequestBody(input)));
  }

  update(id: string, input: ProductInput): Promise<Product> {
    return firstValueFrom(this.http.put<Product>(this.baseUrl + '/products/' + encodeURIComponent(id), this.toRequestBody(input)));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.baseUrl + '/products/' + encodeURIComponent(id)));
  }

  private toRequestBody(input: ProductInput): ProductInput {
    return {
      ...input,
      name: input.name.trim(),
      expirationDate: input.expirationDate || null
    };
  }
}
