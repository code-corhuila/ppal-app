export interface HapticsPort {
  lightImpact(): Promise<void>;
}

export interface StatusBarPort {
  applyLightCanvasStyle(): Promise<void>;
}
