import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalLoaderComponent, ToastComponent],
  template: `
    <!-- Global Facilities -->
    <app-global-loader />
    <app-toast />
    
    <!-- Routing -->
    <router-outlet />
  `
})
export class AppComponent {}
