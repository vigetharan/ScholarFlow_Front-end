import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { GlobalErrorHandler } from './core/error-handling/global-error-handler';
import { errorInterceptor } from './core/interceptors/error.interceptor'

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Optimize Change Detection
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // 2. Setup Routing with modern features
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // 3. Setup HTTP with Interceptors
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor,errorInterceptor]) // Chain them here
    ),

    // 4. Global Error Handling
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
