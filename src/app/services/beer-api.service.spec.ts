import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BeerApiService } from './beer-api.service';
import { Beer, BeerSearchParams } from '../models/beer.model';
import { provideZonelessChangeDetection } from '@angular/core';

describe('BeerApiService', () => {
  let service: BeerApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://api.adscanner.tv/punkapi/v2';

  // Mock beer data
  const mockBeers: Beer[] = [
    {
      id: 1,
      name: 'Buzz',
      tagline: 'A Real Bitter Experience.',
      description: 'A light, crisp and bitter IPA',
      image_url: 'https://images.punkapi.com/v2/keg.png',
      abv: 4.5,
      ibu: 60,
      ebc: 20,
      srm: 10,
      ph: 4.4,
      first_brewed: '09/2007',
      attenuation_level: 75,
      volume: { value: 20, unit: 'litres' },
      boil_volume: { value: 25, unit: 'litres' },
      brewers_tips: 'The earthy and floral aromas from the hops can be overpowering.',
      contributed_by: 'Sam Mason <samjbmason>'
    },
    {
      id: 2,
      name: 'Trashy Blonde',
      tagline: 'You Know You Shouldn\'t',
      description: 'A titillating, neurotic, peroxide punk',
      image_url: 'https://images.punkapi.com/v2/2.png',
      abv: 4.1,
      ibu: 41.5,
      ebc: 15,
      srm: 7.5,
      ph: 4.4,
      first_brewed: '04/2008',
      attenuation_level: 76,
      volume: { value: 20, unit: 'litres' },
      boil_volume: { value: 25, unit: 'litres' },
      brewers_tips: 'Be careful not to over bitter from the hops.',
      contributed_by: 'Sam Mason <samjbmason>'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        BeerApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(BeerApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have null rate limit info initially', () => {
      expect(service.getRateLimitInfo()).toBeNull();
    });
  });

  describe('getBeers()', () => {
    it('should fetch beers with default pagination', (done) => {
      service.getBeers().subscribe({
        next: (beers) => {
          expect(beers).toEqual(mockBeers);
          expect(beers.length).toBe(2);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      expect(req.request.method).toBe('GET');
      
      req.flush(mockBeers, {
        headers: {
          'x-ratelimit-limit': '3600',
          'x-ratelimit-remaining': '3599'
        }
      });
    });

    it('should fetch beers with custom pagination', (done) => {
      service.getBeers(2, 10).subscribe({
        next: (beers) => {
          expect(beers).toEqual(mockBeers);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/beers?page=2&per_page=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBeers);
    });

    it('should extract and store rate limit headers', (done) => {
      service.getBeers().subscribe({
        next: () => {
          const rateLimit = service.getRateLimitInfo();
          expect(rateLimit).not.toBeNull();
          expect(rateLimit?.limit).toBe(3600);
          expect(rateLimit?.remaining).toBe(3500);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req.flush(mockBeers, {
        headers: {
          'x-ratelimit-limit': '3600',
          'x-ratelimit-remaining': '3500'
        }
      });
    });
  });

  describe('searchBeers()', () => {
    it('should search beers with name filter', (done) => {
      const params: BeerSearchParams = {
        beer_name: 'punk_ipa'
      };

      service.searchBeers(params).subscribe({
        next: (beers) => {
          expect(beers).toEqual(mockBeers);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/beers?beer_name=punk_ipa`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBeers);
    });

    it('should search beers with ABV range filters', (done) => {
      const params: BeerSearchParams = {
        abv_gt: 5,
        abv_lt: 10
      };

      service.searchBeers(params).subscribe({
        next: (beers) => {
          expect(beers).toEqual(mockBeers);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/beers?abv_gt=5&abv_lt=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBeers);
    });

    it('should search beers with all filters combined', (done) => {
      const params: BeerSearchParams = {
        beer_name: 'ipa',
        abv_gt: 5,
        abv_lt: 10,
        page: 2,
        per_page: 10
      };

      service.searchBeers(params).subscribe({
        next: (beers) => {
          expect(beers).toEqual(mockBeers);
          done();
        }
      });

      const req = httpMock.expectOne(
        `${baseUrl}/beers?beer_name=ipa&abv_gt=5&abv_lt=10&page=2&per_page=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockBeers);
    });

    it('should NOT send sort parameters to API (shimmed for future)', (done) => {
      const params: BeerSearchParams = {
        beer_name: 'ipa',
        sort_by: 'name',
        sort_order: 'asc'
      };

      service.searchBeers(params).subscribe({
        next: (beers) => {
          expect(beers).toEqual(mockBeers);
          done();
        }
      });

      // Verify sort params are NOT in the URL
      const req = httpMock.expectOne(`${baseUrl}/beers?beer_name=ipa`);
      expect(req.request.url).not.toContain('sort_by');
      expect(req.request.url).not.toContain('sort_order');
      req.flush(mockBeers);
    });

    it('should handle empty search results', (done) => {
      service.searchBeers({ beer_name: 'nonexistent' }).subscribe({
        next: (beers) => {
          expect(beers).toEqual([]);
          expect(beers.length).toBe(0);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/beers?beer_name=nonexistent`);
      req.flush([]);
    });
  });

  describe('getBeerById()', () => {
    it('should fetch a single beer by ID', (done) => {
      const beerId = 192;

      service.getBeerById(beerId).subscribe({
        next: (beers) => {
          expect(beers).toEqual([mockBeers[0]]);
          expect(beers.length).toBe(1);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/beers/${beerId}`);
      expect(req.request.method).toBe('GET');
      req.flush([mockBeers[0]]); // API returns array with single item
    });
  });

  describe('getRandomBeer()', () => {
    it('should fetch a random beer', (done) => {
      service.getRandomBeer().subscribe({
        next: (beers) => {
          expect(beers).toEqual([mockBeers[0]]);
          expect(beers.length).toBe(1);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/beers/random`);
      expect(req.request.method).toBe('GET');
      req.flush([mockBeers[0]]); // API returns array with single item
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors with retry', (done) => {
      jasmine.clock().install();
      
      service.getBeers().subscribe({
        error: (error) => {
          expect(error.statusCode).toBe(0);
          expect(error.message).toContain('connect to the server');
          jasmine.clock().uninstall();
          done();
        }
      });

      // First attempt
      const req1 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req1.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
      jasmine.clock().tick(1000); // Wait for first retry delay (1s)
      
      // Second attempt (retry 1)
      const req2 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req2.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
      jasmine.clock().tick(2000); // Wait for second retry delay (2s)
      
      // Third attempt (retry 2)
      const req3 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req3.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
      jasmine.clock().tick(4000); // Wait for third retry delay (4s)
      
      // Fourth attempt (retry 3 - final)
      const req4 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req4.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    });

    it('should handle rate limit errors (429) without retry', (done) => {
      service.getBeers().subscribe({
        next: () => fail('Should have failed with 429 error'),
        error: (error) => {
          expect(error.statusCode).toBe(429);
          expect(error.message).toContain('Too many requests');
          done();
        }
      });

      // 429 errors should NOT be retried (4xx errors not retried)
      const req = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req.flush(
        { message: 'Rate limit exceeded' },
        { status: 429, statusText: 'Too Many Requests' }
      );
    });

    it('should handle server errors (500) with retry', (done) => {
      jasmine.clock().install();
      
      service.getBeers().subscribe({
        next: () => fail('Should have failed with 500 error'),
        error: (error) => {
          expect(error.statusCode).toBe(500);
          // API returns the actual error message from response
          expect(error.message).toBe('Internal server error');
          jasmine.clock().uninstall();
          done();
        }
      });

      // First attempt
      const req1 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req1.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
      jasmine.clock().tick(1000);
      
      // Second attempt (retry 1)
      const req2 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req2.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
      jasmine.clock().tick(2000);
      
      // Third attempt (retry 2)
      const req3 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req3.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
      jasmine.clock().tick(4000);
      
      // Fourth attempt (retry 3 - final)
      const req4 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req4.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle 404 not found errors without retry', (done) => {
      service.getBeerById(99999).subscribe({
        next: () => fail('Should have failed with 404 error'),
        error: (error) => {
          expect(error.statusCode).toBe(404);
          expect(error.message).toBe('Beer not found');
          done();
        }
      });

      // 4xx errors should NOT be retried
      const req = httpMock.expectOne(`${baseUrl}/beers/99999`);
      req.flush(
        { message: 'Beer not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should successfully retry and recover from temporary errors', (done) => {
      jasmine.clock().install();
      
      service.getBeers().subscribe({
        next: (beers) => {
          expect(beers).toEqual(mockBeers);
          jasmine.clock().uninstall();
          done();
        }
      });

      // First attempt - fails
      const req1 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req1.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
      jasmine.clock().tick(1000);
      
      // Second attempt - succeeds
      const req2 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req2.flush(mockBeers);
    });
  });

  describe('Rate Limiting', () => {
    it('should update rate limit info on each request', (done) => {
      // First request
      service.getBeers().subscribe({
        next: () => {
          let rateLimit = service.getRateLimitInfo();
          expect(rateLimit?.remaining).toBe(3599);

          // Second request
          service.getBeers().subscribe({
            next: () => {
              rateLimit = service.getRateLimitInfo();
              expect(rateLimit?.remaining).toBe(3598);
              done();
            }
          });

          const req2 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
          req2.flush(mockBeers, {
            headers: {
              'x-ratelimit-limit': '3600',
              'x-ratelimit-remaining': '3598'
            }
          });
        }
      });

      const req1 = httpMock.expectOne(`${baseUrl}/beers?page=1&per_page=25`);
      req1.flush(mockBeers, {
        headers: {
          'x-ratelimit-limit': '3600',
          'x-ratelimit-remaining': '3599'
        }
      });
    });
  });
});
