import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeerListComponent } from './beer-list.component';
import { BeerStore } from '../../stores/beer.store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Beer } from '../../models/beer.model';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BeerDetailModalComponent } from '../beer-detail-modal/beer-detail-modal.component';
import { Router, provideRouter } from '@angular/router';

describe('BeerListComponent', () => {
  let component: BeerListComponent;
  let fixture: ComponentFixture<BeerListComponent>;
  let mockBeerStore: any;
  let mockDialog: MatDialog;
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

  const mockBeer: Beer = {
    id: 1,
    name: 'Punk IPA',
    tagline: 'Post Modern Classic',
    description: 'A bold IPA',
    image_url: 'https://images.punkapi.com/v2/1.png',
    abv: 5.6,
    ibu: 60,
    target_fg: 1010,
    target_og: 1056,
    ebc: 20,
    srm: 10,
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
      malt: [{ name: 'Maris Otter', amount: { value: 3.3, unit: 'kilograms' } }],
      hops: [{ name: 'Cascade', amount: { value: 15, unit: 'grams' }, add: 'start', attribute: 'bitter' }],
      yeast: 'Wyeast 1056 - American Ale™'
    },
    food_pairing: ['Spicy carne asada'],
    brewers_tips: 'Dry hop for extra aroma',
    contributed_by: 'Sam Mason <samjbmason>',
    first_brewed: '04/2007'
  };

  const mockBeers = [mockBeer];

  beforeEach(async () => {
    // Create fresh signal instances for each test
    beersSignal = signal(mockBeers);
    displayedBeersSignal = signal(mockBeers);
    sourceBeersSignal = signal(mockBeers);
    loadingSignal = signal(false);
    errorSignal = signal(null);
    currentPageSignal = signal(1);
    filterModeSignal = signal('all' as const);
    isEmptySignal = signal(false);
    emptyMessageSignal = signal('');
    searchTermSignal = signal('');
    abvRangeSignal = signal({ min: null, max: null });
    sortConfigSignal = signal({ by: 'recommended' as const, direction: 'asc' as const });

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
      setInitialPage: jasmine.createSpy('setInitialPage'),
      resetFilters: jasmine.createSpy('resetFilters'),
      loadBeers: jasmine.createSpy('loadBeers'),
      toggleFavorite: jasmine.createSpy('toggleFavorite'),
      isFavorite: jasmine.createSpy('isFavorite').and.returnValue(false)
    };

    await TestBed.configureTestingModule({
      imports: [BeerListComponent, NoopAnimationsModule, MatDialogModule],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'beers', component: BeerListComponent }]),
        { provide: BeerStore, useValue: mockBeerStore }
      ]
    }).compileComponents();

    // Get MatDialog and spy on it BEFORE creating component
    mockDialog = TestBed.inject(MatDialog);
    spyOn(mockDialog, 'open').and.returnValue({
      close: jasmine.createSpy('close'),
      afterClosed: () => ({ subscribe: () => {} }),
      id: 'mock-dialog-1'
    } as any);

    router = TestBed.inject(Router);
    await router.navigate(['/beers']);

    fixture = TestBed.createComponent(BeerListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should load beers on init from URL params', () => {
    fixture.detectChanges();
    
    // BeerListComponent now handles URL integration directly
    // It reads query params on init and calls loadBeers
    expect(mockBeerStore.loadBeers).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    loadingSignal.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingState = compiled.querySelector('.beer-list__loading');
    expect(loadingState).toBeTruthy();
  });

  it('should display error state', () => {
    errorSignal.set('Failed to load beers');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorState = compiled.querySelector('.beer-list__error');
    expect(errorState).toBeTruthy();
    expect(errorState?.textContent).toContain('Failed to load beers');
  });

  it('should call loadBeers when retry button is clicked', () => {
    errorSignal.set('Failed to load beers');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const retryButton = compiled.querySelector('.beer-list__retry-btn') as HTMLButtonElement;
    retryButton.click();

    expect(mockBeerStore.loadBeers).toHaveBeenCalled();
  });

  it('should display empty state when no beers are found', () => {
    displayedBeersSignal.set([]);
    isEmptySignal.set(true);
    emptyMessageSignal.set('No beers available.');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyState = compiled.querySelector('.beer-list__empty');
    expect(emptyState).toBeTruthy();
  });

  it('should display "No beers found" message in search mode', () => {
    displayedBeersSignal.set([]);
    isEmptySignal.set(true);
    searchTermSignal.set('nonexistent');
    emptyMessageSignal.set('No beers match your filters. Try adjusting your search or ABV range.');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyMessage = compiled.querySelector('.beer-list__empty-message');
    expect(emptyMessage?.textContent).toContain('No beers match your filters');
  });

  it('should display "No favorites yet" message in favorites mode', () => {
    displayedBeersSignal.set([]);
    isEmptySignal.set(true);
    filterModeSignal.set('favorites');
    emptyMessageSignal.set('No favorites yet. Start adding beers to your favorites!');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyMessage = compiled.querySelector('.beer-list__empty-message');
    expect(emptyMessage?.textContent).toContain('No favorites yet');
  });

  it('should display beer cards when beers are available', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-beer-card');
    expect(cards.length).toBe(1);
  });

  it('should pass correct beer to beer card', () => {
    fixture.detectChanges();

    const beerCard = fixture.debugElement.query(
      el => el.name === 'app-beer-card'
    );
    expect(beerCard.componentInstance.beer()).toEqual(mockBeer);
  });

  it('should pass isFavorite status to beer card', () => {
    (mockBeerStore.isFavorite as jasmine.Spy).and.returnValue(true);
    fixture.detectChanges();

    const beerCard = fixture.debugElement.query(
      el => el.name === 'app-beer-card'
    );
    expect(beerCard.componentInstance.isFavorite()).toBe(true);
  });

  it('should open detail modal when detailsClicked is emitted', () => {
    fixture.detectChanges();
    
    // Access the component's private dialog instance to spy on it
    const componentDialog = (component as any).dialog;
    const dialogSpy = spyOn(componentDialog, 'open').and.returnValue({
      close: jasmine.createSpy('close'),
      afterClosed: () => ({ subscribe: () => {} }),
      id: 'mock-dialog-1'
    } as any);

    component.onDetailsClick(mockBeer);

    expect(dialogSpy).toHaveBeenCalledWith(BeerDetailModalComponent, jasmine.objectContaining({
      data: { beer: mockBeer }
    }));
  });

  it('should toggle favorite when favoriteToggled is emitted', () => {
    fixture.detectChanges();

    component.onFavoriteToggle(mockBeer);

    expect(mockBeerStore.toggleFavorite).toHaveBeenCalledWith(mockBeer);
  });

  it('should display pagination controls in "all" mode', () => {
    filterModeSignal.set('all');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const pagination = compiled.querySelector('.beer-list__pagination');
    expect(pagination).toBeTruthy();
  });

  it('should not display pagination controls in "favorites" mode', () => {
    filterModeSignal.set('favorites');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const pagination = compiled.querySelector('.beer-list__pagination');
    expect(pagination).toBeFalsy();
  });

  it('should disable previous button on first page', () => {
    currentPageSignal.set(1);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.beer-list__pagination-btn');
    const prevButton = buttons[0] as HTMLButtonElement;
    expect(prevButton.disabled).toBe(true);
  });

  it('should enable previous button after first page', () => {
    currentPageSignal.set(2);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.beer-list__pagination-btn');
    const prevButton = buttons[0] as HTMLButtonElement;
    expect(prevButton.disabled).toBe(false);
  });

  it('should disable next button when displayedBeers.length < 25', () => {
    displayedBeersSignal.set([mockBeer]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.beer-list__pagination-btn');
    const nextButton = buttons[1] as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);
  });

  it('should enable next button when displayedBeers.length >= 25', () => {
    const manyBeers = Array(25).fill(null).map((_, i) => ({ ...mockBeer, id: i + 1 }));
    displayedBeersSignal.set(manyBeers);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.beer-list__pagination-btn');
    const nextButton = buttons[1] as HTMLButtonElement;
    expect(nextButton.disabled).toBe(false);
  });

  it('should update store when previous button is clicked', async () => {
    currentPageSignal.set(2);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.beer-list__pagination-btn');
    const prevButton = buttons[0] as HTMLButtonElement;
    
    // Component now updates store signals, which triggers effect to update URL
    prevButton.click();
    fixture.detectChanges();

    expect(currentPageSignal()).toBe(1);
    expect(mockBeerStore.loadBeers).toHaveBeenCalled();
  });

  it('should update store when next page button is clicked', async () => {
    const manyBeers = Array(25).fill(null).map((_, i) => ({ ...mockBeer, id: i + 1 }));
    displayedBeersSignal.set(manyBeers);
    currentPageSignal.set(1);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.beer-list__pagination-btn');
    const nextButton = buttons[1] as HTMLButtonElement;
    
    // Component now updates store signals, which triggers effect to update URL
    nextButton.click();
    fixture.detectChanges();

    expect(currentPageSignal()).toBe(2);
    expect(mockBeerStore.loadBeers).toHaveBeenCalled();
  });

  it('should display current page number', () => {
    currentPageSignal.set(3);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const pageIndicator = compiled.querySelector('.beer-list__page-indicator');
    expect(pageIndicator?.textContent).toContain('Page 3');
  });
});
