import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeerListPageComponent } from './beer-list-page.component';
import { BeerStore } from '../../stores/beer.store';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Beer } from '../../models/beer.model';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

describe('BeerListPageComponent', () => {
  let component: BeerListPageComponent;
  let fixture: ComponentFixture<BeerListPageComponent>;
  let mockBeerStore: any;
  let router: Router;

  // Signal instances for mock store
  let beersSignal: WritableSignal<Beer[]>;
  let displayedBeersSignal: WritableSignal<Beer[]>;
  let sourceBeersSignal: WritableSignal<Beer[]>;
  let loadingSignal: WritableSignal<boolean>;
  let errorSignal: WritableSignal<string | null>;
  let currentPageSignal: WritableSignal<number>;
  let filterModeSignal: WritableSignal<'all' | 'favorites'>;
  let isEmptySignal: WritableSignal<boolean>;
  let emptyMessageSignal: WritableSignal<string>;
  let searchTermSignal: WritableSignal<string>;
  let abvRangeSignal: WritableSignal<{ min: number | null; max: number | null }>;
  let sortConfigSignal: WritableSignal<{ by: 'recommended' | 'name' | 'abv'; direction: 'asc' | 'desc' }>;
  let hasActiveFiltersSignal: WritableSignal<boolean>;

  /**
   * Helper to create component with specific query params
   */
  const createComponentWithQueryParams = async (queryParams: Record<string, string> = {}) => {
    // Navigate to route with query params
    await router.navigate(['/beers'], { queryParams });
    
    // Create component
    fixture = TestBed.createComponent(BeerListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    // Create fresh signal instances for each test
    beersSignal = signal([]);
    displayedBeersSignal = signal([]);
    sourceBeersSignal = signal([]);
    loadingSignal = signal(false);
    errorSignal = signal(null);
    currentPageSignal = signal(1);
    filterModeSignal = signal('all' as const);
    isEmptySignal = signal(false);
    emptyMessageSignal = signal('');
    searchTermSignal = signal('');
    abvRangeSignal = signal({ min: null, max: null });
    sortConfigSignal = signal({ by: 'recommended' as const, direction: 'asc' as const });
    hasActiveFiltersSignal = signal(false);

    // Create mock store with signal properties
    mockBeerStore = {
      beers: beersSignal,
      displayedBeers: displayedBeersSignal,
      loading: loadingSignal,
      error: errorSignal,
      currentPage: currentPageSignal,
      filterMode: filterModeSignal,
      isEmpty: isEmptySignal,
      emptyMessage: emptyMessageSignal,
      searchTerm: searchTermSignal,
      abvRange: abvRangeSignal,
      sortConfig: sortConfigSignal,
      sourceBeers: sourceBeersSignal,
      hasActiveFilters: hasActiveFiltersSignal,
      loadBeers: jasmine.createSpy('loadBeers'),
      toggleFavorite: jasmine.createSpy('toggleFavorite'),
      isFavorite: jasmine.createSpy('isFavorite').and.returnValue(false),
      resetFilters: jasmine.createSpy('resetFilters'),
      setInitialPage: jasmine.createSpy('setInitialPage'),
    };

    await TestBed.configureTestingModule({
      imports: [BeerListPageComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'beers', component: BeerListPageComponent }
        ]),
        { provide: BeerStore, useValue: mockBeerStore }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    
    // Navigate to beers route before each test
    await router.navigate(['/beers']);

    fixture = TestBed.createComponent(BeerListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject BeerStore', () => {
    expect(component.store).toBe(mockBeerStore);
  });

  it('should display page header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('.beer-list-page__header');
    expect(header).toBeTruthy();
  });

  it('should display page logo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logo = compiled.querySelector('.beer-list-page__logo');
    expect(logo).toBeTruthy();
    expect(logo?.getAttribute('alt')).toBe('Beer Catalog Logo');
  });

  it('should display page subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitle = compiled.querySelector('.beer-list-page__subtitle');
    expect(subtitle?.textContent).toContain('Explore the world of craft beers');
  });

  it('should display beer list component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const beerList = compiled.querySelector('app-beer-list');
    expect(beerList).toBeTruthy();
  });

  it('should have container with max-width', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.beer-list-page__container');
    expect(container).toBeTruthy();
  });

//   it('should display footer', () => {
//     const compiled = fixture.nativeElement as HTMLElement;
//     const footer = compiled.querySelector('.beer-list-page__footer');
//     expect(footer).toBeTruthy();
//   });

//   it('should have link to Punk API in footer', () => {
//     const compiled = fixture.nativeElement as HTMLElement;
//     const link = compiled.querySelector('.beer-list-page__footer a') as HTMLAnchorElement;
//     expect(link).toBeTruthy();
//     expect(link.href).toContain('punkapi');
//   });

  describe('URL-Driven Pagination', () => {
    it('should read page 1 from URL on initial load', async () => {
      await createComponentWithQueryParams({ page: '1' });
      
      expect(mockBeerStore.setInitialPage).toHaveBeenCalledWith(1);
      expect(mockBeerStore.loadBeers).toHaveBeenCalled();
    });

    it('should read page 3 from URL on initial load', async () => {
      await createComponentWithQueryParams({ page: '3' });
      
      expect(mockBeerStore.setInitialPage).toHaveBeenCalledWith(3);
      expect(mockBeerStore.loadBeers).toHaveBeenCalled();
    });

    it('should default to page 1 when no query param present', async () => {
      await createComponentWithQueryParams();
      
      expect(mockBeerStore.setInitialPage).toHaveBeenCalledWith(1);
      expect(mockBeerStore.loadBeers).toHaveBeenCalled();
    });

    it('should default to page 1 for invalid page numbers', async () => {
      await createComponentWithQueryParams({ page: '-1' });
      
      // Component passes -1, but store validates and defaults to 1
      expect(mockBeerStore.setInitialPage).toHaveBeenCalledWith(-1);
      expect(mockBeerStore.loadBeers).toHaveBeenCalled();
    });

    it('should react to manual URL changes', async () => {
      // Start on page 1
      await createComponentWithQueryParams({ page: '1' });
      expect(mockBeerStore.setInitialPage).toHaveBeenCalledWith(1);
      
      // Reset spies
      mockBeerStore.setInitialPage.calls.reset();
      mockBeerStore.loadBeers.calls.reset();
      
      // Manually change URL to page 3
      await router.navigate(['/beers'], { queryParams: { page: '3' } });
      await fixture.whenStable();
      
      // Should update store and reload beers
      expect(mockBeerStore.setInitialPage).toHaveBeenCalledWith(3);
      expect(mockBeerStore.loadBeers).toHaveBeenCalled();
    });

    it('should handle navigation from page 2 to page 1', async () => {
      // Start on page 2
      await createComponentWithQueryParams({ page: '2' });
      mockBeerStore.setInitialPage.calls.reset();
      mockBeerStore.loadBeers.calls.reset();
      
      // Navigate to page 1
      await router.navigate(['/beers'], { queryParams: { page: '1' } });
      await fixture.whenStable();
      
      expect(mockBeerStore.setInitialPage).toHaveBeenCalledWith(1);
      expect(mockBeerStore.loadBeers).toHaveBeenCalled();
    });
  });
});
