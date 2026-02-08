import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../shared/services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  
  constructor(private injector: Injector, private zone: NgZone) {}

  handleError(error: any) {
    // Unwrap dependencies lazily to avoid cyclic dependency errors
     const notifier = this.injector.get(NotificationService);

    // Extract message
    const message = error instanceof HttpErrorResponse 
      ? `Backend returned code ${error.status}: ${error.message}`
      : error.message ? error.message : error.toString();

    // Log to console (or external service like Sentry)
    console.error('🔥 Global Error Handler:', message);

    // Show notification (Run inside zone because ErrorHandler often runs outside)
    this.zone.run(() => {
      // notifier.showError('An unexpected error occurred');
      console.log('UI Notification Triggered');
    });
  }
}
