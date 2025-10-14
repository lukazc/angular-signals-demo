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
      <label class="favorites-checkbox__label">
        Favorites
      </label>
      
      <div class="favorites-checkbox__control-wrapper">
        <mat-checkbox
          [formControl]="favoritesControl"
          color="primary"
          aria-label="Show only favorite beers"
          class="favorites-checkbox__control"
        >
          <span class="favorites-checkbox__text">
            Show only favorites
            @if (favoriteCount() > 0) {
              <span class="favorites-checkbox__badge">
                ({{ favoriteCount() }})
              </span>
            }
          </span>
        </mat-checkbox>
      </div>
    </div>
  `,
  styles: [`
    .favorites-checkbox {
      width: 100%;
      margin-bottom: 20px;
      
      &__label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }
      
      &__control-wrapper {
        border: 1px solid var(--mat-sys-outline);
        border-radius: 4px;
        min-height: 56px;
        display: flex;
        align-items: center;
      }
      
      &__control {
        font-size: 1rem;
      }
      
      &__text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 400;
      }
      
      &__badge {
        font-size: 0.875rem;
        font-weight: 600;
        padding: 0.125rem;
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
