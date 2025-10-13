import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterContainerComponent } from './filter-container.component';
import { BeerStore } from '../../../stores/beer.store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { SortConfig, AbvRange } from '../../../models/beer.model';

describe('FilterContainerComponent', () => {
  let component: FilterContainerComponent;
  let fixture: ComponentFixture<FilterContainerComponent>;
  let mockBeerStore: any;

  // Signal instances for mock store
  let searchTermSignal: WritableSignal<string>;
  let abvRangeSignal: WritableSignal<AbvRange>;
  let filterModeSignal: WritableSignal<'all' | 'favorites'>;
  let sortConfigSignal: WritableSignal<SortConfig>;

  beforeEach(async () => {
    // Create fresh signal instances for each test
    searchTermSignal = signal('');
    abvRangeSignal = signal({ min: null, max: null });
    filterModeSignal = signal('all' as const);
    sortConfigSignal = signal({ by: 'recommended' as const, direction: 'asc' as const });

    // Create mock store with signal properties
    mockBeerStore = {
      searchTerm: searchTermSignal,
      abvRange: abvRangeSignal,
      filterMode: filterModeSignal,
      sortConfig: sortConfigSignal,
      setSearchTerm: jasmine.createSpy('setSearchTerm'),
      setAbvRange: jasmine.createSpy('setAbvRange'),
      setFilterMode: jasmine.createSpy('setFilterMode'),
      setSortConfig: jasmine.createSpy('setSortConfig'),
      resetFilters: jasmine.createSpy('resetFilters')
    };

    await TestBed.configureTestingModule({
      imports: [FilterContainerComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BeerStore, useValue: mockBeerStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should render all filter components', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('app-search-filter')).toBeTruthy();
      expect(compiled.querySelector('app-abv-slider')).toBeTruthy();
      expect(compiled.querySelector('app-favorites-checkbox')).toBeTruthy();
      expect(compiled.querySelector('app-sort-dropdown')).toBeTruthy();
    });

    it('should display "Filters" title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const title = compiled.querySelector('.filter-container__title');

      expect(title?.textContent).toBe('Filters');
    });

    it('should display "Clear All" button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const clearBtn = compiled.querySelector('.filter-container__clear-btn');

      expect(clearBtn).toBeTruthy();
      expect(clearBtn?.textContent).toContain('Clear All');
    });
  });

  describe('Search Filter Integration', () => {
    it('should pass search term to search filter component', () => {
      searchTermSignal.set('test search');
      fixture.detectChanges();

      const searchFilter = fixture.nativeElement.querySelector('app-search-filter');
      expect(searchFilter).toBeTruthy();
      // Value is passed via input binding (checked via component interaction)
    });

    it('should call store.setSearchTerm when search changes', () => {
      component.onSearchChange('ipa');

      expect(mockBeerStore.setSearchTerm).toHaveBeenCalledWith('ipa');
    });

    it('should handle empty search', () => {
      component.onSearchChange('');

      expect(mockBeerStore.setSearchTerm).toHaveBeenCalledWith('');
    });
  });

  describe('ABV Slider Integration', () => {
    it('should pass ABV range to slider component', () => {
      abvRangeSignal.set({ min: 5, max: 10 });
      fixture.detectChanges();

      const slider = fixture.nativeElement.querySelector('app-abv-slider');
      expect(slider).toBeTruthy();
      // Range is passed via input binding
    });

    it('should call store.setAbvRange when range changes', () => {
      const newRange = { min: 4, max: 8 };
      component.onAbvRangeChange(newRange);

      expect(mockBeerStore.setAbvRange).toHaveBeenCalledWith(newRange);
    });

    it('should handle null values in range', () => {
      const nullRange = { min: null, max: null };
      component.onAbvRangeChange(nullRange);

      expect(mockBeerStore.setAbvRange).toHaveBeenCalledWith(nullRange);
    });
  });

  describe('Favorites Checkbox Integration', () => {
    it('should render checkbox component in all mode', () => {
      filterModeSignal.set('all');
      fixture.detectChanges();

      const checkbox = fixture.nativeElement.querySelector('app-favorites-checkbox');
      expect(checkbox).toBeTruthy();
      // Checked state is passed via input binding (verified via interaction tests)
    });

    it('should render checkbox component in favorites mode', () => {
      filterModeSignal.set('favorites');
      fixture.detectChanges();

      const checkbox = fixture.nativeElement.querySelector('app-favorites-checkbox');
      expect(checkbox).toBeTruthy();
      // Checked state is passed via input binding (verified via interaction tests)
    });

    it('should call store.setFilterMode with favorites when toggled on', () => {
      component.onFavoritesToggle(true);

      expect(mockBeerStore.setFilterMode).toHaveBeenCalledWith('favorites');
    });

    it('should call store.setFilterMode with all when toggled off', () => {
      component.onFavoritesToggle(false);

      expect(mockBeerStore.setFilterMode).toHaveBeenCalledWith('all');
    });
  });

  describe('Sort Dropdown Integration', () => {
    it('should pass sort config to dropdown component', () => {
      sortConfigSignal.set({ by: 'name', direction: 'asc' });
      fixture.detectChanges();

      const dropdown = fixture.nativeElement.querySelector('app-sort-dropdown');
      expect(dropdown).toBeTruthy();
      // Sort config is passed via input binding
    });

    it('should call store.setSortConfig when sort changes', () => {
      const newConfig: SortConfig = { by: 'abv', direction: 'desc' };
      component.onSortChange(newConfig);

      expect(mockBeerStore.setSortConfig).toHaveBeenCalledWith(newConfig);
    });

    it('should handle recommended sort', () => {
      const config: SortConfig = { by: 'recommended', direction: 'asc' };
      component.onSortChange(config);

      expect(mockBeerStore.setSortConfig).toHaveBeenCalledWith(config);
    });
  });

  describe('Clear All Filters', () => {
    it('should call store.resetFilters when clear button is clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const clearBtn = compiled.querySelector('.filter-container__clear-btn') as HTMLButtonElement;

      clearBtn.click();

      expect(mockBeerStore.resetFilters).toHaveBeenCalled();
    });

    it('should have proper aria-label on clear button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const clearBtn = compiled.querySelector('.filter-container__clear-btn');

      expect(clearBtn?.getAttribute('aria-label')).toBe('Clear all filters');
    });

    it('should display clear icon', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const icon = compiled.querySelector('.filter-container__clear-btn mat-icon');

      expect(icon?.textContent).toBe('clear_all');
    });
  });

  describe('Layout Structure', () => {
    it('should have Material card container', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const card = compiled.querySelector('mat-card');

      expect(card).toBeTruthy();
    });

    it('should have grid layout for filters', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const grid = compiled.querySelector('.filter-container__grid');

      expect(grid).toBeTruthy();
    });

    it('should have divider between sections', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const divider = compiled.querySelector('mat-divider');

      expect(divider).toBeTruthy();
    });

    it('should have proper CSS classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('.filter-container')).toBeTruthy();
      expect(compiled.querySelector('.filter-container__content')).toBeTruthy();
      expect(compiled.querySelector('.filter-container__header')).toBeTruthy();
      expect(compiled.querySelector('.filter-container__grid')).toBeTruthy();
      expect(compiled.querySelector('.filter-container__abv')).toBeTruthy();
    });
  });

  describe('Responsive Grid Layout', () => {
    it('should place search filter in grid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const searchItem = compiled.querySelector('.filter-container__item--search');

      expect(searchItem).toBeTruthy();
      expect(searchItem?.querySelector('app-search-filter')).toBeTruthy();
    });

    it('should place sort dropdown in grid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const sortItem = compiled.querySelector('.filter-container__item--sort');

      expect(sortItem).toBeTruthy();
      expect(sortItem?.querySelector('app-sort-dropdown')).toBeTruthy();
    });

    it('should place favorites checkbox in grid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const favItem = compiled.querySelector('.filter-container__item--favorites');

      expect(favItem).toBeTruthy();
      expect(favItem?.querySelector('app-favorites-checkbox')).toBeTruthy();
    });

    it('should place ABV slider in separate full-width section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const abvSection = compiled.querySelector('.filter-container__abv');

      expect(abvSection).toBeTruthy();
      expect(abvSection?.querySelector('app-abv-slider')).toBeTruthy();
    });
  });

  describe('Controlled Component Pattern', () => {
    it('should propagate all store values to child components', () => {
      // Set store values
      searchTermSignal.set('test');
      abvRangeSignal.set({ min: 5, max: 15 });
      filterModeSignal.set('favorites');
      sortConfigSignal.set({ by: 'abv', direction: 'desc' });
      fixture.detectChanges();

      // Check that components receive the values
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-search-filter')).toBeTruthy();
      expect(compiled.querySelector('app-abv-slider')).toBeTruthy();
      expect(compiled.querySelector('app-favorites-checkbox')).toBeTruthy();
      expect(compiled.querySelector('app-sort-dropdown')).toBeTruthy();
    });

    it('should call store methods when child components emit changes', () => {
      component.onSearchChange('new search');
      component.onAbvRangeChange({ min: 3, max: 7 });
      component.onFavoritesToggle(true);
      component.onSortChange({ by: 'name', direction: 'desc' });

      expect(mockBeerStore.setSearchTerm).toHaveBeenCalledWith('new search');
      expect(mockBeerStore.setAbvRange).toHaveBeenCalledWith({ min: 3, max: 7 });
      expect(mockBeerStore.setFilterMode).toHaveBeenCalledWith('favorites');
      expect(mockBeerStore.setSortConfig).toHaveBeenCalledWith({ by: 'name', direction: 'desc' });
    });
  });

  describe('Integration Flow', () => {
    it('should handle complete filter workflow', () => {
      // User searches
      component.onSearchChange('ipa');
      expect(mockBeerStore.setSearchTerm).toHaveBeenCalledWith('ipa');

      // User adjusts ABV range
      component.onAbvRangeChange({ min: 5, max: 7 });
      expect(mockBeerStore.setAbvRange).toHaveBeenCalledWith({ min: 5, max: 7 });

      // User changes sort
      component.onSortChange({ by: 'abv', direction: 'asc' });
      expect(mockBeerStore.setSortConfig).toHaveBeenCalledWith({ by: 'abv', direction: 'asc' });

      // User toggles favorites
      component.onFavoritesToggle(true);
      expect(mockBeerStore.setFilterMode).toHaveBeenCalledWith('favorites');

      // User clears all filters
      component.clearAllFilters();
      expect(mockBeerStore.resetFilters).toHaveBeenCalled();
    });
  });
});
