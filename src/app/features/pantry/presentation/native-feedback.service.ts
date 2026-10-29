import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Injectable({ providedIn: 'root' })
export class NativeFeedbackService {
  async acknowledgeSuccess(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Native feedback is best-effort and must never block a successful product operation.
    }
  }
}
