import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchFilterComponent } from './search-filter.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';

describe('SearchFilterComponent', () => {
  let component: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilterComponent, NoopAnimationsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty search control', () => {
      expect(component.searchControl.value).toBe('');
    });

    it('should not show clear button when input is empty', () => {
      expect(component.hasValue()).toBe(false);
      
      const compiled = fixture.nativeElement as HTMLElement;
      const clearButton = compiled.querySelector('.search-filter__clear');
      expect(clearButton).toBeFalsy();
    });
  });

  describe('Controlled Component Pattern', () => {
    it('should sync FormControl with input value', () => {
      fixture.componentRef.setInput('value', 'test search');
      fixture.detectChanges();

      expect(component.searchControl.value).toBe('test search');
    });

    it('should update FormControl when input value changes', () => {
      fixture.componentRef.setInput('value', 'ipa');
      fixture.detectChanges();
      expect(component.searchControl.value).toBe('ipa');

      fixture.componentRef.setInput('value', 'stout');
      fixture.detectChanges();
      expect(component.searchControl.value).toBe('stout');
    });

    it('should update hasValue signal when input value changes', () => {
      fixture.componentRef.setInput('value', 'test');
      fixture.detectChanges();

      expect(component.hasValue()).toBe(true);
    });
  });

  describe('Debounced Search', () => {
    it('should emit search term after 400ms debounce', (done) => {
      let emittedValue: string | undefined;
      component.valueChange.subscribe((value: string) => {
        emittedValue = value;
      });

      component.searchControl.setValue('ipa');
      
      // Check before debounce completes
      setTimeout(() => {
        expect(emittedValue).toBeUndefined();
      }, 300);

      // Check after debounce completes
      setTimeout(() => {
        expect(emittedValue).toBe('ipa');
        done();
      }, 450);
    });

    it('should only emit once for rapid typing', (done) => {
      const emittedValues: string[] = [];
      component.valueChange.subscribe((value: string) => {
        emittedValues.push(value);
      });

      component.searchControl.setValue('i');
      setTimeout(() => component.searchControl.setValue('ip'), 100);
      setTimeout(() => component.searchControl.setValue('ipa'), 200);

      setTimeout(() => {
        // Should only emit the final value once
        expect(emittedValues).toEqual(['ipa']);
        done();
      }, 650);
    });

    it('should not emit if value is the same', (done) => {
      const emittedValues: string[] = [];
      component.valueChange.subscribe((value: string) => {
        emittedValues.push(value);
      });

      component.searchControl.setValue('ipa');
      
      setTimeout(() => {
        component.searchControl.setValue('ipa');
        
        setTimeout(() => {
          // Should only emit once due to distinctUntilChanged
          expect(emittedValues).toEqual(['ipa']);
          done();
        }, 450);
      }, 450);
    });
  });

  describe('Clear Button', () => {
    it('should show clear button when input has value', () => {
      component.searchControl.setValue('test');
      fixture.detectChanges();

      expect(component.hasValue()).toBe(true);
      
      const compiled = fixture.nativeElement as HTMLElement;
      const clearButton = compiled.querySelector('.search-filter__clear');
      expect(clearButton).toBeTruthy();
    });

    it('should clear search when clear button is clicked', () => {
      let emittedValue: string | undefined;
      component.valueChange.subscribe((value: string) => {
        emittedValue = value;
      });

      component.searchControl.setValue('test');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const clearButton = compiled.querySelector('.search-filter__clear') as HTMLButtonElement;
      
      clearButton.click();
      fixture.detectChanges();

      expect(component.searchControl.value).toBe('');
      expect(emittedValue).toBe('');
      expect(component.hasValue()).toBe(false);
    });

    it('should hide clear button after clearing', () => {
      component.searchControl.setValue('test');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      let clearButton = compiled.querySelector('.search-filter__clear') as HTMLButtonElement;
      clearButton.click();
      fixture.detectChanges();

      clearButton = compiled.querySelector('.search-filter__clear') as HTMLButtonElement;
      expect(clearButton).toBeFalsy();
    });
  });

  describe('User Input', () => {
    it('should update FormControl when user types', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('input') as HTMLInputElement;

      input.value = 'stout';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.searchControl.value).toBe('stout');
    });

    it('should show clear button after user types', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('input') as HTMLInputElement;

      input.value = 'ale';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.hasValue()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for input', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('input') as HTMLInputElement;

      expect(input.getAttribute('aria-label')).toBe('Search beers');
    });

    it('should have proper aria-label for clear button', () => {
      component.searchControl.setValue('test');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const clearButton = compiled.querySelector('.search-filter__clear') as HTMLButtonElement;

      expect(clearButton.getAttribute('aria-label')).toBe('Clear search');
    });

    it('should have placeholder text', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('input') as HTMLInputElement;

      expect(input.placeholder).toBe('Search beers by name...');
    });
  });

  describe('Visual Elements', () => {
    it('should display search icon', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const icon = compiled.querySelector('.search-filter__icon');

      expect(icon).toBeTruthy();
      expect(icon?.textContent?.trim()).toBe('search');
    });

    it('should have Material form field', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const formField = compiled.querySelector('mat-form-field');

      expect(formField).toBeTruthy();
    });
  });
});
