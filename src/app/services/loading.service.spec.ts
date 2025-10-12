import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LoadingService
      ]
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with loading false', () => {
    expect(service.loading()).toBe(false);
  });

  describe('show()', () => {
    it('should set loading to true when first request starts', () => {
      service.show();
      expect(service.loading()).toBe(true);
    });

    it('should keep loading true for multiple concurrent requests', () => {
      service.show(); // Request 1
      expect(service.loading()).toBe(true);
      
      service.show(); // Request 2
      expect(service.loading()).toBe(true);
      
      service.show(); // Request 3
      expect(service.loading()).toBe(true);
    });
  });

  describe('hide()', () => {
    it('should set loading to false when last request completes', () => {
      service.show();
      expect(service.loading()).toBe(true);
      
      service.hide();
      expect(service.loading()).toBe(false);
    });

    it('should keep loading true until all requests complete', () => {
      service.show(); // Request 1
      service.show(); // Request 2
      service.show(); // Request 3
      expect(service.loading()).toBe(true);
      
      service.hide(); // Request 1 done
      expect(service.loading()).toBe(true);
      
      service.hide(); // Request 2 done
      expect(service.loading()).toBe(true);
      
      service.hide(); // Request 3 done
      expect(service.loading()).toBe(false);
    });

    it('should not go below zero when hide called more than show', () => {
      service.show();
      service.hide();
      service.hide(); // Extra hide
      service.hide(); // Extra hide
      
      expect(service.loading()).toBe(false);
      
      // Should still work correctly after
      service.show();
      expect(service.loading()).toBe(true);
    });
  });

  describe('reset()', () => {
    it('should reset loading state to false', () => {
      service.show();
      service.show();
      expect(service.loading()).toBe(true);
      
      service.reset();
      expect(service.loading()).toBe(false);
    });

    it('should reset counter so next show works correctly', () => {
      service.show();
      service.show();
      service.reset();
      
      service.show();
      expect(service.loading()).toBe(true);
      
      service.hide();
      expect(service.loading()).toBe(false);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle multiple concurrent HTTP requests correctly', () => {
      // Simulate 3 HTTP requests starting
      service.show(); // Request A starts
      service.show(); // Request B starts
      service.show(); // Request C starts
      expect(service.loading()).toBe(true);
      
      // Request B completes first
      service.hide();
      expect(service.loading()).toBe(true);
      
      // Request A completes
      service.hide();
      expect(service.loading()).toBe(true);
      
      // Request C completes last
      service.hide();
      expect(service.loading()).toBe(false);
    });

    it('should handle rapid request cycling', () => {
      // Request 1
      service.show();
      expect(service.loading()).toBe(true);
      service.hide();
      expect(service.loading()).toBe(false);
      
      // Request 2
      service.show();
      expect(service.loading()).toBe(true);
      service.hide();
      expect(service.loading()).toBe(false);
      
      // Request 3
      service.show();
      expect(service.loading()).toBe(true);
      service.hide();
      expect(service.loading()).toBe(false);
    });
  });
});
