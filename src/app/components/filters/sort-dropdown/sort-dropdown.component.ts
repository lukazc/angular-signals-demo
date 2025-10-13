import { 
  Component, 
  ChangeDetectionStrategy, 
  output,
  input,
  effect
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SortConfig } from '../../../models/beer.model';

/**
 * Sort option value combining field and direction
 * 'recommended' is a special value for API default order (no sorting)
 */
type SortOptionValue = 'recommended' | 'name-asc' | 'name-desc' | 'abv-asc' | 'abv-desc';

/**
 * Sort option for dropdown
 */
interface SortOption {
  value: SortOptionValue;
  label: string;
  config: SortConfig;
}

/**
 * Sort Dropdown Component (Controlled)
 * 
 * A controlled component that displays sort configuration from parent (store).
 * Provides a dropdown to select sort order for beer list.
 * Supports sorting by name or ABV, in ascending or descending order.
 * Client-side sorting only (API doesn't support it).
 * 
 * Architecture:
 * - Receives sortConfig via input() signal (single source of truth in store)
 * - Syncs FormControl with input value via effect()
 * - Emits changes upward but doesn't maintain state
 * - Perfect for URL param initialization (store → component auto-sync)
 * 
 * Features:
 * - Material Design select
 * - 4 sort options (name/ABV × asc/desc)
 * - Default: Name (A-Z)
 * - Accessible with proper ARIA labels
 * 
 * @example
 * <app-sort-dropdown 
 *   [sortConfig]="store.sortConfig()"
 *   (sortConfigChange)="onSortChange($event)" 
 * />
 */
@Component({
  selector: 'app-sort-dropdown',
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sort-dropdown">
      <mat-form-field class="sort-dropdown__field" appearance="outline">
        <mat-label>Sort by</mat-label>
        <mat-select 
          [formControl]="sortControl"
          aria-label="Sort beers"
          class="sort-dropdown__select"
        >
          @for (option of sortOptions; track option.value) {
            <mat-option [value]="option.value">
              {{ option.label }}
            </mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .sort-dropdown {
      width: 100%;
      
      &__field {
        width: 100%;
        font-size: 1rem;
      }
      
      &__select {
        font-size: 1rem;
      }
    }
  `]
})
export class SortDropdownComponent {
  /**
   * Current sort configuration from store (controlled component)
   */
  readonly sortConfig = input<SortConfig>({ by: 'recommended', direction: 'asc' });
  
  /**
   * Emits sort configuration when user selects an option
   */
  readonly sortConfigChange = output<SortConfig>();
  
  /**
   * Available sort options
   */
  readonly sortOptions: SortOption[] = [
    {
      value: 'recommended',
      label: 'Recommended',
      config: { by: 'recommended', direction: 'asc' }
    },
    {
      value: 'name-asc',
      label: 'Name (A-Z)',
      config: { by: 'name', direction: 'asc' }
    },
    {
      value: 'name-desc',
      label: 'Name (Z-A)',
      config: { by: 'name', direction: 'desc' }
    },
    {
      value: 'abv-asc',
      label: 'ABV (Low to High)',
      config: { by: 'abv', direction: 'asc' }
    },
    {
      value: 'abv-desc',
      label: 'ABV (High to Low)',
      config: { by: 'abv', direction: 'desc' }
    }
  ];
  
  /**
   * Form control for sort selection (display only, synced with input value)
   */
  readonly sortControl = new FormControl<SortOptionValue>('recommended', { nonNullable: true });
  
  constructor() {
    // Sync FormControl with input sortConfig (controlled component pattern)
    effect(() => {
      const config = this.sortConfig();
      // 'recommended' is a special single value, others are 'field-direction'
      const optionValue: SortOptionValue = config.by === 'recommended' 
        ? 'recommended' 
        : `${config.by}-${config.direction}` as SortOptionValue;
      
      if (this.sortControl.value !== optionValue) {
        this.sortControl.setValue(optionValue, { emitEvent: false });
      }
    });
    
    // Subscribe to sort changes and emit upward
    this.sortControl.valueChanges.subscribe(value => {
      const option = this.sortOptions.find(opt => opt.value === value);
      if (option) {
        this.sortConfigChange.emit(option.config);
      }
    });
  }
}
