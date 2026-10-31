import { inject, Injectable } from '@angular/core';
import { HAPTICS_PORT } from '../../../core/native/native-capabilities.token';

@Injectable({ providedIn: 'root' })
export class NativeFeedbackService {
  private readonly haptics = inject(HAPTICS_PORT);

  async acknowledgeSuccess(): Promise<void> {
    try {
      await this.haptics.lightImpact();
    } catch {
      console.debug('Native feedback is unavailable; the product operation remains successful.');
    }
  }
}
