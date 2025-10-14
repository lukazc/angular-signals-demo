import { 
  Component, 
  ChangeDetectionStrategy, 
  output, 
  input,
  DestroyRef,
  inject,
  signal,
  effect
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/**
 * Search Filter Component (Controlled)
 * 
 * A controlled component that displays search term from parent (store).
 * Emits search term changes after a 400ms delay to reduce API calls.
 * 
 * Architecture:
 * - Receives value via input() signal (single source of truth in store)
 * - Syncs FormControl with input value via effect()
 * - Emits changes upward but doesn't maintain state
 * - Perfect for URL param initialization (store → component auto-sync)
 * 
 * Features:
 * - Debounced input (400ms)
 * - Clear button when input has value
 * - Accessible with proper ARIA labels
 * - Responsive design
 * 
 * @example
 * <app-search-filter 
 *   [value]="store.searchTerm()"
 *   (valueChange)="store.setSearchTerm($event)" 
 * />
 */
@Component({
  selector: 'app-search-filter',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-filter">
      <label class="search-filter__label">
        Filter by Name
      </label>
      
      <mat-form-field class="search-filter__field" appearance="outline">
        <input
          matInput
          type="text"
          [formControl]="searchControl"
          placeholder="Search beers by name"
          aria-label="Search beers"
          class="search-filter__input"
        />
        <mat-icon matIconPrefix class="search-filter__icon">search</mat-icon>
        <button
          matIconSuffix
          matIconButton
          (click)="clearSearch()"
          aria-label="Clear search"
          class="search-filter__clear"
          type="button"
          [disabled]="!hasValue()"
          [class.search-filter__clear--hidden]="!hasValue()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .search-filter {
      width: 100%;
      
      &__label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }
      
      &__field {
        width: 100%;
        font-size: 1rem;
      }
      
      &__input {
        font-size: 1rem;
      }
      
      &__icon {
      }
      
      &__clear {
        transition: opacity 0.2s ease, visibility 0.2s ease;
        
        &--hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
      }
    }
  `]
})
export class SearchFilterComponent {
  private readonly destroyRef = inject(DestroyRef);
  
  /**
   * Current search term value from store (controlled component)
   */
  readonly value = input<string>('');
  
  /**
   * Emits the search term when the user types (debounced)
   */
  readonly valueChange = output<string>();
  
  /**
   * Form control for search input
   */
  readonly searchControl = new FormControl('', { nonNullable: true });
  
  /**
   * Signal to track if input has value (for showing clear button)
   */
  readonly hasValue = signal<boolean>(false);
  
  constructor() {
    // Sync FormControl with input value (controlled component pattern)
    effect(() => {
      const currentValue = this.value();
      if (this.searchControl.value !== currentValue) {
        this.searchControl.setValue(currentValue, { emitEvent: false });
        this.hasValue.set(currentValue.length > 0);
      }
    });
    
    // Subscribe to value changes (debounced) and emit upward
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(term => {
        this.valueChange.emit(term);
      });
    
    // Track whether input has value (for clear button visibility)
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(term => {
        this.hasValue.set(term.length > 0);
      });
  }
  
  /**
   * Clear search input
   */
  clearSearch(): void {
    this.searchControl.setValue('');
    this.valueChange.emit('');
  }
}
