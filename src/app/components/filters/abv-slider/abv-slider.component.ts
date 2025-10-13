import { 
  Component, 
  ChangeDetectionStrategy, 
  output, 
  input,
  signal,
  effect,
  DestroyRef,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbvRange } from '../../../models/beer.model';

/**
 * ABV Slider Component (Controlled)
 * 
 * A controlled component that displays ABV range from parent (store).
 * Provides a single range slider with dual handles for filtering beers by ABV.
 * Supports range from 0 to 100 with 0.1 precision.
 * 
 * Architecture:
 * - Receives range via input() signal (single source of truth in store)
 * - Handles { min: null, max: null } as full range (0-100 display)
 * - Syncs slider values with input range via effect()
 * - Debounces emissions by 300ms to reduce API calls
 * 
 * Features:
 * - Single range slider with dual handles (min/max)
 * - Real-time value display during drag
 * - Debounced filtering (300ms) for performance
 * - Fully keyboard accessible (arrow keys work)
 * - Responsive design
 * 
 * @example
 * <app-abv-slider 
 *   [range]="store.abvRange()"
 *   (rangeChange)="store.setAbvRange($event)" 
 * />
 */
@Component({
  selector: 'app-abv-slider',
  imports: [
    FormsModule,
    MatSliderModule,
    MatFormFieldModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="abv-slider">
      <label class="abv-slider__label">
        ABV Range: 
        <span class="abv-slider__values">
          {{ minValue() }} - {{ maxValue() }}
        </span>
      </label>
      
      <mat-slider 
        [min]="0" 
        [max]="100" 
        [step]="0.1"
        [discrete]="true"
        [showTickMarks]="false"
        class="abv-slider__slider"
      >
        <input 
          matSliderStartThumb
          [ngModel]="minValue()"
          (ngModelChange)="onMinChange($event)"
          aria-label="Minimum ABV"
        />
        <input 
          matSliderEndThumb
          [ngModel]="maxValue()"
          (ngModelChange)="onMaxChange($event)"
          aria-label="Maximum ABV"
        />
      </mat-slider>
    </div>
  `,
  styles: [`
    .abv-slider {
      width: 100%;
      padding: 1rem;
      
      &__label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        margin-bottom: 1rem;
      }
      
      &__values {
        font-weight: 700;
        color: #1976d2;
      }
      
      &__slider {
        width: 100%;
        margin-top: 1rem;
      }
    }
  `]
})
export class AbvSliderComponent {
  private readonly destroyRef = inject(DestroyRef);
  
  /**
   * Current ABV range from store (controlled component)
   * Handles null values as full range (0-100)
   */
  readonly range = input<AbvRange>({ min: null, max: null });
  
  /**
   * Emits the ABV range when slider values change (debounced 300ms)
   */
  readonly rangeChange = output<AbvRange>();
  
  /**
   * Current min value (for display and binding)
   * Synced with input range via effect
   */
  readonly minValue = signal<number>(0);
  
  /**
   * Current max value (for display and binding)
   * Synced with input range via effect
   */
  readonly maxValue = signal<number>(100);
  
  /**
   * Subject for debouncing range changes
   */
  private readonly rangeChange$ = new Subject<AbvRange>();
  
  constructor() {
    // Sync slider values with input range (controlled component pattern)
    // Handle null as full range (0-100)
    effect(() => {
      const inputRange = this.range();
      const min = inputRange.min ?? 0;
      const max = inputRange.max ?? 100;
      
      this.minValue.set(min);
      this.maxValue.set(max);
    });
    
    // Debounce range changes before emitting to parent
    this.rangeChange$
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(range => {
        this.rangeChange.emit(range);
      });
  }
  
  /**
   * Handle min value change
   * Updates local signal for immediate display, debounced emit to parent
   */
  onMinChange(value: number): void {
    this.minValue.set(value);
    this.rangeChange$.next({ 
      min: this.minValue(), 
      max: this.maxValue() 
    });
  }
  
  /**
   * Handle max value change
   * Updates local signal for immediate display, debounced emit to parent
   */
  onMaxChange(value: number): void {
    this.maxValue.set(value);
    this.rangeChange$.next({ 
      min: this.minValue(), 
      max: this.maxValue() 
    });
  }
}
