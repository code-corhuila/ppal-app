import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { apiResilienceInterceptor } from './app/features/pantry/data/api-resilience.interceptor';
import { PRODUCT_REPOSITORY } from './app/features/pantry/data/product-repository.token';
import { ProductApiRepository } from './app/features/pantry/data/product-api.repository';
import { CapacitorHapticsAdapter } from './app/core/native/capacitor-haptics.adapter';
import { CapacitorStatusBarAdapter } from './app/core/native/capacitor-status-bar.adapter';
import { HAPTICS_PORT, STATUS_BAR_PORT } from './app/core/native/native-capabilities.token';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiResilienceInterceptor])),
    { provide: PRODUCT_REPOSITORY, useClass: ProductApiRepository },
    { provide: HAPTICS_PORT, useClass: CapacitorHapticsAdapter },
    { provide: STATUS_BAR_PORT, useClass: CapacitorStatusBarAdapter }
  ]
});
