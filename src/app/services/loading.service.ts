import { Injectable, signal } from '@angular/core';

/**
 * Loading Service
 * 
 * Manages global loading state for the application.
 * Tracks the number of active HTTP requests and exposes loading state as a signal.
 * 
 * Features:
 * - Counter-based: Handles multiple concurrent requests correctly
 * - Signal-based: Reactive state management compatible with zoneless change detection
 * - Automatic: Works seamlessly with loading interceptor
 * 
 * @example
 * // In a component:
 * export class AppComponent {
 *   private loadingService = inject(LoadingService);
 *   loading = this.loadingService.loading;
 * }
 * 
 * // In template:
 * @if (loading()) {
 *   <div class="loading-spinner">Loading...</div>
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  /**
   * Number of active HTTP requests
   * Private - use loading() signal for reading state
   */
  private activeRequests = signal<number>(0);
  
  /**
   * Public loading state
   * True when any HTTP request is active (activeRequests > 0)
   */
  readonly loading = signal<boolean>(false);
  
  /**
   * Increment active request counter and update loading state
   * Called by loading interceptor on request start
   */
  show(): void {
    this.activeRequests.update(count => count + 1);
    this.loading.set(this.activeRequests() > 0);
  }
  
  /**
   * Decrement active request counter and update loading state
   * Called by loading interceptor on request completion/error
   */
  hide(): void {
    this.activeRequests.update(count => Math.max(0, count - 1));
    this.loading.set(this.activeRequests() > 0);
  }
  
  /**
   * Reset loading state (useful for testing or error recovery)
   * Not typically needed in production code
   */
  reset(): void {
    this.activeRequests.set(0);
    this.loading.set(false);
  }
}
