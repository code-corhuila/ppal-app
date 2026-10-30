import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Style, StatusBar } from '@capacitor/status-bar';
import type { StatusBarPort } from './native-capabilities.port';

@Injectable()
export class CapacitorStatusBarAdapter implements StatusBarPort {
  async applyLightCanvasStyle(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    await StatusBar.setStyle({ style: Style.Light });
  }
}
