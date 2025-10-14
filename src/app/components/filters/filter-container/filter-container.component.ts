import { 
  Component, 
  ChangeDetectionStrategy, 
  inject
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SearchFilterComponent } from '../search-filter/search-filter.component';
import { AbvSliderComponent } from '../abv-slider/abv-slider.component';
import { FavoritesCheckboxComponent } from '../favorites-checkbox/favorites-checkbox.component';
import { SortDropdownComponent } from '../sort-dropdown/sort-dropdown.component';
import { BeerStore } from '../../../stores/beer.store';
import { AbvRange, SortConfig } from '../../../models/beer.model';

/**
 * Filter Container Component (Controlled Pattern)
 * 
 * Composes all filter components using controlled component pattern.
 * All filter state lives in BeerStore, components receive values via input() signals.
 * 
 * Architecture:
 * - Store is single source of truth
 * - Filter components are controlled (receive [value], emit (valueChange))
 * - Clear button calls store.resetFilters() → automatic propagation to all filters
 * - Ready for URL param integration (store initializes from URL → components sync)
 * 
 * Features:
 * - Search filter with debouncing
 * - ABV range slider (0-100)
 * - Favorites-only checkbox with count badge
 * - Sort dropdown (4 options)
 * - Clear all filters button
 * - Responsive grid layout
 * - Material Design card container
 * 
 * @example
 * <app-filter-container />
 */
@Component({
  selector: 'app-filter-container',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    SearchFilterComponent,
    AbvSliderComponent,
    FavoritesCheckboxComponent,
    SortDropdownComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-container.component.html',
  styleUrl: './filter-container.component.scss',
})
export class FilterContainerComponent {
  readonly store = inject(BeerStore);
  
  /**
   * Handle search term changes
   */
  onSearchChange(term: string): void {
    this.store.setSearchTerm(term);
  }
  
  /**
   * Handle ABV range changes
   */
  onAbvRangeChange(range: AbvRange): void {
    this.store.setAbvRange(range);
  }
  
  /**
   * Handle favorites-only toggle
   */
  onFavoritesToggle(favoritesOnly: boolean): void {
    this.store.setFilterMode(favoritesOnly ? 'favorites' : 'all');
  }
  
  /**
   * Handle sort changes
   */
  onSortChange(config: SortConfig): void {
    this.store.setSortConfig(config);
  }
  
  /**
   * Clear all filters - just call store method
   * Store updates propagate automatically to controlled components via signals
   */
  clearAllFilters(): void {
    this.store.resetFilters();
  }
}
