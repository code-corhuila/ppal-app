import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { HomePage } from './home.page';
import { PantryFacade } from '../features/pantry/presentation/pantry.facade';

describe('HomePage', () => {
  it('creates the pantry page with a controlled facade', async () => {
    const facade = {
      state: () => ({ status: 'loading', products: [], errorMessage: null }),
      load: async () => undefined
    };
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: PantryFacade, useValue: facade },
        { provide: AlertController, useValue: { create: async () => ({ present: async () => undefined }) } },
        { provide: ToastController, useValue: { create: async () => ({ present: async () => undefined }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePage);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
