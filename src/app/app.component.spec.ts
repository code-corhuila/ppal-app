import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { STATUS_BAR_PORT } from './core/native/native-capabilities.token';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('applies the native status-bar style through its port', async () => {
    let calls = 0;
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: STATUS_BAR_PORT, useValue: { applyLightCanvasStyle: async () => { calls += 1; } } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(calls).toBe(1);
  });
});
