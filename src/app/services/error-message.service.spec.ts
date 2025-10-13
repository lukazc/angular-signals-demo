import { TestBed } from '@angular/core/testing';
import { ErrorMessageService } from './error-message.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ErrorMessageService', () => {
  let service: ErrorMessageService;

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ErrorMessageService
      ]
    });
    service = TestBed.inject(ErrorMessageService);
  });

  afterEach(() => {
    // Clear any pending timeouts
    service.clearError();
    service.clearHistory();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no error', () => {
    expect(service.currentError()).toBeNull();
  });

  describe('showError()', () => {
    it('should set the current error message', () => {
      const message = 'Test error message';
      service.showError(message);
      
      expect(service.currentError()).toBe(message);
    });

    it('should add error to history', () => {
      service.showError('Error 1');
      service.showError('Error 2');
      
      const history = service.getErrorHistory();
      expect(history).toContain('Error 1');
      expect(history).toContain('Error 2');
      expect(history.length).toBe(2);
    });

    it('should limit error history to 10 items', () => {
      // Add 15 errors
      for (let i = 1; i <= 15; i++) {
        service.showError(`Error ${i}`);
      }
      
      const history = service.getErrorHistory();
      expect(history.length).toBe(10);
      expect(history[0]).toBe('Error 6'); // First 5 should be removed
      expect(history[9]).toBe('Error 15');
    });

    it('should auto-dismiss after default timeout', async () => {
      service.showError('Test error');
      expect(service.currentError()).toBe('Test error');
      
      // Default timeout is 5000ms
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      expect(service.currentError()).toBeNull();
    });

    it('should auto-dismiss after custom timeout', async () => {
      service.showError('Test error', 100); // 100ms for faster test
      expect(service.currentError()).toBe('Test error');
      
      // Wait for timeout to complete with buffer
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(service.currentError()).toBeNull(); // Cleared
    });

    it('should not auto-dismiss when timeout is 0', async () => {
      service.showError('Persistent error', 0);
      expect(service.currentError()).toBe('Persistent error');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(service.currentError()).toBe('Persistent error'); // Still visible
    });

    it('should replace existing error message', () => {
      service.showError('First error');
      expect(service.currentError()).toBe('First error');
      
      service.showError('Second error');
      expect(service.currentError()).toBe('Second error');
    });

    it('should clear previous timeout when showing new error', async () => {
      service.showError('First error', 2000);
      expect(service.currentError()).toBe('First error');
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      service.showError('Second error', 2000); // Show new error
      expect(service.currentError()).toBe('Second error');
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5 more seconds (2.5 total)
      // First error's timeout would have fired, but should be cleared
      expect(service.currentError()).toBe('Second error');
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Complete second error's timeout
      expect(service.currentError()).toBeNull();
    });
  });

  describe('clearError()', () => {
    it('should clear the current error', () => {
      service.showError('Test error');
      expect(service.currentError()).toBe('Test error');
      
      service.clearError();
      expect(service.currentError()).toBeNull();
    });

    it('should cancel auto-dismiss timeout', async () => {
      service.showError('Test error', 5000);
      expect(service.currentError()).toBe('Test error');
      
      // Manually clear before timeout
      service.clearError();
      expect(service.currentError()).toBeNull();
      
      // Wait for original timeout
      await new Promise(resolve => setTimeout(resolve, 5100));
      
      // Should still be null (timeout was cleared)
      expect(service.currentError()).toBeNull();
    });

    it('should be safe to call multiple times', () => {
      service.showError('Test error');
      service.clearError();
      service.clearError();
      service.clearError();
      
      expect(service.currentError()).toBeNull();
    });

    it('should be safe to call when no error is set', () => {
      expect(service.currentError()).toBeNull();
      service.clearError();
      expect(service.currentError()).toBeNull();
    });
  });

  describe('getErrorHistory()', () => {
    it('should return empty array initially', () => {
      const history = service.getErrorHistory();
      expect(history).toEqual([]);
    });

    it('should return all error messages in order', () => {
      service.showError('Error 1');
      service.showError('Error 2');
      service.showError('Error 3');
      
      const history = service.getErrorHistory();
      expect(history).toEqual(['Error 1', 'Error 2', 'Error 3']);
    });
  });

  describe('clearHistory()', () => {
    it('should clear error history', () => {
      service.showError('Error 1');
      service.showError('Error 2');
      
      expect(service.getErrorHistory().length).toBe(2);
      
      service.clearHistory();
      
      expect(service.getErrorHistory()).toEqual([]);
    });

    it('should not affect current error', () => {
      service.showError('Current error');
      service.clearHistory();
      
      expect(service.currentError()).toBe('Current error');
      expect(service.getErrorHistory()).toEqual([]);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle rapid error succession', async () => {
      service.showError('Error 1', 1000);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      service.showError('Error 2', 1000);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      service.showError('Error 3', 1000);
      expect(service.currentError()).toBe('Error 3');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(service.currentError()).toBeNull();
      
      const history = service.getErrorHistory();
      expect(history).toEqual(['Error 1', 'Error 2', 'Error 3']);
    });

    it('should handle user dismissing before auto-dismiss', async () => {
      service.showError('Test error', 5000);
      expect(service.currentError()).toBe('Test error');
      
      // User clicks dismiss button after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      service.clearError();
      
      expect(service.currentError()).toBeNull();
      
      // Original timeout shouldn't cause issues
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(service.currentError()).toBeNull();
    });
  });
});
