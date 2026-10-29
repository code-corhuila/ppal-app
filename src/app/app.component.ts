import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Style, StatusBar } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    if (Capacitor.isNativePlatform()) {
      void StatusBar.setStyle({ style: Style.Light }).catch(() => {
        // Status bar styling is best-effort and must not block app startup.
      });
    }
  }
}
