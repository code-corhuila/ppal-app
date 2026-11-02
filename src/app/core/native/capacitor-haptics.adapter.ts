import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { HapticsPort } from './native-capabilities.port';

@Injectable()
export class CapacitorHapticsAdapter implements HapticsPort {
  async lightImpact(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.impact({ style: ImpactStyle.Light });
  }
}
