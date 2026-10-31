import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HAPTICS_PORT } from '../../../core/native/native-capabilities.token';
import type { HapticsPort } from '../../../core/native/native-capabilities.port';
import { NativeFeedbackService } from './native-feedback.service';

async function createService(port: HapticsPort): Promise<NativeFeedbackService> {
  await TestBed.configureTestingModule({
    providers: [
      NativeFeedbackService,
      { provide: HAPTICS_PORT, useValue: port }
    ]
  }).compileComponents();

  return TestBed.inject(NativeFeedbackService);
}

describe('NativeFeedbackService', () => {
  it('acknowledges a server-confirmed mutation through the haptics port', async () => {
    let calls = 0;
    const service = await createService({
      lightImpact: async () => { calls += 1; }
    });

    await service.acknowledgeSuccess();

    expect(calls).toBe(1);
  });

  it('does not turn a successful mutation into a failure when native haptics are unavailable', async () => {
    const service = await createService({
      lightImpact: async () => { throw new Error('Native bridge unavailable'); }
    });

    await expect(service.acknowledgeSuccess()).resolves.toBeUndefined();
  });
});
