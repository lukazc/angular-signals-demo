import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingBarComponent } from './loading-bar.component';
import { LoadingService } from '../../services/loading.service';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoadingBarComponent', () => {
  let component: LoadingBarComponent;
  let fixture: ComponentFixture<LoadingBarComponent>;
  let mockLoadingService: { loading: ReturnType<typeof signal<boolean>> };

  beforeEach(async () => {
    mockLoadingService = {
      loading: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [LoadingBarComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject LoadingService', () => {
    expect(component.loading).toBe(mockLoadingService.loading);
  });

  it('should not display progress bar when loading is false', () => {
    mockLoadingService.loading.set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const progressBar = compiled.querySelector('mat-progress-bar');
    expect(progressBar).toBeFalsy();
  });

  it('should display progress bar when loading is true', () => {
    mockLoadingService.loading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const progressBar = compiled.querySelector('mat-progress-bar');
    expect(progressBar).toBeTruthy();
  });

  it('should use indeterminate mode', () => {
    mockLoadingService.loading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const progressBar = compiled.querySelector('mat-progress-bar');
    expect(progressBar?.getAttribute('mode')).toBe('indeterminate');
  });

  it('should have loading-bar class', () => {
    mockLoadingService.loading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const progressBar = compiled.querySelector('.loading-bar');
    expect(progressBar).toBeTruthy();
  });
});
