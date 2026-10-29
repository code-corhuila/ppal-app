import type { CanDeactivateFn } from '@angular/router';

export interface PendingChangesPage {
  canDeactivate(): boolean | Promise<boolean>;
}

export const pendingChangesGuard: CanDeactivateFn<PendingChangesPage> = (component) => component.canDeactivate();
