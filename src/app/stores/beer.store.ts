import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { 
  Beer, 
  FilterMode, 
  SortConfig, 
  AbvRange, 
  BeerSearchParams 
} from '../models/beer.model';
import { BeerApiService } from '../services/beer-api.service';
import { FavoritesService } from '../services/favorites.service';

/**
 * Beer Store
 * 
 * Central state management for the Beer App.
 * Implements dual data source architecture:
 * - 'all' mode: Fetches from API with pagination
 * - 'favorites' mode: Uses sessionStorage data (no API calls)
 * 
 * Features:
 * - Signal-based reactive state
 * - Computed signals for derived state
 * - Client-side filtering and sorting
 * - Automatic empty state messages
 * - Seamless switching between API and favorites
 * - **Automatic request cancellation** (switchMap pattern)
 * - **Race condition prevention** for overlapping API calls
 * 
 * Request Cancellation Architecture:
 * - Uses RxJS switchMap to automatically cancel pending requests
 * - When new parameters arrive, previous request is cancelled (including retries!)
 * - Prevents stale data from completing after newer requests
 * - Works seamlessly with API service's retry logic
 * 
 * Data Flow:
 * 1. User changes filter → loadTrigger$ emits new params
 * 2. switchMap cancels previous request (even mid-retry)
 * 3. New request starts with updated params
 * 4. Only latest request can complete and update state
 * 5. sourceBeers: Switch between API data and favorites based on filterMode
 * 6. filteredBeers: Apply searchTerm and abvRange filters
 * 7. sortedBeers: Apply sort configuration
 * 8. displayedBeers: Final output for UI
 * 
 * @example
 * // In a component:
 * export class BeerListComponent {
 *   store = inject(BeerStore);
 *   
 *   beers = this.store.displayedBeers;
 *   loading = this.store.loading;
 *   isEmpty = this.store.isEmpty;
 *   emptyMessage = this.store.emptyMessage;
 *   
 *   ngOnInit(): void {
 *     this.store.loadBeers(); // Load initial data
 *   }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class BeerStore {
  private readonly apiService = inject(BeerApiService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);
  
  /**
   * Subject to trigger API loads with automatic cancellation
   * Using switchMap ensures only the latest request completes
   */
  private readonly loadTrigger$ = new Subject<BeerSearchParams>();
  
  // ============================================================================
  // State Signals
  // ============================================================================
  
  /**
   * Beers from API (only populated when filterMode === 'all')
   */
  readonly beers = signal<Beer[]>([]);
  
  /**
   * Loading state (true during API calls)
   */
  readonly loading = signal<boolean>(false);
  
  /**
   * Error message from last API call
   */
  readonly error = signal<string | null>(null);
  
  /**
   * Current page for API pagination
   */
  readonly currentPage = signal<number>(1);
  
  /**
   * Filter mode: 'all' (API) or 'favorites' (sessionStorage)
   */
  readonly filterMode = signal<FilterMode>('all');
  
  /**
   * Search term for name filtering
   */
  readonly searchTerm = signal<string>('');
  
  /**
   * ABV range filter (allow null for no filter)
   */
  readonly abvRange = signal<{ min: number | null; max: number | null }>({ min: null, max: null });
  
  /**
   * Sort configuration (field + direction)
   * Default is 'recommended' (no sorting, API default order)
   */
  readonly sortConfig = signal<SortConfig>({ 
    by: 'recommended', 
    direction: 'asc' 
  });
  
  // ============================================================================
  // Constructor - Set up automatic request cancellation pipeline
  // ============================================================================
  
  constructor() {
    // Set up the switchMap pipeline for automatic request cancellation
    // This ensures only the latest request completes, preventing race conditions
    this.loadTrigger$.pipe(
      // Set loading state when request starts
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      
      // switchMap cancels previous HTTP request when new one arrives
      switchMap(params => 
        this.apiService.searchBeers(params).pipe(
          // Handle successful response
          tap(beers => {
            this.beers.set(beers);
            console.log(`Loaded ${beers.length} beers (page ${params.page || 1})`);
          }),
          // Handle errors for this specific request
          catchError(error => {
            const message = error.message || 'Failed to load beers';
            this.error.set(message);
            console.error('Failed to load beers:', error);
            // Return empty array to continue the stream
            return [];
          })
        )
      ),
      
      // Clear loading state when request completes (success or error)
      tap(() => this.loading.set(false)),
      
      // Cleanup on component destruction
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
  
  // ============================================================================
  // Computed Signals
  // ============================================================================
  
  /**
   * Source beers based on filter mode
   * - 'all': Use API data from beers()
   * - 'favorites': Use sessionStorage data from favoritesService
   */
  readonly sourceBeers = computed(() => {
    const mode = this.filterMode();
    if (mode === 'all') {
      return this.beers();
    } else {
      return this.favoritesService.getAllFavorites()();
    }
  });
  
  /**
   * Filtered beers (apply searchTerm and abvRange)
   * Client-side filtering always (API doesn't support favorites mode)
   */
  readonly filteredBeers = computed(() => {
    let result = this.sourceBeers();
    
    // Filter by search term (name)
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(beer => 
        beer.name.toLowerCase().includes(search)
      );
    }
    
    // Filter by ABV range
    const { min, max } = this.abvRange();
    if (min !== null) {
      result = result.filter(beer => 
        beer.abv !== null && beer.abv !== undefined && beer.abv >= min
      );
    }
    if (max !== null) {
      result = result.filter(beer => 
        beer.abv !== null && beer.abv !== undefined && beer.abv <= max
      );
    }
    
    return result;
  });
  
  /**
   * Sorted beers (apply sortConfig)
   * Client-side sorting always (API doesn't support it)
   * When by === 'recommended', returns natural API order (no sorting)
   */
  readonly sortedBeers = computed(() => {
    const beers = [...this.filteredBeers()];
    const { by, direction } = this.sortConfig();
    
    // 'recommended' means no sorting - return natural API order
    if (by === 'recommended') {
      return beers;
    }
    
    beers.sort((a, b) => {
      let valueA: string | number | null | undefined;
      let valueB: string | number | null | undefined;
      
      switch (by) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'abv':
          valueA = a.abv;
          valueB = b.abv;
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      
      // Handle null/undefined values (sort to end)
      if ((valueA === null || valueA === undefined) && (valueB === null || valueB === undefined)) return 0;
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;
      
      // Compare values
      let comparison = 0;
      if (valueA < valueB) comparison = -1;
      if (valueA > valueB) comparison = 1;
      
      // Apply direction
      return direction === 'asc' ? comparison : -comparison;
    });
    
    return beers;
  });
  
  /**
   * Final displayed beers (after all filters and sorting)
   */
  readonly displayedBeers = computed(() => this.sortedBeers());
  
  /**
   * True if there are no beers to display
   */
  readonly isEmpty = computed(() => this.displayedBeers().length === 0);
  
  /**
   * Empty state message (context-aware)
   */
  readonly emptyMessage = computed(() => {
    const mode = this.filterMode();
    const hasSearch = this.searchTerm().trim().length > 0;
    const hasAbvFilter = this.abvRange().min !== null || this.abvRange().max !== null;
    const hasAnyFilter = hasSearch || hasAbvFilter;
    
    if (mode === 'favorites') {
      if (this.favoritesService.getAllFavorites()().length === 0) {
        return 'No favorites yet. Start adding beers to your favorites!';
      }
      if (hasAnyFilter) {
        return 'No favorites match your filters. Try adjusting your search or ABV range.';
      }
      return 'No favorites to display.';
    } else {
      // 'all' mode
      if (this.error()) {
        return 'Failed to load beers. Please try again.';
      }
      if (hasAnyFilter) {
        return 'No beers match your filters. Try adjusting your search or ABV range.';
      }
      return 'No beers available.';
    }
  });

  /**
   * True if any filters are active (search, sort, abvRange, or favorites mode)
   */
  readonly hasActiveFilters = computed(() => {
    return this.searchTerm().trim().length > 0 ||
           this.abvRange().min !== null || this.abvRange().max !== null ||
           this.sortConfig().by !== 'recommended' ||
           this.filterMode() === 'favorites';
  });

  // ============================================================================
  // Actions
  // ============================================================================
  
  /**
   * Load beers from API
   * Only called when filterMode === 'all'
   * Honors current page, searchTerm, and abvRange
   * 
   * Uses switchMap pattern via loadTrigger$ for automatic request cancellation.
   * If called multiple times rapidly, only the latest request will complete.
   * 
   * Note: Favorites mode doesn't call API (uses sessionStorage)
   * This method triggers the load but doesn't await completion (reactive pattern)
   */
  loadBeers(): void {
    // Don't load from API when in favorites mode
    if (this.filterMode() === 'favorites') {
      console.log('In favorites mode - skipping API call');
      return;
    }
    
    // Build params from current state
    const abvMin = this.abvRange().min;
    const abvMax = this.abvRange().max;
    
    const params: BeerSearchParams = {
      page: this.currentPage(),
      per_page: 25,
      beer_name: this.searchTerm() || undefined,
      abv_gt: abvMin !== null ? abvMin : undefined,
      abv_lt: abvMax !== null ? abvMax : undefined,
    };
    
    // Trigger the load via Subject
    // switchMap will automatically cancel any pending request
    this.loadTrigger$.next(params);
  }
  
  /**
   * Set initial page from URL query parameter
   * Should be called only once during component initialization
   * Does not trigger API call (component will call loadBeers after)
   * 
   * @param page - Page number from URL (must be positive integer)
   */
  setInitialPage(page: number): void {
    if (page > 0 && Number.isInteger(page)) {
      this.currentPage.set(page);
      console.log(`Initialized to page ${page} from URL`);
    } else {
      console.warn(`Invalid page number: ${page}, defaulting to 1`);
      this.currentPage.set(1);
    }
  }
  
  /**
   * Set search term (filters beer names)
   * In 'all' mode: Triggers new API call
   * In 'favorites' mode: Applies client-side filter
   * 
   * @param term - Search term for beer names
   */
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
    
    // Reset to page 1 and reload when in 'all' mode
    if (this.filterMode() === 'all') {
      this.currentPage.set(1);
      this.loadBeers();
    }
    // In favorites mode, computed signals handle filtering automatically
  }
  
  /**
   * Set ABV range filter
   * In 'all' mode: Triggers new API call
   * In 'favorites' mode: Applies client-side filter
   * 
   * @param range - ABV min/max range
   */
  setAbvRange(range: AbvRange): void {
    this.abvRange.set(range);
    
    // Reset to page 1 and reload when in 'all' mode
    if (this.filterMode() === 'all') {
      this.currentPage.set(1);
      this.loadBeers();
    }
    // In favorites mode, computed signals handle filtering automatically
  }
  
  /**
   * Set sort configuration
   * Client-side sorting always (API doesn't support it)
   * 
   * @param config - Sort field and direction
   */
  setSortConfig(config: SortConfig): void {
    this.sortConfig.set(config);
    // Computed signals handle sorting automatically
  }
  
  /**
   * Set filter mode (switch between 'all' and 'favorites')
   * Automatically loads API data when switching to 'all'
   * 
   * @param mode - 'all' or 'favorites'
   */
  setFilterMode(mode: FilterMode): void {
    this.filterMode.set(mode);
    
    // Load beers from API when switching to 'all' mode
    if (mode === 'all') {
      this.loadBeers();
    }
    // When switching to 'favorites', computed signals use sessionStorage automatically
  }
  
  /**
   * Toggle a beer's favorite status
   * Works in both 'all' and 'favorites' modes
   * 
   * @param beer - Complete beer object to toggle
   */
  toggleFavorite(beer: Beer): void {
    this.favoritesService.toggleFavorite(beer);
  }
  
  /**
   * Check if a beer is favorited
   * 
   * @param beerId - Beer ID to check
   * @returns True if beer is in favorites
   */
  isFavorite(beerId: number): boolean {
    return this.favoritesService.isFavorite(beerId);
  }
  
  /**
   * Reset all filters to defaults
   * Clears search, ABV range, sort, and switches back to 'all' mode
   * Reloads data from API
   */
  resetFilters(): void {
    this.searchTerm.set('');
    this.abvRange.set({ min: null, max: null });
    this.sortConfig.set({ by: 'recommended', direction: 'asc' });
    this.filterMode.set('all');
    this.currentPage.set(1);
    
    // Load beers from API (now that we're in 'all' mode)
    this.loadBeers();
  }
}
