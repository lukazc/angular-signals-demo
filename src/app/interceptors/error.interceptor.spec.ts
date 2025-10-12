import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { ErrorMessageService } from '../services/error-message.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Error Interceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let errorMessageService: ErrorMessageService;
  const testUrl = 'https://api.test.com/data';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(
          withInterceptors([errorInterceptor])
        ),
        provideHttpClientTesting(),
        ErrorMessageService
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    errorMessageService = TestBed.inject(ErrorMessageService);
    
    // Spy on console.error to avoid cluttering test output
    spyOn(console, 'error');
  });

  afterEach(() => {
    httpMock.verify();
    errorMessageService.clearError();
  });

  describe('Network Errors (Status 0)', () => {
    it('should show connection error message', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toBe(
            'Unable to connect to the server. Please check your internet connection.'
          );
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    });

    it('should log network error to console', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(console.error).toHaveBeenCalledWith(
            'HTTP Error:',
            jasmine.objectContaining({
              url: testUrl,
              status: 0
            })
          );
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.error(new ProgressEvent('error'), { status: 0 });
    });
  });

  describe('Rate Limit Errors (429)', () => {
    it('should show rate limit error message', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toBe(
            'Too many requests. Please wait a moment and try again.'
          );
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(
        { message: 'Rate limit exceeded' },
        { status: 429, statusText: 'Too Many Requests' }
      );
    });
  });

  describe('Client Errors (4xx)', () => {
    it('should show custom error message from API for 400', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toBe('Invalid beer ID provided');
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(
        { message: 'Invalid beer ID provided' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should show custom error message for 404', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toBe('Beer not found');
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(
        { message: 'Beer not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should show generic message when API does not provide one', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toBe('Invalid request. Please try again.');
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 400, statusText: 'Bad Request' });
    });

    it('should show custom error for 401 Unauthorized', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toBe('Authentication required');
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(
        { message: 'Authentication required' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  describe('Server Errors (5xx)', () => {
    it('should show server error message for 500', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toBe('Internal server error');
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should show generic server error when no message provided', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toBe('Server error. Please try again later.');
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 503 Service Unavailable', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toBe('Service temporarily unavailable');
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(
        { message: 'Service temporarily unavailable' },
        { status: 503, statusText: 'Service Unavailable' }
      );
    });
  });

  describe('Error Propagation', () => {
    it('should re-throw error for component handling', (done) => {
      httpClient.get(testUrl).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(
        { message: 'Not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should preserve error details for debugging', (done) => {
      httpClient.get(testUrl).subscribe({
        error: (error) => {
          expect(error.error).toEqual({ message: 'Test error' });
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(
        { message: 'Test error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('Console Logging', () => {
    it('should log all errors to console for debugging', (done) => {
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(console.error).toHaveBeenCalledWith(
            'HTTP Error:',
            jasmine.objectContaining({
              url: testUrl,
              status: 500,
              message: jasmine.any(String)
            })
          );
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should include error body in console log', (done) => {
      const errorBody = { code: 'ERR_500', details: 'Database connection failed' };
      
      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(console.error).toHaveBeenCalledWith(
            'HTTP Error:',
            jasmine.objectContaining({
              error: errorBody
            })
          );
          done();
        }
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(errorBody, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('Multiple Errors', () => {
    it('should handle multiple errors in sequence', (done) => {
      let errorCount = 0;

      const checkDone = () => {
        errorCount++;
        if (errorCount === 2) {
          // Last error should be displayed
          expect(errorMessageService.currentError()).toContain('Server error');
          done();
        }
      };

      // First error
      httpClient.get(testUrl + '/1').subscribe({
        error: () => checkDone()
      });

      const req1 = httpMock.expectOne(testUrl + '/1');
      req1.flush(null, { status: 404, statusText: 'Not Found' });

      // Second error
      httpClient.get(testUrl + '/2').subscribe({
        error: () => checkDone()
      });

      const req2 = httpMock.expectOne(testUrl + '/2');
      req2.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('Real-world scenarios', () => {
    it('should show appropriate message for different error types in succession', (done) => {
      let step = 0;

      // Network error
      httpClient.get(testUrl + '/network').subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toContain('Unable to connect');
          step++;
          if (step === 3) done();
        }
      });

      const req1 = httpMock.expectOne(testUrl + '/network');
      req1.error(new ProgressEvent('error'), { status: 0 });

      // Rate limit error
      httpClient.get(testUrl + '/ratelimit').subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toContain('Too many requests');
          step++;
          if (step === 3) done();
        }
      });

      const req2 = httpMock.expectOne(testUrl + '/ratelimit');
      req2.flush(null, { status: 429, statusText: 'Too Many Requests' });

      // Server error
      httpClient.get(testUrl + '/server').subscribe({
        error: () => {
          expect(errorMessageService.currentError()).toContain('Server error');
          step++;
          if (step === 3) done();
        }
      });

      const req3 = httpMock.expectOne(testUrl + '/server');
      req3.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
