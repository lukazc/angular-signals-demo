import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesCheckboxComponent } from './favorites-checkbox.component';
import { FavoritesService } from '../../../services/favorites.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { Beer } from '../../../models/beer.model';

describe('FavoritesCheckboxComponent', () => {
  let component: FavoritesCheckboxComponent;
  let fixture: ComponentFixture<FavoritesCheckboxComponent>;
  let mockFavoritesService: jasmine.SpyObj<FavoritesService>;

  const mockBeer: Beer = {
    id: 1,
    name: 'Test Beer',
    tagline: 'Test Tagline',
    description: 'Test Description',
    image_url: 'test.png',
    abv: 5.0,
    ibu: null,
    target_fg: null,
    target_og: null,
    ebc: null,
    srm: null,
    ph: null,
    attenuation_level: null,
    volume: { value: 20, unit: 'litres' },
    boil_volume: { value: 25, unit: 'litres' },
    method: {
      mash_temp: [],
      fermentation: { temp: { value: 19, unit: 'celsius' } },
      twist: null
    },
    ingredients: {
      malt: [],
      hops: [],
      yeast: 'Test Yeast'
    },
    food_pairing: [],
    brewers_tips: 'Test tips',
    contributed_by: 'Test User',
    first_brewed: '01/2020'
  };

  beforeEach(async () => {
    // Create mock service
    mockFavoritesService = jasmine.createSpyObj('FavoritesService', ['getAllFavorites']);
    mockFavoritesService.getAllFavorites = jasmine.createSpy().and.returnValue(signal<Beer[]>([]));

    await TestBed.configureTestingModule({
      imports: [FavoritesCheckboxComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: FavoritesService, useValue: mockFavoritesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with unchecked state', () => {
      expect(component.favoritesControl.value).toBe(false);
    });

    it('should display favorites count as 0 initially', () => {
      expect(component.favoriteCount()).toBe(0);
    });

    it('should not show badge when no favorites', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.favorites-checkbox__badge');

      expect(badge).toBeFalsy();
    });
  });

  describe('Controlled Component Pattern', () => {
    it('should sync FormControl with input checked value', () => {
      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();

      expect(component.favoritesControl.value).toBe(true);
    });

    it('should update FormControl when input changes', () => {
      fixture.componentRef.setInput('checked', false);
      fixture.detectChanges();
      expect(component.favoritesControl.value).toBe(false);

      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();
      expect(component.favoritesControl.value).toBe(true);
    });

    it('should not trigger infinite loop when syncing', () => {
      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();

      // Should be able to set multiple times without errors
      fixture.componentRef.setInput('checked', false);
      fixture.detectChanges();
      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();

      expect(component.favoritesControl.value).toBe(true);
    });
  });

  describe('Checkbox Interaction', () => {
    it('should emit checked state when checkbox is toggled', () => {
      let emittedValue: boolean | undefined;
      component.checkedChange.subscribe((checked: boolean) => {
        emittedValue = checked;
      });

      component.favoritesControl.setValue(true);

      expect(emittedValue).toBe(true);
    });

    it('should emit false when unchecked', () => {
      let emittedValue: boolean | undefined;
      component.checkedChange.subscribe((checked: boolean) => {
        emittedValue = checked;
      });

      // Start checked
      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();

      // Uncheck
      component.favoritesControl.setValue(false);

      expect(emittedValue).toBe(false);
    });

    it('should toggle checkbox via UI', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const checkbox = compiled.querySelector('input[type="checkbox"]') as HTMLInputElement;

      checkbox.click();
      fixture.detectChanges();

      expect(component.favoritesControl.value).toBe(true);
    });
  });

  describe('Favorite Count Badge', () => {
    it('should display favorite count when favorites exist', () => {
      // Mock service to return favorites
      const favoritesSignal = signal<Beer[]>([mockBeer]);
      mockFavoritesService.getAllFavorites = jasmine.createSpy().and.returnValue(favoritesSignal);

      // Recreate component with updated service
      fixture = TestBed.createComponent(FavoritesCheckboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.favoriteCount()).toBe(1);

      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.favorites-checkbox__badge');

      expect(badge).toBeTruthy();
      expect(badge?.textContent?.trim()).toBe('(1)');
    });

    it('should update count when favorites change', () => {
      const favoritesSignal = signal<Beer[]>([mockBeer]);
      mockFavoritesService.getAllFavorites = jasmine.createSpy().and.returnValue(favoritesSignal);

      fixture = TestBed.createComponent(FavoritesCheckboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.favoriteCount()).toBe(1);

      // Add more favorites
      favoritesSignal.set([mockBeer, { ...mockBeer, id: 2 }, { ...mockBeer, id: 3 }]);
      fixture.detectChanges();

      expect(component.favoriteCount()).toBe(3);
    });

    it('should hide badge when no favorites', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.favorites-checkbox__badge');

      expect(badge).toBeFalsy();
    });
  });

  describe('Visual Elements', () => {
    it('should display "Favorites only" text', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const text = compiled.querySelector('.favorites-checkbox__text');

      expect(text?.textContent?.trim()).toBe('Favorites only');
    });

    it('should display heart icon', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const icon = compiled.querySelector('.favorites-checkbox__icon');

      expect(icon).toBeTruthy();
      expect(icon?.textContent?.trim()).toBe('favorite');
    });

    it('should have proper CSS classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('.favorites-checkbox')).toBeTruthy();
      expect(compiled.querySelector('.favorites-checkbox__control')).toBeTruthy();
      expect(compiled.querySelector('.favorites-checkbox__label')).toBeTruthy();
      expect(compiled.querySelector('.favorites-checkbox__icon')).toBeTruthy();
      expect(compiled.querySelector('.favorites-checkbox__text')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have mat-checkbox component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const checkbox = compiled.querySelector('mat-checkbox');

      expect(checkbox).toBeTruthy();
    });

    it('should be keyboard accessible', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(input).toBeTruthy();
      expect(input.type).toBe('checkbox');
    });

    it('should have Material checkbox component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const matCheckbox = compiled.querySelector('mat-checkbox');

      expect(matCheckbox).toBeTruthy();
    });
  });

  describe('Multiple Toggles', () => {
    it('should handle multiple toggles correctly', () => {
      const emittedValues: boolean[] = [];
      component.checkedChange.subscribe((checked: boolean) => {
        emittedValues.push(checked);
      });

      component.favoritesControl.setValue(true);
      component.favoritesControl.setValue(false);
      component.favoritesControl.setValue(true);

      expect(emittedValues).toEqual([true, false, true]);
    });

    it('should maintain sync with parent after multiple changes', () => {
      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();
      expect(component.favoritesControl.value).toBe(true);

      fixture.componentRef.setInput('checked', false);
      fixture.detectChanges();
      expect(component.favoritesControl.value).toBe(false);

      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();
      expect(component.favoritesControl.value).toBe(true);
    });
  });
});
