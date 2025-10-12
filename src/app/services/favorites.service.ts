import { Injectable, signal, computed } from '@angular/core';
import { Beer } from '../models/beer.model';

/**
 * Favorites Service
 * 
 * Manages favorite beers with sessionStorage persistence.
 * Stores complete Beer objects (not just IDs) for offline-like experience.
 * 
 * Features:
 * - Signal-based reactive state
 * - Automatic sessionStorage sync on every mutation
 * - Graceful error handling for corrupted data
 * - Load favorites on service instantiation
 * 
 * SessionStorage Structure:
 * ```json
 * {
 *   "beer-favorites": [
 *     { id: 192, name: "Punk IPA", ... },
 *     { id: 15, name: "Trashy Blonde", ... }
 *   ]
 * }
 * ```
 * 
 * @example
 * // In a component:
 * export class BeerCardComponent {
 *   private favoritesService = inject(FavoritesService);
 *   favorites = this.favoritesService.favorites;
 *   
 *   toggleFavorite(beer: Beer): void {
 *     this.favoritesService.toggleFavorite(beer);
 *   }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'beer-favorites';
  
  /**
   * All favorite beers (complete Beer objects)
   * Automatically loaded from sessionStorage on service init
   */
  readonly favorites = signal<Beer[]>([]);
  
  /**
   * Computed signal: Array of favorite beer IDs (for quick lookup)
   */
  readonly favoriteIds = computed(() => 
    this.favorites().map(beer => beer.id)
  );
  
  constructor() {
    this.loadFavorites();
  }
  
  /**
   * Check if a beer is in favorites
   * 
   * @param beerId - Beer ID to check
   * @returns True if beer is favorited
   */
  isFavorite(beerId: number): boolean {
    return this.favoriteIds().includes(beerId);
  }
  
  /**
   * Add a beer to favorites
   * Stores complete Beer object in sessionStorage
   * 
   * @param beer - Complete beer object to add
   */
  addFavorite(beer: Beer): void {
    if (this.isFavorite(beer.id)) {
      console.warn(`Beer ${beer.id} is already in favorites`);
      return;
    }
    
    this.favorites.update(current => [...current, beer]);
    this.saveFavorites();
  }
  
  /**
   * Remove a beer from favorites
   * 
   * @param beerId - ID of beer to remove
   */
  removeFavorite(beerId: number): void {
    this.favorites.update(current => 
      current.filter(beer => beer.id !== beerId)
    );
    this.saveFavorites();
  }
  
  /**
   * Toggle a beer's favorite status
   * 
   * @param beer - Complete beer object to toggle
   */
  toggleFavorite(beer: Beer): void {
    if (this.isFavorite(beer.id)) {
      this.removeFavorite(beer.id);
    } else {
      this.addFavorite(beer);
    }
  }
  
  /**
   * Get all favorite beers
   * 
   * @returns Signal of all favorite beers
   */
  getAllFavorites() {
    return this.favorites;
  }
  
  /**
   * Clear all favorites
   * Removes all data from sessionStorage
   */
  clearAllFavorites(): void {
    this.favorites.set([]);
    this.saveFavorites();
  }
  
  /**
   * Load favorites from sessionStorage
   * Called automatically on service instantiation
   * Handles corrupted data gracefully
   */
  private loadFavorites(): void {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return;
      }
      
      const parsed = JSON.parse(stored);
      
      // Validate that it's an array
      if (!Array.isArray(parsed)) {
        console.error('Favorites data is corrupted (not an array). Clearing storage.');
        sessionStorage.removeItem(this.STORAGE_KEY);
        return;
      }
      
      // Validate that items look like Beer objects
      const isValid = parsed.every(item => 
        item && 
        typeof item === 'object' && 
        typeof item.id === 'number' &&
        typeof item.name === 'string'
      );
      
      if (!isValid) {
        console.error('Favorites data is corrupted (invalid beer objects). Clearing storage.');
        sessionStorage.removeItem(this.STORAGE_KEY);
        return;
      }
      
      this.favorites.set(parsed);
      console.log(`Loaded ${parsed.length} favorites from sessionStorage`);
    } catch (error) {
      console.error('Failed to load favorites from sessionStorage:', error);
      // Don't throw - gracefully degrade to empty favorites
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }
  
  /**
   * Save favorites to sessionStorage
   * Called automatically after every mutation
   * Handles quota exceeded errors gracefully
   */
  private saveFavorites(): void {
    try {
      const data = JSON.stringify(this.favorites());
      sessionStorage.setItem(this.STORAGE_KEY, data);
      console.log(`Saved ${this.favorites().length} favorites to sessionStorage`);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('SessionStorage quota exceeded. Cannot save favorites.');
        // Could show user notification here via ErrorMessageService
      } else {
        console.error('Failed to save favorites to sessionStorage:', error);
      }
    }
  }
}
