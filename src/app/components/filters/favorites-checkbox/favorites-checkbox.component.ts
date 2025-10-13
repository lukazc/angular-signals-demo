import { 
  Component, 
  ChangeDetectionStrategy, 
  output,
  input,
  inject,
  computed,
  effect
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { FavoritesService } from '../../../services/favorites.service';

/**
 * Favorites Checkbox Component (Controlled)
 * 
 * A controlled component that displays favorites filter state from parent (store).
 * Provides a checkbox to toggle "favorites only" filter mode.
 * Shows the number of favorite beers in a badge.
 * 
 * Architecture:
 * - Receives checked state via input() signal (single source of truth in store)
 * - Syncs FormControl with input value via effect()
 * - Emits changes upward but doesn't maintain state
 * - Perfect for URL param initialization (store → component auto-sync)
 * 
 * Features:
 * - Material Design checkbox
 * - Favorite count badge
 * - Heart icon
 * - Accessible with proper ARIA labels
 * 
 * @example
 * <app-favorites-checkbox 
 *   [checked]="store.filterMode() === 'favorites'"
 *   (checkedChange)="onFavoritesToggle($event)" 
 * />
 */
@Component({
  selector: 'app-favorites-checkbox',
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatBadgeModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="favorites-checkbox">
      <mat-checkbox
        [formControl]="favoritesControl"
        color="primary"
        aria-label="Show only favorite beers"
        class="favorites-checkbox__control"
      >
        <span class="favorites-checkbox__label">
          <mat-icon class="favorites-checkbox__icon">favorite</mat-icon>
          <span class="favorites-checkbox__text">
            Favorites only
          </span>
          @if (favoriteCount() > 0) {
            <span class="favorites-checkbox__badge">
              ({{ favoriteCount() }})
            </span>
          }
        </span>
      </mat-checkbox>
    </div>
  `,
  styles: [`
    .favorites-checkbox {
      display: flex;
      align-items: center;
      padding: 0.5rem 0;
      
      &__control {
        font-size: 1rem;
      }
      
      &__label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      &__icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
        color: #e91e63;
      }
      
      &__text {
        font-weight: 500;
      }
      
      &__badge {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1976d2;
        background: rgba(25, 118, 210, 0.1);
        padding: 0.125rem 0.5rem;
        border-radius: 12px;
      }
    }
  `]
})
export class FavoritesCheckboxComponent {
  private readonly favoritesService = inject(FavoritesService);
  
  /**
   * Current checked state from store (controlled component)
   */
  readonly checked = input<boolean>(false);
  
  /**
   * Emits when favorites-only mode is toggled
   */
  readonly checkedChange = output<boolean>();
  
  /**
   * Form control for checkbox (display only, synced with input value)
   */
  readonly favoritesControl = new FormControl<boolean>(false, { nonNullable: true });
  
  /**
   * Number of favorite beers (computed from service)
   */
  readonly favoriteCount = computed(() => 
    this.favoritesService.getAllFavorites()().length
  );
  
  constructor() {
    // Sync FormControl with input value (controlled component pattern)
    effect(() => {
      const currentChecked = this.checked();
      if (this.favoritesControl.value !== currentChecked) {
        this.favoritesControl.setValue(currentChecked, { emitEvent: false });
      }
    });
    
    // Subscribe to checkbox changes and emit upward
    this.favoritesControl.valueChanges.subscribe(checked => {
      this.checkedChange.emit(checked);
    });
  }
}
