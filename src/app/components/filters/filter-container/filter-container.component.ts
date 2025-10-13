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
  template: `
    <mat-card class="filter-container">
      <mat-card-content class="filter-container__content">
        <div class="filter-container__header">
          <h3 class="filter-container__title">Filters</h3>
          <button
            matButton
            (click)="clearAllFilters()"
            class="filter-container__clear-btn"
            aria-label="Clear all filters"
          >
            <mat-icon>clear_all</mat-icon>
            Clear All
          </button>
        </div>
        
        <div class="filter-container__grid">
          <!-- Search Filter -->
          <div class="filter-container__item filter-container__item--search">
            <app-search-filter 
              [value]="store.searchTerm()"
              (valueChange)="onSearchChange($event)"
            />
          </div>
          
          <!-- Sort Dropdown -->
          <div class="filter-container__item filter-container__item--sort">
            <app-sort-dropdown 
              [sortConfig]="store.sortConfig()"
              (sortConfigChange)="onSortChange($event)"
            />
          </div>
          
          <!-- Favorites Checkbox -->
          <div class="filter-container__item filter-container__item--favorites">
            <app-favorites-checkbox 
              [checked]="store.filterMode() === 'favorites'"
              (checkedChange)="onFavoritesToggle($event)"
            />
          </div>
        </div>
        
        <mat-divider class="filter-container__divider" />
        
        <!-- ABV Slider (full width) -->
        <div class="filter-container__abv">
          <app-abv-slider 
            [range]="store.abvRange()"
            (rangeChange)="onAbvRangeChange($event)"
          />
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .filter-container {
      margin-bottom: 2rem;
      
      &__content {
        padding: 1.5rem;
      }
      
      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      
      &__title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }
      
      &__clear-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #1976d2;
        font-weight: 500;
        
        mat-icon {
          font-size: 1.25rem;
          width: 1.25rem;
          height: 1.25rem;
        }
        
        &:hover {
          background-color: rgba(25, 118, 210, 0.04);
        }
      }
      
      &__grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      &__item {
        display: flex;
        align-items: center;
        
        &--search,
        &--sort {
          // Full width on mobile
        }
        
        &--favorites {
          justify-content: center;
        }
      }
      
      &__divider {
        margin: 1.5rem 0;
      }
      
      &__abv {
        margin-top: 1rem;
      }
    }
    
    @media (min-width: 768px) {
      .filter-container {
        &__grid {
          grid-template-columns: 2fr 1.5fr 1fr;
          align-items: start;
        }
        
        &__item {
          &--favorites {
            justify-content: flex-start;
          }
        }
      }
    }
    
    @media (min-width: 1024px) {
      .filter-container {
        &__grid {
          grid-template-columns: 3fr 2fr 1.5fr;
        }
      }
    }
  `]
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
