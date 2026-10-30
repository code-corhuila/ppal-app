import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { STATUS_BAR_PORT } from './core/native/native-capabilities.token';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private readonly statusBar = inject(STATUS_BAR_PORT);

  ngOnInit(): void {
    void this.statusBar.applyLightCanvasStyle().catch(() => {
      console.debug('Status bar styling is unavailable on this platform.');
    });
  }
}
