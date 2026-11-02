import { InjectionToken } from '@angular/core';
import type { HapticsPort, StatusBarPort } from './native-capabilities.port';

export const HAPTICS_PORT = new InjectionToken<HapticsPort>('HAPTICS_PORT');
export const STATUS_BAR_PORT = new InjectionToken<StatusBarPort>('STATUS_BAR_PORT');
