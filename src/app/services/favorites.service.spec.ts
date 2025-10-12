import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';
import { Beer } from '../models/beer.model';
import { provideZonelessChangeDetection } from '@angular/core';

describe('FavoritesService', () => {
  let service: FavoritesService;
  const STORAGE_KEY = 'beer-favorites';

  // Mock beer data
  const mockBeer1: Beer = {
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
    food_pairing: ['Spicy carne asada', 'Fish tacos'],
    brewers_tips: 'Dry hop for extra aroma',
    contributed_by: 'Sam Mason <samjbmason>',
    first_brewed: '04/2007'
  };

  const mockBeer2: Beer = {
    id: 2,
    name: 'Trashy Blonde',
    tagline: 'You Know You Shouldnt',
    description: 'A light and refreshing ale',
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
    brewers_tips: 'Keep it simple',
    contributed_by: 'Sam Mason <samjbmason>',
    first_brewed: '04/2008'
  };

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        FavoritesService
      ]
    });

    service = TestBed.inject(FavoritesService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with empty favorites', () => {
      expect(service.favorites()).toEqual([]);
    });

    it('should load favorites from sessionStorage on init', () => {
      const storedBeers = [mockBeer1, mockBeer2];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedBeers));

      // Create new service instance to trigger constructor
      const newService = new FavoritesService();

      expect(newService.favorites()).toEqual(storedBeers);
    });
  });

  describe('isFavorite()', () => {
    it('should return false for non-favorite beer', () => {
      expect(service.isFavorite(1)).toBe(false);
    });

    it('should return true for favorite beer', () => {
      service.addFavorite(mockBeer1);
      expect(service.isFavorite(1)).toBe(true);
    });

    it('should return false after removing favorite', () => {
      service.addFavorite(mockBeer1);
      service.removeFavorite(1);
      expect(service.isFavorite(1)).toBe(false);
    });
  });

  describe('addFavorite()', () => {
    it('should add beer to favorites', () => {
      service.addFavorite(mockBeer1);

      expect(service.favorites().length).toBe(1);
      expect(service.favorites()[0]).toEqual(mockBeer1);
    });

    it('should add multiple beers to favorites', () => {
      service.addFavorite(mockBeer1);
      service.addFavorite(mockBeer2);

      expect(service.favorites().length).toBe(2);
      expect(service.favorites()).toContain(mockBeer1);
      expect(service.favorites()).toContain(mockBeer2);
    });

    it('should save to sessionStorage when adding favorite', () => {
      service.addFavorite(mockBeer1);

      const stored = sessionStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual([mockBeer1]);
    });

    it('should not add duplicate beer', () => {
      service.addFavorite(mockBeer1);
      service.addFavorite(mockBeer1); // Try to add again

      expect(service.favorites().length).toBe(1);
    });

    it('should log warning when adding duplicate', () => {
      spyOn(console, 'warn');
      service.addFavorite(mockBeer1);
      service.addFavorite(mockBeer1);

      expect(console.warn).toHaveBeenCalledWith('Beer 1 is already in favorites');
    });
  });

  describe('removeFavorite()', () => {
    it('should remove beer from favorites', () => {
      service.addFavorite(mockBeer1);
      service.addFavorite(mockBeer2);

      service.removeFavorite(1);

      expect(service.favorites().length).toBe(1);
      expect(service.favorites()[0]).toEqual(mockBeer2);
    });

    it('should update sessionStorage when removing favorite', () => {
      service.addFavorite(mockBeer1);
      service.addFavorite(mockBeer2);

      service.removeFavorite(1);

      const stored = sessionStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual([mockBeer2]);
    });

    it('should handle removing non-existent favorite', () => {
      service.addFavorite(mockBeer1);

      service.removeFavorite(999); // Non-existent ID

      expect(service.favorites().length).toBe(1);
      expect(service.favorites()[0]).toEqual(mockBeer1);
    });
  });

  describe('toggleFavorite()', () => {
    it('should add beer if not favorited', () => {
      service.toggleFavorite(mockBeer1);

      expect(service.isFavorite(1)).toBe(true);
      expect(service.favorites().length).toBe(1);
    });

    it('should remove beer if already favorited', () => {
      service.addFavorite(mockBeer1);

      service.toggleFavorite(mockBeer1);

      expect(service.isFavorite(1)).toBe(false);
      expect(service.favorites().length).toBe(0);
    });

    it('should toggle multiple times correctly', () => {
      service.toggleFavorite(mockBeer1); // Add
      expect(service.isFavorite(1)).toBe(true);

      service.toggleFavorite(mockBeer1); // Remove
      expect(service.isFavorite(1)).toBe(false);

      service.toggleFavorite(mockBeer1); // Add again
      expect(service.isFavorite(1)).toBe(true);
    });
  });

  describe('getAllFavorites()', () => {
    it('should return signal of all favorites', () => {
      service.addFavorite(mockBeer1);
      service.addFavorite(mockBeer2);

      const favorites = service.getAllFavorites();

      expect(favorites()).toEqual([mockBeer1, mockBeer2]);
    });

    it('should return empty array when no favorites', () => {
      const favorites = service.getAllFavorites();

      expect(favorites()).toEqual([]);
    });
  });

  describe('clearAllFavorites()', () => {
    it('should remove all favorites', () => {
      service.addFavorite(mockBeer1);
      service.addFavorite(mockBeer2);

      service.clearAllFavorites();

      expect(service.favorites().length).toBe(0);
    });

    it('should clear sessionStorage', () => {
      service.addFavorite(mockBeer1);

      service.clearAllFavorites();

      const stored = sessionStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual([]);
    });
  });

  describe('SessionStorage Integration', () => {
    it('should handle corrupted data (not an array)', () => {
      spyOn(console, 'error');
      sessionStorage.setItem(STORAGE_KEY, '{"not": "an array"}');

      const newService = new FavoritesService();

      expect(newService.favorites()).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Favorites data is corrupted (not an array). Clearing storage.'
      );
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should handle corrupted data (invalid beer objects)', () => {
      spyOn(console, 'error');
      sessionStorage.setItem(STORAGE_KEY, '[{"invalid": "object"}]');

      const newService = new FavoritesService();

      expect(newService.favorites()).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Favorites data is corrupted (invalid beer objects). Clearing storage.'
      );
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should handle JSON parse errors', () => {
      spyOn(console, 'error');
      sessionStorage.setItem(STORAGE_KEY, 'invalid json{');

      const newService = new FavoritesService();

      expect(newService.favorites()).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load favorites from sessionStorage:',
        jasmine.any(Error)
      );
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should handle quota exceeded errors when saving', () => {
      spyOn(console, 'error');
      spyOn(sessionStorage, 'setItem').and.throwError(
        Object.assign(new Error('QuotaExceededError'), { name: 'QuotaExceededError' })
      );

      service.addFavorite(mockBeer1);

      expect(console.error).toHaveBeenCalledWith(
        'SessionStorage quota exceeded. Cannot save favorites.'
      );
    });

    it('should handle general save errors', () => {
      spyOn(console, 'error');
      spyOn(sessionStorage, 'setItem').and.throwError(new Error('Save failed'));

      service.addFavorite(mockBeer1);

      expect(console.error).toHaveBeenCalledWith(
        'Failed to save favorites to sessionStorage:',
        jasmine.any(Error)
      );
    });
  });

  describe('Computed Signals', () => {
    it('should update favoriteIds when favorites change', () => {
      expect(service.favoriteIds()).toEqual([]);

      service.addFavorite(mockBeer1);
      expect(service.favoriteIds()).toEqual([1]);

      service.addFavorite(mockBeer2);
      expect(service.favoriteIds()).toEqual([1, 2]);

      service.removeFavorite(1);
      expect(service.favoriteIds()).toEqual([2]);
    });
  });
});
