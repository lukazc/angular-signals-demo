import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BeerStore } from './beer.store';
import { BeerApiService } from '../services/beer-api.service';
import { FavoritesService } from '../services/favorites.service';
import { Beer, FilterMode, SortConfig } from '../models/beer.model';
import { of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

describe('BeerStore', () => {
  let store: BeerStore;
  let apiService: BeerApiService;
  let favoritesService: FavoritesService;
  let httpTestingController: HttpTestingController;
  
  /**
   * Helper to flush all pending HTTP requests with mock data
   * Use this in tests where HTTP behavior is not the focus
   */
  const flushPendingRequests = () => {
    const pending = (httpTestingController as any).match(() => true);
    pending.forEach((req: any) => {
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });
    });
  };

  // Mock beer data
  const mockBeers: Beer[] = [
    {
      id: 1,
      name: 'Buzz',
      tagline: 'A Real Bitter Experience',
      description: 'A light, crisp and bitter IPA',
      image_url: 'https://images.punkapi.com/v2/1.png',
      abv: 4.5,
      ibu: 60,
      target_fg: 1010,
      target_og: 1044,
      ebc: 20,
      srm: 10,
      ph: 4.4,
      attenuation_level: 75,
      volume: { value: 20, unit: 'litres' },
      boil_volume: { value: 25, unit: 'litres' },
      method: {
        mash_temp: [{ temp: { value: 64, unit: 'celsius' }, duration: 75 }],
        fermentation: { temp: { value: 19, unit: 'celsius' } },
        twist: null
      },
      ingredients: {
        malt: [{ name: 'Maris Otter', amount: { value: 3.3, unit: 'kilograms' } }],
        hops: [{ name: 'Fuggles', amount: { value: 25, unit: 'grams' }, add: 'start', attribute: 'bitter' }],
        yeast: 'Wyeast 1056 - American Ale™'
      },
      food_pairing: ['Spicy chicken', 'Buffalo wings'],
      brewers_tips: 'Keep the IBU high',
      contributed_by: 'Sam Mason <samjbmason>',
      first_brewed: '09/2007'
    },
    {
      id: 2,
      name: 'Trashy Blonde',
      tagline: 'You Know You Shouldnt',
      description: 'A light, refreshing blonde ale',
      image_url: 'https://images.punkapi.com/v2/2.png',
      abv: 4.1,
      ibu: 41.5,
      target_fg: 1010,
      target_og: 1044,
      ebc: 15,
      srm: 7.5,
      ph: 4.4,
      attenuation_level: 77,
      volume: { value: 20, unit: 'litres' },
      boil_volume: { value: 25, unit: 'litres' },
      method: {
        mash_temp: [{ temp: { value: 69, unit: 'celsius' }, duration: null }],
        fermentation: { temp: { value: 18, unit: 'celsius' } },
        twist: null
      },
      ingredients: {
        malt: [{ name: 'Maris Otter', amount: { value: 3.25, unit: 'kilograms' } }],
        hops: [{ name: 'Amarillo', amount: { value: 13.8, unit: 'grams' }, add: 'start', attribute: 'bitter' }],
        yeast: 'Wyeast 1056 - American Ale™'
      },
      food_pairing: ['Grilled chicken', 'Caesar salad'],
      brewers_tips: 'Keep it light',
      contributed_by: 'Sam Mason <samjbmason>',
      first_brewed: '04/2008'
    },
    {
      id: 3,
      name: 'Punk IPA',
      tagline: 'Post Modern Classic',
      description: 'Layered with new world hops',
      image_url: 'https://images.punkapi.com/v2/3.png',
      abv: 5.6,
      ibu: 60,
      target_fg: 1010,
      target_og: 1056,
      ebc: 17,
      srm: 8.5,
      ph: 4.4,
      attenuation_level: 82,
      volume: { value: 20, unit: 'litres' },
      boil_volume: { value: 25, unit: 'litres' },
      method: {
        mash_temp: [{ temp: { value: 65, unit: 'celsius' }, duration: 75 }],
        fermentation: { temp: { value: 19, unit: 'celsius' } },
        twist: null
      },
      ingredients: {
        malt: [{ name: 'Maris Otter', amount: { value: 5.3, unit: 'kilograms' } }],
        hops: [{ name: 'Cascade', amount: { value: 15, unit: 'grams' }, add: 'start', attribute: 'bitter' }],
        yeast: 'Wyeast 1056 - American Ale™'
      },
      food_pairing: ['Spicy carne asada', 'Shredded chicken'],
      brewers_tips: 'Dry hop for extra aroma',
      contributed_by: 'Sam Mason <samjbmason>',
      first_brewed: '04/2007'
    }
  ];

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        BeerStore,
        BeerApiService,
        FavoritesService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    store = TestBed.inject(BeerStore);
    apiService = TestBed.inject(BeerApiService);
    favoritesService = TestBed.inject(FavoritesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  describe('Initialization', () => {
    it('should create store', () => {
      expect(store).toBeTruthy();
    });

    it('should start with default state', () => {
      expect(store.beers()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.currentPage()).toBe(1);
      expect(store.filterMode()).toBe('all');
      expect(store.searchTerm()).toBe('');
      expect(store.abvRange()).toEqual({ min: null, max: null });
      expect(store.sortConfig()).toEqual({ by: 'name', direction: 'asc' });
    });
  });

  describe('loadBeers()', () => {
    it('should load beers from API in all mode', async () => {
      const loadPromise = store.loadBeers();

      const req = httpTestingController.expectOne((req) => 
        req.url.includes('/beers') && req.method === 'GET'
      );
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });

      await loadPromise;

      expect(store.beers()).toEqual(mockBeers);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should set loading state during API call', async () => {
      expect(store.loading()).toBe(false);

      const loadPromise = store.loadBeers();
      expect(store.loading()).toBe(true);

      const req = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });

      await loadPromise;
      expect(store.loading()).toBe(false);
    });

    it('should not call API in favorites mode', async () => {
      store.setFilterMode('favorites');

      await store.loadBeers();

      httpTestingController.expectNone((req) => req.url.includes('/beers'));
    });

    it('should handle API errors', async () => {
      jasmine.clock().install();
      
      const loadPromise = store.loadBeers();

      // First request fails
      const req1 = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req1.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
      
      // Fast-forward through retry delays (1s, 2s, 4s = 7000ms total)
      jasmine.clock().tick(1000);
      const req2 = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req2.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
      
      jasmine.clock().tick(2000);
      const req3 = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req3.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
      
      jasmine.clock().tick(4000);
      const req4 = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req4.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

      // Wait for promise to resolve (it always resolves, never rejects)
      await loadPromise;

      expect(store.error()).toBeTruthy();
      expect(store.loading()).toBe(false);
      
      jasmine.clock().uninstall();
    });

    it('should pass search params to API', async () => {
      // Set filters directly on signals to avoid triggering multiple HTTP calls
      store.searchTerm.set('ipa');
      store.abvRange.set({ min: 5, max: 7 });

      // Now explicitly call loadBeers() - this will be the only HTTP request
      const loadPromise = store.loadBeers();

      const req = httpTestingController.expectOne((req) => {
        const url = req.url;
        const params = req.params;
        return url.includes('/beers') && 
               params.get('beer_name') === 'ipa' &&
               params.get('abv_gt') === '5' &&
               params.get('abv_lt') === '7';
      });
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });

      await loadPromise;
    });

    it('should pass pagination params to API', async () => {
      store.loadNextPage();

      const req = httpTestingController.expectOne((req) => {
        const params = req.params;
        return req.url.includes('/beers') && 
               params.get('page') === '2' &&
               params.get('per_page') === '25';
      });
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });

      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  describe('Filter Mode', () => {
    it('should switch to favorites mode', () => {
      store.setFilterMode('favorites');

      expect(store.filterMode()).toBe('favorites');
    });

    it('should load API data when switching to all mode', async () => {
      store.setFilterMode('favorites');
      store.setFilterMode('all');

      const req = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(store.beers()).toEqual(mockBeers);
    });
  });

  describe('Computed Signals - sourceBeers', () => {
    it('should return API beers in all mode', async () => {
      const loadPromise = store.loadBeers();

      const req = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });

      await loadPromise;

      expect(store.sourceBeers()).toEqual(mockBeers);
    });

    it('should return favorites in favorites mode', () => {
      favoritesService.addFavorite(mockBeers[0]);
      favoritesService.addFavorite(mockBeers[1]);

      store.setFilterMode('favorites');

      expect(store.sourceBeers()).toEqual([mockBeers[0], mockBeers[1]]);
    });

    it('should switch data source when mode changes', async () => {
      // Add favorites
      favoritesService.addFavorite(mockBeers[0]);

      // Load API data
      const loadPromise = store.loadBeers();
      const req = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });
      await loadPromise;

      // Should show API beers
      expect(store.sourceBeers()).toEqual(mockBeers);

      // Switch to favorites
      store.setFilterMode('favorites');

      // Should show only favorites
      expect(store.sourceBeers()).toEqual([mockBeers[0]]);
    });
  });

  describe('Computed Signals - filteredBeers', () => {
    beforeEach(async () => {
      const loadPromise = store.loadBeers();
      const req = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });
      await loadPromise;
      
      // Spy on loadBeers to prevent additional HTTP calls
      // These tests focus on computed signal logic, not HTTP behavior
      spyOn(store, 'loadBeers');
    });

    it('should filter by search term', () => {
      store.searchTerm.set('punk');

      const filtered = store.filteredBeers();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Punk IPA');
    });

    it('should filter by ABV min', () => {
      store.abvRange.set({ min: 5, max: null });

      const filtered = store.filteredBeers();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Punk IPA');
    });

    it('should filter by ABV max', () => {
      store.abvRange.set({ min: null, max: 4.5 });

      const filtered = store.filteredBeers();
      expect(filtered.length).toBe(2);
      expect(filtered.map(b => b.name)).toContain('Buzz');
      expect(filtered.map(b => b.name)).toContain('Trashy Blonde');
    });

    it('should filter by ABV range', () => {
      store.abvRange.set({ min: 4.5, max: 5.0 });

      const filtered = store.filteredBeers();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Buzz');
    });

    it('should combine search and ABV filters', () => {
      store.searchTerm.set('buzz');
      store.abvRange.set({ min: 4, max: 5 });

      const filtered = store.filteredBeers();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Buzz');
    });

    it('should filter case-insensitively', () => {
      store.searchTerm.set('PUNK');

      const filtered = store.filteredBeers();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Punk IPA');
    });

    it('should return all beers when no filters', () => {
      const filtered = store.filteredBeers();
      expect(filtered).toEqual(mockBeers);
    });
  });

  describe('Computed Signals - sortedBeers', () => {
    beforeEach(async () => {
      const loadPromise = store.loadBeers();
      const req = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });
      await loadPromise;
    });

    it('should sort by name ascending (default)', () => {
      const sorted = store.sortedBeers();
      expect(sorted[0].name).toBe('Buzz');
      expect(sorted[1].name).toBe('Punk IPA');
      expect(sorted[2].name).toBe('Trashy Blonde');
    });

    it('should sort by name descending', () => {
      store.setSortConfig({ by: 'name', direction: 'desc' });

      const sorted = store.sortedBeers();
      expect(sorted[0].name).toBe('Trashy Blonde');
      expect(sorted[1].name).toBe('Punk IPA');
      expect(sorted[2].name).toBe('Buzz');
    });

    it('should sort by ABV ascending', () => {
      store.setSortConfig({ by: 'abv', direction: 'asc' });

      const sorted = store.sortedBeers();
      expect(sorted[0].abv).toBe(4.1);
      expect(sorted[1].abv).toBe(4.5);
      expect(sorted[2].abv).toBe(5.6);
    });

    it('should sort by ABV descending', () => {
      store.setSortConfig({ by: 'abv', direction: 'desc' });

      const sorted = store.sortedBeers();
      expect(sorted[0].abv).toBe(5.6);
      expect(sorted[1].abv).toBe(4.5);
      expect(sorted[2].abv).toBe(4.1);
    });

    it('should handle null ABV values', async () => {
      const beersWithNull = [
        ...mockBeers,
        { ...mockBeers[0], id: 4, abv: null }
      ];

      store.beers.set(beersWithNull);
      store.setSortConfig({ by: 'abv', direction: 'asc' });

      const sorted = store.sortedBeers();
      expect(sorted[sorted.length - 1].abv).toBeNull(); // Nulls at end
    });
  });

  describe('Computed Signals - displayedBeers', () => {
    it('should apply filters and sorting', async () => {
      const loadPromise = store.loadBeers();
      const req = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });
      await loadPromise;

      // Spy on loadBeers to prevent HTTP call from setSearchTerm
      spyOn(store, 'loadBeers');
      
      store.searchTerm.set('blonde');
      store.setSortConfig({ by: 'name', direction: 'asc' });

      const displayed = store.displayedBeers();
      expect(displayed.length).toBe(1);
      expect(displayed[0].name).toBe('Trashy Blonde');
    });
  });

  describe('Computed Signals - isEmpty and emptyMessage', () => {
    it('should be empty when no beers', () => {
      expect(store.isEmpty()).toBe(true);
    });

    it('should not be empty when beers exist', async () => {
      const loadPromise = store.loadBeers();
      const req = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });
      await loadPromise;

      expect(store.isEmpty()).toBe(false);
    });

    it('should show error message when API fails', async () => {
      jasmine.clock().install();
      
      const loadPromise = store.loadBeers();
      
      // Handle all retry attempts (initial + 3 retries = 4 total requests)
      const req1 = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req1.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
      
      jasmine.clock().tick(1000);
      const req2 = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req2.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
      
      jasmine.clock().tick(2000);
      const req3 = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req3.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
      
      jasmine.clock().tick(4000);
      const req4 = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req4.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
      
      await loadPromise;

      expect(store.error()).toBeTruthy();
      expect(store.emptyMessage()).toBe('Failed to load beers. Please try again.');
      
      jasmine.clock().uninstall();
    });

    it('should show no results message in all mode with filters', async () => {
      const loadPromise = store.loadBeers();
      const req = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });
      await loadPromise;

      // Spy on loadBeers to prevent HTTP call
      spyOn(store, 'loadBeers');
      
      store.searchTerm.set('nonexistent');

      expect(store.isEmpty()).toBe(true);
      expect(store.emptyMessage()).toBe('No beers match your filters. Try adjusting your search or ABV range.');
    });

    it('should show no favorites message in favorites mode', () => {
      store.setFilterMode('favorites');

      expect(store.isEmpty()).toBe(true);
      expect(store.emptyMessage()).toBe('No favorites yet. Start adding beers to your favorites!');
    });

    it('should show no matching favorites message with filters', () => {
      favoritesService.addFavorite(mockBeers[0]);
      store.setFilterMode('favorites');
      
      // In favorites mode, setSearchTerm doesn't trigger HTTP
      store.searchTerm.set('nonexistent');

      expect(store.isEmpty()).toBe(true);
      expect(store.emptyMessage()).toBe('No favorites match your filters. Try adjusting your search or ABV range.');
    });
  });

  describe('setSearchTerm()', () => {
    it('should update search term signal', async () => {
      store.setSearchTerm('ipa');

      expect(store.searchTerm()).toBe('ipa');
      
      // Flush the HTTP request triggered by setSearchTerm
      flushPendingRequests();
      await new Promise(resolve => queueMicrotask(() => resolve(undefined)));
    });

    it('should reload API in all mode', async () => {
      store.setSearchTerm('ipa');

      const req = httpTestingController.expectOne((req) => 
        req.url.includes('/beers') && req.params.get('beer_name') === 'ipa'
      );
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });

      await new Promise(resolve => queueMicrotask(() => resolve(undefined)));
    });

    it('should reset to page 1 when searching', async () => {
      store.currentPage.set(3);

      store.setSearchTerm('ipa');

      expect(store.currentPage()).toBe(1);
      
      // Flush the HTTP request triggered by setSearchTerm
      flushPendingRequests();
      await new Promise(resolve => queueMicrotask(() => resolve(undefined)));
    });

    it('should not call API in favorites mode', () => {
      store.setFilterMode('favorites');

      store.setSearchTerm('ipa');

      httpTestingController.expectNone((req) => req.url.includes('/beers'));
    });
  });

  describe('setAbvRange()', () => {
    it('should update ABV range signal', async () => {
      store.setAbvRange({ min: 4, max: 6 });

      expect(store.abvRange()).toEqual({ min: 4, max: 6 });
      
      // Flush the HTTP request triggered by setAbvRange
      flushPendingRequests();
      await new Promise(resolve => queueMicrotask(() => resolve(undefined)));
    });

    it('should reload API in all mode', async () => {
      store.setAbvRange({ min: 5, max: 7 });

      const req = httpTestingController.expectOne((req) => 
        req.url.includes('/beers') && 
        req.params.get('abv_gt') === '5' &&
        req.params.get('abv_lt') === '7'
      );
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });

      await new Promise(resolve => queueMicrotask(() => resolve(undefined)));
    });

    it('should reset to page 1 when filtering by ABV', async () => {
      store.currentPage.set(3);

      store.setAbvRange({ min: 5, max: 7 });

      expect(store.currentPage()).toBe(1);
      
      // Flush the HTTP request triggered by setAbvRange
      flushPendingRequests();
      await new Promise(resolve => queueMicrotask(() => resolve(undefined)));
    });
  });

  describe('setSortConfig()', () => {
    it('should update sort config signal', () => {
      store.setSortConfig({ by: 'abv', direction: 'desc' });

      expect(store.sortConfig()).toEqual({ by: 'abv', direction: 'desc' });
    });

    it('should not trigger API call (client-side sort)', () => {
      store.setSortConfig({ by: 'abv', direction: 'desc' });

      httpTestingController.expectNone((req) => req.url.includes('/beers'));
    });
  });

  describe('toggleFavorite() and isFavorite()', () => {
    it('should delegate to favorites service', () => {
      spyOn(favoritesService, 'toggleFavorite');

      store.toggleFavorite(mockBeers[0]);

      expect(favoritesService.toggleFavorite).toHaveBeenCalledWith(mockBeers[0]);
    });

    it('should check favorite status', () => {
      favoritesService.addFavorite(mockBeers[0]);

      expect(store.isFavorite(1)).toBe(true);
      expect(store.isFavorite(2)).toBe(false);
    });
  });

  describe('resetFilters()', () => {
    it('should reset all filters to defaults', async () => {
      // Set filters directly on signals to avoid multiple HTTP calls
      store.searchTerm.set('ipa');
      store.abvRange.set({ min: 5, max: 7 });
      store.setSortConfig({ by: 'abv', direction: 'desc' });
      store.currentPage.set(3);

      store.resetFilters();

      expect(store.searchTerm()).toBe('');
      expect(store.abvRange()).toEqual({ min: null, max: null });
      expect(store.sortConfig()).toEqual({ by: 'name', direction: 'asc' });
      expect(store.currentPage()).toBe(1);
      
      // Flush the HTTP request from resetFilters
      flushPendingRequests();
      await new Promise(resolve => queueMicrotask(() => resolve(undefined)));
    });

    it('should reload API in all mode', async () => {
      // Set filter directly on signal to avoid HTTP call
      store.searchTerm.set('ipa');

      store.resetFilters();

      const req = httpTestingController.expectOne((req) => req.url.includes('/beers'));
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });
      await new Promise(resolve => queueMicrotask(() => resolve(undefined)));
    });
  });

  describe('Pagination', () => {
    it('should load next page', async () => {
      store.loadNextPage();

      expect(store.currentPage()).toBe(2);

      const req = httpTestingController.expectOne((req) => 
        req.url.includes('/beers') && req.params.get('page') === '2'
      );
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should load previous page', async () => {
      store.currentPage.set(3);

      store.loadPreviousPage();

      expect(store.currentPage()).toBe(2);

      const req = httpTestingController.expectOne((req) => 
        req.url.includes('/beers') && req.params.get('page') === '2'
      );
      req.flush(mockBeers, { headers: { 'X-RateLimit-Remaining': '3599' } });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should not go below page 1', () => {
      store.loadPreviousPage();

      expect(store.currentPage()).toBe(1);
      httpTestingController.expectNone((req) => req.url.includes('/beers'));
    });

    it('should not paginate in favorites mode', () => {
      spyOn(console, 'warn');
      store.setFilterMode('favorites');

      store.loadNextPage();

      expect(console.warn).toHaveBeenCalledWith('Pagination not available in favorites mode');
      httpTestingController.expectNone((req) => req.url.includes('/beers'));
    });
  });
});
