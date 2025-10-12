import { Injectable, signal } from '@angular/core';

/**
 * Error Message Service
 * 
 * Manages global error messages for display in the UI.
 * Provides a signal-based reactive way to show/hide error messages.
 * 
 * Features:
 * - Signal-based: Reactive state management
 * - Auto-dismiss: Optional timeout to clear messages
 * - Queue support: Can store multiple error messages
 * - Global: Single source of truth for error display
 * 
 * Usage Patterns:
 * 1. Toast/Snackbar: Show temporary error notification
 * 2. Alert Banner: Show persistent error at top of page
 * 3. Inline: Component can subscribe to specific errors
 * 
 * @example
 * // In a component:
 * export class AppComponent {
 *   private errorService = inject(ErrorMessageService);
 *   errorMessage = this.errorService.currentError;
 * }
 * 
 * // In template:
 * @if (errorMessage()) {
 *   <div class="error-banner">{{ errorMessage() }}</div>
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {
  /**
   * Current error message to display
   * Null when no error is active
   */
  readonly currentError = signal<string | null>(null);
  
  /**
   * All error messages (for history/debugging)
   * Limited to last 10 errors
   */
  private readonly errorHistory = signal<string[]>([]);
  
  /**
   * Default auto-dismiss timeout (ms)
   * Set to 0 to disable auto-dismiss
   */
  private readonly defaultTimeout = 5000;
  
  /**
   * Active timeout ID for auto-dismiss
   */
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  /**
   * Show an error message to the user
   * 
   * @param message - Error message to display
   * @param timeout - Auto-dismiss timeout in ms (default: 5000, 0 = no auto-dismiss)
   * 
   * @example
   * errorService.showError('Failed to load data');
   * errorService.showError('Network error', 10000); // Show for 10 seconds
   * errorService.showError('Critical error', 0); // No auto-dismiss
   */
  showError(message: string, timeout = this.defaultTimeout): void {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    // Set new error message
    this.currentError.set(message);
    
    // Add to history (keep last 10)
    this.errorHistory.update(history => {
      const newHistory = [...history, message];
      return newHistory.slice(-10);
    });
    
    // Set auto-dismiss timeout if configured
    if (timeout > 0) {
      this.timeoutId = setTimeout(() => {
        this.clearError();
      }, timeout);
    }
  }
  
  /**
   * Clear the current error message
   * Usually called by user action (close button) or auto-dismiss
   */
  clearError(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.currentError.set(null);
  }
  
  /**
   * Get error history (for debugging/testing)
   * Returns readonly copy
   */
  getErrorHistory(): readonly string[] {
    return this.errorHistory();
  }
  
  /**
   * Clear error history (useful for testing)
   */
  clearHistory(): void {
    this.errorHistory.set([]);
  }
}
