import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeerListPageComponent } from './beer-list-page.component';
import { BeerStore } from '../../stores/beer.store';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Beer } from '../../models/beer.model';

describe('BeerListPageComponent', () => {
  let component: BeerListPageComponent;
  let fixture: ComponentFixture<BeerListPageComponent>;
  let mockBeerStore: any;

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
      sourceBeers: sourceBeersSignal,
      loadBeers: jasmine.createSpy('loadBeers'),
      loadNextPage: jasmine.createSpy('loadNextPage'),
      loadPreviousPage: jasmine.createSpy('loadPreviousPage'),
      toggleFavorite: jasmine.createSpy('toggleFavorite'),
      isFavorite: jasmine.createSpy('isFavorite').and.returnValue(false),
      resetFilters: jasmine.createSpy('resetFilters')
    };

    await TestBed.configureTestingModule({
      imports: [BeerListPageComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BeerStore, useValue: mockBeerStore }
      ]
    }).compileComponents();

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

  it('should display page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.beer-list-page__title');
    expect(title?.textContent).toContain('Beer Catalog');
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

  it('should display footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('.beer-list-page__footer');
    expect(footer).toBeTruthy();
  });

  it('should have link to Punk API in footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('.beer-list-page__footer a') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.href).toContain('punkapi');
  });
});
