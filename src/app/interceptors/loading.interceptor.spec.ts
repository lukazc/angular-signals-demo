import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Loading Interceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;
  const testUrl = 'https://api.test.com/data';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(
          withInterceptors([loadingInterceptor])
        ),
        provideHttpClientTesting(),
        LoadingService
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should show loading when request starts', () => {
    expect(loadingService.loading()).toBe(false);

    httpClient.get(testUrl).subscribe();

    expect(loadingService.loading()).toBe(true);

    const req = httpMock.expectOne(testUrl);
    req.flush({ data: 'test' });

    expect(loadingService.loading()).toBe(false);
  });

  it('should hide loading when request completes successfully', (done) => {
    httpClient.get(testUrl).subscribe({
      next: () => {
        // finalize() runs in microtask queue, need to wait
        queueMicrotask(() => {
          expect(loadingService.loading()).toBe(false);
          done();
        });
      }
    });

    expect(loadingService.loading()).toBe(true);

    const req = httpMock.expectOne(testUrl);
    req.flush({ data: 'test' });
  });

  it('should hide loading when request fails', (done) => {
    httpClient.get(testUrl).subscribe({
      error: () => {
        // finalize() runs in microtask queue, need to wait
        queueMicrotask(() => {
          expect(loadingService.loading()).toBe(false);
          done();
        });
      }
    });

    expect(loadingService.loading()).toBe(true);

    const req = httpMock.expectOne(testUrl);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
  });

  it('should handle multiple concurrent requests', () => {
    // Start 3 requests
    httpClient.get(testUrl + '/1').subscribe();
    httpClient.get(testUrl + '/2').subscribe();
    httpClient.get(testUrl + '/3').subscribe();

    expect(loadingService.loading()).toBe(true);

    // Complete first request
    const req1 = httpMock.expectOne(testUrl + '/1');
    req1.flush({ data: '1' });
    expect(loadingService.loading()).toBe(true); // Still 2 active

    // Complete second request
    const req2 = httpMock.expectOne(testUrl + '/2');
    req2.flush({ data: '2' });
    expect(loadingService.loading()).toBe(true); // Still 1 active

    // Complete third request
    const req3 = httpMock.expectOne(testUrl + '/3');
    req3.flush({ data: '3' });
    expect(loadingService.loading()).toBe(false); // All done
  });

  it('should handle mixed success and error responses', (done) => {
    let completedCount = 0;

    const checkComplete = () => {
      completedCount++;
      if (completedCount === 3) {
        // finalize() runs in microtask queue, need to wait
        queueMicrotask(() => {
          expect(loadingService.loading()).toBe(false);
          done();
        });
      }
    };

    // Start 3 requests
    httpClient.get(testUrl + '/success').subscribe({
      next: () => checkComplete()
    });

    httpClient.get(testUrl + '/error').subscribe({
      error: () => checkComplete()
    });

    httpClient.get(testUrl + '/success2').subscribe({
      next: () => checkComplete()
    });

    expect(loadingService.loading()).toBe(true);

    // Complete with mixed results
    const req1 = httpMock.expectOne(testUrl + '/success');
    req1.flush({ data: 'success' });

    const req2 = httpMock.expectOne(testUrl + '/error');
    req2.error(new ProgressEvent('error'));

    const req3 = httpMock.expectOne(testUrl + '/success2');
    req3.flush({ data: 'success2' });
  });

  it('should handle rapid sequential requests', () => {
    // Request 1
    httpClient.get(testUrl + '/1').subscribe();
    expect(loadingService.loading()).toBe(true);

    const req1 = httpMock.expectOne(testUrl + '/1');
    req1.flush({ data: '1' });
    expect(loadingService.loading()).toBe(false);

    // Request 2
    httpClient.get(testUrl + '/2').subscribe();
    expect(loadingService.loading()).toBe(true);

    const req2 = httpMock.expectOne(testUrl + '/2');
    req2.flush({ data: '2' });
    expect(loadingService.loading()).toBe(false);

    // Request 3
    httpClient.get(testUrl + '/3').subscribe();
    expect(loadingService.loading()).toBe(true);

    const req3 = httpMock.expectOne(testUrl + '/3');
    req3.flush({ data: '3' });
    expect(loadingService.loading()).toBe(false);
  });

  it('should work with different HTTP methods', () => {
    httpClient.get(testUrl).subscribe();
    httpClient.post(testUrl, {}).subscribe();
    httpClient.put(testUrl, {}).subscribe();
    httpClient.delete(testUrl).subscribe();

    expect(loadingService.loading()).toBe(true);

    const reqs = httpMock.match(testUrl);
    expect(reqs.length).toBe(4);

    reqs.forEach(req => req.flush({}));

    expect(loadingService.loading()).toBe(false);
  });
});
