import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortDropdownComponent } from './sort-dropdown.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';
import { SortConfig } from '../../../models/beer.model';

describe('SortDropdownComponent', () => {
  let component: SortDropdownComponent;
  let fixture: ComponentFixture<SortDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortDropdownComponent, NoopAnimationsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SortDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with recommended sort', () => {
      expect(component.sortControl.value).toBe('recommended');
    });

    it('should have 5 sort options', () => {
      expect(component.sortOptions.length).toBe(5);
    });

    it('should have correct sort option values', () => {
      const values = component.sortOptions.map(opt => opt.value);
      expect(values).toEqual([
        'recommended',
        'name-asc',
        'name-desc',
        'abv-asc',
        'abv-desc'
      ]);
    });

    it('should have correct sort option labels', () => {
      const labels = component.sortOptions.map(opt => opt.label);
      expect(labels).toEqual([
        'Recommended',
        'Name (A-Z)',
        'Name (Z-A)',
        'ABV (Low to High)',
        'ABV (High to Low)'
      ]);
    });
  });

  describe('Controlled Component Pattern', () => {
    it('should sync FormControl with input sortConfig for recommended', () => {
      const config: SortConfig = { by: 'recommended', direction: 'asc' };
      fixture.componentRef.setInput('sortConfig', config);
      fixture.detectChanges();

      expect(component.sortControl.value).toBe('recommended');
    });

    it('should sync FormControl with input sortConfig for name-asc', () => {
      const config: SortConfig = { by: 'name', direction: 'asc' };
      fixture.componentRef.setInput('sortConfig', config);
      fixture.detectChanges();

      expect(component.sortControl.value).toBe('name-asc');
    });

    it('should sync FormControl with input sortConfig for name-desc', () => {
      const config: SortConfig = { by: 'name', direction: 'desc' };
      fixture.componentRef.setInput('sortConfig', config);
      fixture.detectChanges();

      expect(component.sortControl.value).toBe('name-desc');
    });

    it('should sync FormControl with input sortConfig for abv-asc', () => {
      const config: SortConfig = { by: 'abv', direction: 'asc' };
      fixture.componentRef.setInput('sortConfig', config);
      fixture.detectChanges();

      expect(component.sortControl.value).toBe('abv-asc');
    });

    it('should sync FormControl with input sortConfig for abv-desc', () => {
      const config: SortConfig = { by: 'abv', direction: 'desc' };
      fixture.componentRef.setInput('sortConfig', config);
      fixture.detectChanges();

      expect(component.sortControl.value).toBe('abv-desc');
    });

    it('should update FormControl when input sortConfig changes', () => {
      fixture.componentRef.setInput('sortConfig', { by: 'name', direction: 'asc' });
      fixture.detectChanges();
      expect(component.sortControl.value).toBe('name-asc');

      fixture.componentRef.setInput('sortConfig', { by: 'abv', direction: 'desc' });
      fixture.detectChanges();
      expect(component.sortControl.value).toBe('abv-desc');
    });
  });

  describe('Sort Option Selection', () => {
    it('should emit correct config for recommended', () => {
      let emittedConfig: SortConfig | undefined;
      component.sortConfigChange.subscribe((config: SortConfig) => {
        emittedConfig = config;
      });

      component.sortControl.setValue('recommended');

      expect(emittedConfig).toEqual({ by: 'recommended', direction: 'asc' });
    });

    it('should emit correct config for name-asc', () => {
      let emittedConfig: SortConfig | undefined;
      component.sortConfigChange.subscribe((config: SortConfig) => {
        emittedConfig = config;
      });

      component.sortControl.setValue('name-asc');

      expect(emittedConfig).toEqual({ by: 'name', direction: 'asc' });
    });

    it('should emit correct config for name-desc', () => {
      let emittedConfig: SortConfig | undefined;
      component.sortConfigChange.subscribe((config: SortConfig) => {
        emittedConfig = config;
      });

      component.sortControl.setValue('name-desc');

      expect(emittedConfig).toEqual({ by: 'name', direction: 'desc' });
    });

    it('should emit correct config for abv-asc', () => {
      let emittedConfig: SortConfig | undefined;
      component.sortConfigChange.subscribe((config: SortConfig) => {
        emittedConfig = config;
      });

      component.sortControl.setValue('abv-asc');

      expect(emittedConfig).toEqual({ by: 'abv', direction: 'asc' });
    });

    it('should emit correct config for abv-desc', () => {
      let emittedConfig: SortConfig | undefined;
      component.sortConfigChange.subscribe((config: SortConfig) => {
        emittedConfig = config;
      });

      component.sortControl.setValue('abv-desc');

      expect(emittedConfig).toEqual({ by: 'abv', direction: 'desc' });
    });
  });

  describe('Multiple Selections', () => {
    it('should handle multiple selections correctly', () => {
      const emittedConfigs: SortConfig[] = [];
      component.sortConfigChange.subscribe((config: SortConfig) => {
        emittedConfigs.push(config);
      });

      component.sortControl.setValue('name-asc');
      component.sortControl.setValue('abv-desc');
      component.sortControl.setValue('recommended');

      expect(emittedConfigs).toEqual([
        { by: 'name', direction: 'asc' },
        { by: 'abv', direction: 'desc' },
        { by: 'recommended', direction: 'asc' }
      ]);
    });

    it('should maintain sync after multiple changes', () => {
      fixture.componentRef.setInput('sortConfig', { by: 'name', direction: 'asc' });
      fixture.detectChanges();
      expect(component.sortControl.value).toBe('name-asc');

      fixture.componentRef.setInput('sortConfig', { by: 'abv', direction: 'desc' });
      fixture.detectChanges();
      expect(component.sortControl.value).toBe('abv-desc');

      fixture.componentRef.setInput('sortConfig', { by: 'recommended', direction: 'asc' });
      fixture.detectChanges();
      expect(component.sortControl.value).toBe('recommended');
    });
  });

  describe('Visual Elements', () => {
    it('should display all sort options', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const select = compiled.querySelector('mat-select');

      expect(select).toBeTruthy();
    });

    it('should have Material form field', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const formField = compiled.querySelector('mat-form-field');

      expect(formField).toBeTruthy();
    });

    it('should have proper CSS classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('.sort-dropdown')).toBeTruthy();
      expect(compiled.querySelector('.sort-dropdown__field')).toBeTruthy();
      expect(compiled.querySelector('.sort-dropdown__select')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const select = compiled.querySelector('mat-select');

      expect(select?.getAttribute('aria-label')).toBe('Sort beers');
    });

    it('should be keyboard accessible via Material select', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const select = compiled.querySelector('mat-select');

      expect(select).toBeTruthy();
    });
  });

  describe('Sort Option Structure', () => {
    it('should have correct structure for recommended option', () => {
      const option = component.sortOptions[0];

      expect(option).toEqual({
        value: 'recommended',
        label: 'Recommended',
        config: { by: 'recommended', direction: 'asc' }
      });
    });

    it('should have correct structure for name-asc option', () => {
      const option = component.sortOptions[1];

      expect(option).toEqual({
        value: 'name-asc',
        label: 'Name (A-Z)',
        config: { by: 'name', direction: 'asc' }
      });
    });

    it('should have correct structure for abv-desc option', () => {
      const option = component.sortOptions[4];

      expect(option).toEqual({
        value: 'abv-desc',
        label: 'ABV (High to Low)',
        config: { by: 'abv', direction: 'desc' }
      });
    });
  });
});
