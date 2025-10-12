import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Loading Interceptor
 * 
 * Tracks active HTTP requests and updates loading state globally.
 * Increments counter on request start, decrements on completion/error.
 * 
 * Usage:
 * - Shows loading spinner/progress bar when any HTTP request is active
 * - Handles multiple concurrent requests correctly
 * - Automatically cleans up on request completion
 * 
 * @example
 * // In app.config.ts:
 * provideHttpClient(
 *   withInterceptors([loadingInterceptor, errorInterceptor])
 * )
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Increment active request counter
  loadingService.show();
  
  // Process request and decrement counter on completion
  return next(req).pipe(
    finalize(() => {
      // Always called on complete or error
      loadingService.hide();
    })
  );
};
