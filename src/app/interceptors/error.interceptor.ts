import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorMessageService } from '../services/error-message.service';

/**
 * Error Interceptor
 * 
 * Catches HTTP errors globally and displays user-friendly error messages via snackbar/toast.
 * 
 * Architecture Decision:
 * - Retry logic is in BeerApiService (not here) for method-specific strategies
 * - Error interceptor only runs AFTER all retries have failed
 * - Shows non-blocking snackbar messages (auto-dismiss in 5s)
 * - Components can optionally handle specific errors for custom UI
 * 
 * Error Flow:
 * 1. Request fails → BeerApiService retries (up to 3 times with backoff)
 * 2. All retries fail → This interceptor catches final error
 * 3. Show snackbar message to user (non-blocking)
 * 4. Re-throw error for component-level handling (empty states, etc.)
 * 
 * UI Strategy for Beer Catalog App:
 * - Snackbar: Network errors, rate limits, server errors (global)
 * - Component: Empty states (no results, no favorites, initial load)
 * - No modals: Avoid blocking user interaction for GET request failures
 * 
 * @example
 * // In app.config.ts:
 * provideHttpClient(
 *   withInterceptors([loadingInterceptor, errorInterceptor])
 * )
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorMessageService = inject(ErrorMessageService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log error for debugging
      console.error('HTTP Error:', {
        url: req.url,
        status: error.status,
        message: error.message,
        error: error.error
      });
      
      // Determine user-friendly error message
      let userMessage: string;
      
      if (error.status === 0) {
        // Network error (no response from server)
        userMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 429) {
        // Rate limit exceeded
        userMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.status >= 400 && error.status < 500) {
        // Client error (4xx)
        userMessage = error.error?.message || 'Invalid request. Please try again.';
      } else if (error.status >= 500) {
        // Server error (5xx)
        userMessage = error.error?.message || 'Server error. Please try again later.';
      } else {
        // Unknown error
        userMessage = 'An unexpected error occurred. Please try again.';
      }
      
      // Show error message to user (non-blocking)
      errorMessageService.showError(userMessage);
      
      // Re-throw error for component-level handling
      return throwError(() => error);
    })
  );
};
