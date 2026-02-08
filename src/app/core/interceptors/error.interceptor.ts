import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred.';

      if (error.status === 0) {
        // A status of 0 usually means the backend is down or CORS issues
        errorMessage = 'Unable to connect to the server. Please check your internet connection or try again later.';
      } else if (error.status === 401) {
        // 401 is handled by AuthInterceptor (redirect), but we can still warn
        errorMessage = 'Session expired. Please login again.';
      } else if (error.error && typeof error.error.message === 'string') {
        // Standard Backend Error Format
        errorMessage = error.error.message;
      } else {
        // Generic fallback
        errorMessage = `Server Error (${error.status}): ${error.statusText}`;
      }

      // 1. Show the Toast
      notificationService.showError(errorMessage);

      // 2. Re-throw the error so the Component can still stop the spinner
      return throwError(() => error);
    })
  );
};