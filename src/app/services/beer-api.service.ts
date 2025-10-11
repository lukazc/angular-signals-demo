import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ApiError, Beer, BeerSearchParams, RateLimitInfo } from '../models/beer.model';

/**
 * Service for interacting with the Punk API
 * 
 * Provides methods for fetching beer data with built-in:
 * - Rate limit handling (3600 req/hour = 1 req/sec)
 * - Retry logic with exponential backoff
 * - Error handling and transformation
 * - API filter parameter support
 * 
 * API Endpoint: https://api.adscanner.tv/punkapi/v2/
 * 
 * Supported filters:
 * - beer_name: partial match search
 * - abv_gt: minimum ABV
 * - abv_lt: maximum ABV
 * - page: pagination page number
 * - per_page: results per page (default: 25)
 * 
 * Note: API does NOT support sort_by/sort_order parameters.
 * These are shimmed in BeerSearchParams for future API support.
 */
@Injectable({
  providedIn: 'root'
})
export class BeerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.adscanner.tv/punkapi/v2';
  
  /**
   * Rate limit information from last API response
   * Exposed for UI to display rate limit status
   */
  private rateLimitInfo: RateLimitInfo | null = null;
  
  /**
   * Maximum retry attempts for failed requests
   */
  private readonly maxRetries = 3;
  
  /**
   * Initial delay for exponential backoff (ms)
   */
  private readonly retryDelay = 1000;

  /**
   * Get paginated list of beers
   * 
   * @param page - Page number (1-indexed)
   * @param perPage - Number of results per page (default: 25)
   * @returns Observable of Beer array
   * 
   * @example
   * ```typescript
   * this.beerApi.getBeers(1, 25).subscribe(beers => {
   *   console.log('Fetched beers:', beers);
   * });
   * ```
   */
  getBeers(page: number = 1, perPage: number = 25): Observable<Beer[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<Beer[]>(`${this.baseUrl}/beers`, { 
      params, 
      observe: 'response' 
    }).pipe(
      this.handleRateLimitHeaders<Beer[]>(),
      this.retryWithBackoff<Beer[]>(),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Search beers with filters
   * 
   * Supports API-level filtering for:
   * - beer_name: partial match (use underscore for spaces)
   * - abv_gt: minimum ABV threshold
   * - abv_lt: maximum ABV threshold
   * - page: pagination page number
   * - per_page: results per page
   * 
   * Note: sort_by and sort_order are NOT sent to API (shimmed for future).
   * Sorting must be done client-side until API adds support.
   * 
   * @param params - Search and filter parameters
   * @returns Observable of Beer array
   * 
   * @example
   * ```typescript
   * this.beerApi.searchBeers({
   *   beer_name: 'punk_ipa',
   *   abv_gt: 5,
   *   abv_lt: 10,
   *   page: 1,
   *   per_page: 25
   * }).subscribe(beers => {
   *   console.log('Filtered beers:', beers);
   * });
   * ```
   */
  searchBeers(params?: BeerSearchParams): Observable<Beer[]> {
    let httpParams = new HttpParams();

    if (params) {
      // API-supported parameters
      if (params.beer_name) {
        httpParams = httpParams.set('beer_name', params.beer_name);
      }
      if (params.abv_gt !== undefined) {
        httpParams = httpParams.set('abv_gt', params.abv_gt.toString());
      }
      if (params.abv_lt !== undefined) {
        httpParams = httpParams.set('abv_lt', params.abv_lt.toString());
      }
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.per_page !== undefined) {
        httpParams = httpParams.set('per_page', params.per_page.toString());
      }

      // TODO: Uncomment when API supports sort parameters
      // if (params.sort_by) {
      //   httpParams = httpParams.set('sort_by', params.sort_by);
      // }
      // if (params.sort_order) {
      //   httpParams = httpParams.set('sort_order', params.sort_order);
      // }
    }

    return this.http.get<Beer[]>(`${this.baseUrl}/beers`, { 
      params: httpParams, 
      observe: 'response' 
    }).pipe(
      this.handleRateLimitHeaders<Beer[]>(),
      this.retryWithBackoff<Beer[]>(),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get a single beer by ID
   * 
   * @param id - Beer ID
   * @returns Observable of Beer array (API returns array with single item)
   * 
   * @example
   * ```typescript
   * this.beerApi.getBeerById(192).subscribe(beers => {
   *   const beer = beers[0]; // API returns array with single item
   *   console.log('Beer details:', beer);
   * });
   * ```
   */
  getBeerById(id: number): Observable<Beer[]> {
    return this.http.get<Beer[]>(`${this.baseUrl}/beers/${id}`, { 
      observe: 'response' 
    }).pipe(
      this.handleRateLimitHeaders<Beer[]>(),
      this.retryWithBackoff<Beer[]>(),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get a random beer
   * 
   * @returns Observable of Beer array (API returns array with single item)
   * 
   * @example
   * ```typescript
   * this.beerApi.getRandomBeer().subscribe(beers => {
   *   const beer = beers[0]; // API returns array with single item
   *   console.log('Random beer:', beer);
   * });
   * ```
   */
  getRandomBeer(): Observable<Beer[]> {
    return this.http.get<Beer[]>(`${this.baseUrl}/beers/random`, { 
      observe: 'response' 
    }).pipe(
      this.handleRateLimitHeaders<Beer[]>(),
      this.retryWithBackoff<Beer[]>(),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get current rate limit information
   * 
   * @returns Rate limit info from last API response, or null if no requests made yet
   * 
   * @example
   * ```typescript
   * const rateLimit = this.beerApi.getRateLimitInfo();
   * if (rateLimit) {
   *   console.log(`Remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
   * }
   * ```
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Operator to extract and store rate limit headers from API response
   * 
   * Rate limit: 3600 requests per hour (1 req/sec)
   * Headers: x-ratelimit-limit, x-ratelimit-remaining
   */
  private handleRateLimitHeaders<T>() {
    return (source: Observable<any>): Observable<T> => {
      return new Observable<T>(observer => {
        return source.subscribe({
          next: (response) => {
            // Extract rate limit headers if present
            if (response.headers) {
              const limit = response.headers.get('x-ratelimit-limit');
              const remaining = response.headers.get('x-ratelimit-remaining');
              
              if (limit && remaining) {
                this.rateLimitInfo = {
                  limit: parseInt(limit, 10),
                  remaining: parseInt(remaining, 10)
                };
              }
            }
            
            // Emit the response body
            observer.next(response.body as T);
          },
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      });
    };
  }

  /**
   * Retry logic with exponential backoff
   * 
   * Retries failed requests up to maxRetries times with increasing delays:
   * - Attempt 1: 1000ms delay
   * - Attempt 2: 2000ms delay
   * - Attempt 3: 4000ms delay
   * 
   * Only retries on:
   * - Network errors (status 0)
   * - Server errors (5xx)
   * 
   * Does NOT retry:
   * - Client errors (4xx) including rate limit errors (429)
   */
  private retryWithBackoff<T>() {
    return (source: Observable<T>): Observable<T> => {
      return source.pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            // Don't retry client errors (4xx) - includes 429 rate limits
            if (error.status >= 400 && error.status < 500) {
              return throwError(() => error);
            }
            
            // Calculate exponential backoff delay
            const delayMs = this.retryDelay * Math.pow(2, retryCount - 1);
            
            console.warn(
              `API request failed. Retry attempt ${retryCount}/${this.maxRetries} after ${delayMs}ms`,
              error
            );
            
            return timer(delayMs);
          }
        })
      );
    };
  }

  /**
   * Transform HTTP errors into standardized ApiError format
   * 
   * Handles:
   * - Network errors (status 0)
   * - Rate limit errors (429)
   * - Server errors (5xx)
   * - Client errors (4xx)
   * - Unknown errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      apiError = {
        message: `Network error: ${error.error.message}`,
        statusCode: 0,
        error: 'Network Error'
      };
    } else if (error.status === 429) {
      // Rate limit exceeded
      apiError = {
        message: 'Too many requests. Please wait a moment and try again.',
        statusCode: 429,
        error: 'Rate Limit Exceeded'
      };
    } else if (error.status === 0) {
      // Network error (no response from server)
      apiError = {
        message: 'Unable to connect to the server. Please check your internet connection.',
        statusCode: 0,
        error: 'Connection Error'
      };
    } else {
      // Server-side error
      apiError = {
        message: error.error?.message || `Server error: ${error.message}`,
        statusCode: error.status,
        error: error.statusText || 'Server Error'
      };
    }

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  }
}
