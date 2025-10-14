import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbvSliderComponent } from './abv-slider.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AbvSliderComponent', () => {
  let component: AbvSliderComponent;
  let fixture: ComponentFixture<AbvSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbvSliderComponent, NoopAnimationsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AbvSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with full range (0-100) when range is null', () => {
      expect(component.minValue()).toBe(0);
      expect(component.maxValue()).toBe(100);
    });

    it('should display slider controls initially', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const slider = compiled.querySelector('mat-slider');

      expect(slider).toBeTruthy();
    });
  });

  describe('Controlled Component Pattern', () => {
    it('should sync with input range values', () => {
      fixture.componentRef.setInput('range', { min: 5, max: 10 });
      fixture.detectChanges();

      expect(component.minValue()).toBe(5);
      expect(component.maxValue()).toBe(10);
    });

    it('should handle null min as 0', () => {
      fixture.componentRef.setInput('range', { min: null, max: 15 });
      fixture.detectChanges();

      expect(component.minValue()).toBe(0);
      expect(component.maxValue()).toBe(15);
    });

    it('should handle null max as 100', () => {
      fixture.componentRef.setInput('range', { min: 5, max: null });
      fixture.detectChanges();

      expect(component.minValue()).toBe(5);
      expect(component.maxValue()).toBe(100);
    });

    it('should handle both nulls as full range', () => {
      fixture.componentRef.setInput('range', { min: null, max: null });
      fixture.detectChanges();

      expect(component.minValue()).toBe(0);
      expect(component.maxValue()).toBe(100);
    });

    it('should update slider values when input range changes', () => {
      fixture.componentRef.setInput('range', { min: 4, max: 8 });
      fixture.detectChanges();

      expect(component.minValue()).toBe(4);
      expect(component.maxValue()).toBe(8);
    });
  });

  describe('Debounced Range Changes', () => {
    it('should emit range after 300ms debounce on min change', (done) => {
      let emittedRange: any;
      component.rangeChange.subscribe((range) => {
        emittedRange = range;
      });

      component.onMinChange(5);
      
      // Check before debounce completes
      setTimeout(() => {
        expect(emittedRange).toBeUndefined();
      }, 200);

      // Check after debounce completes
      setTimeout(() => {
        expect(emittedRange).toEqual({ min: 5, max: 100 });
        done();
      }, 350);
    });

    it('should emit range after 300ms debounce on max change', (done) => {
      let emittedRange: any;
      component.rangeChange.subscribe((range) => {
        emittedRange = range;
      });

      component.onMaxChange(75);

      setTimeout(() => {
        expect(emittedRange).toEqual({ min: 0, max: 75 });
        done();
      }, 350);
    });

    it('should only emit once for rapid changes', (done) => {
      const emittedRanges: any[] = [];
      component.rangeChange.subscribe((range) => {
        emittedRanges.push(range);
      });

      component.onMinChange(5);
      setTimeout(() => component.onMinChange(10), 100);
      setTimeout(() => component.onMinChange(15), 200);

      setTimeout(() => {
        // Should only emit the final value once
        expect(emittedRanges).toEqual([{ min: 15, max: 100 }]);
        done();
      }, 550);
    });

    it('should update display immediately on change', () => {
      component.onMinChange(10);
      fixture.detectChanges();

      expect(component.minValue()).toBe(10);
      expect(component.maxValue()).toBe(100);
    });
  });

  describe('Min/Max Value Changes', () => {
    it('should update min value', () => {
      component.onMinChange(25);
      expect(component.minValue()).toBe(25);
      expect(component.maxValue()).toBe(100);
    });

    it('should update max value', () => {
      component.onMaxChange(50);
      expect(component.minValue()).toBe(0);
      expect(component.maxValue()).toBe(50);
    });

    it('should update both values independently', () => {
      component.onMinChange(20);
      component.onMaxChange(80);

      expect(component.minValue()).toBe(20);
      expect(component.maxValue()).toBe(80);
    });

    it('should emit combined range', (done) => {
      let emittedRange: any;
      component.rangeChange.subscribe((range) => {
        emittedRange = range;
      });

      component.onMinChange(10);
      component.onMaxChange(90);

      setTimeout(() => {
        expect(emittedRange).toEqual({ min: 10, max: 90 });
        done();
      }, 350);
    });
  });

  describe('Slider Configuration', () => {
    it('should have mat-slider element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const slider = compiled.querySelector('mat-slider');

      expect(slider).toBeTruthy();
    });

    it('should have dual thumb inputs for range', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const startThumb = compiled.querySelector('input[matSliderStartThumb]');
      const endThumb = compiled.querySelector('input[matSliderEndThumb]');

      expect(startThumb).toBeTruthy();
      expect(endThumb).toBeTruthy();
    });

    it('should have proper label', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const label = compiled.querySelector('.abv-slider__label');

      expect(label?.textContent?.trim()).toBe('Alcohol Content (%)');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for minimum ABV input', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const minInput = compiled.querySelector('input[matSliderStartThumb]');

      expect(minInput?.getAttribute('aria-label')).toBe('Minimum ABV');
    });

    it('should have aria-label for maximum ABV input', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const maxInput = compiled.querySelector('input[matSliderEndThumb]');

      expect(maxInput?.getAttribute('aria-label')).toBe('Maximum ABV');
    });
  });

  describe('Visual Elements', () => {
    it('should have slider control', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const slider = compiled.querySelector('mat-slider');
      const control = compiled.querySelector('.abv-slider__control');

      expect(slider).toBeTruthy();
      expect(control).toBeTruthy();
    });

    it('should update internal values', () => {
      component.onMinChange(5);
      component.onMaxChange(15);
      fixture.detectChanges();

      expect(component.minValue()).toBe(5);
      expect(component.maxValue()).toBe(15);
    });
  });

  describe('Edge Cases', () => {
    it('should handle decimal values', (done) => {
      let emittedRange: any;
      component.rangeChange.subscribe((range) => {
        emittedRange = range;
      });

      component.onMinChange(4.5);
      component.onMaxChange(8.7);

      setTimeout(() => {
        expect(emittedRange).toEqual({ min: 4.5, max: 8.7 });
        done();
      }, 350);
    });

    it('should handle min equal to max', (done) => {
      let emittedRange: any;
      component.rangeChange.subscribe((range) => {
        emittedRange = range;
      });

      component.onMinChange(50);
      component.onMaxChange(50);

      setTimeout(() => {
        expect(emittedRange).toEqual({ min: 50, max: 50 });
        done();
      }, 350);
    });

    it('should handle boundary values (0 and 100)', (done) => {
      let emittedRange: any;
      component.rangeChange.subscribe((range) => {
        emittedRange = range;
      });

      component.onMinChange(0);
      component.onMaxChange(100);

      setTimeout(() => {
        expect(emittedRange).toEqual({ min: 0, max: 100 });
        done();
      }, 350);
    });
  });
});
