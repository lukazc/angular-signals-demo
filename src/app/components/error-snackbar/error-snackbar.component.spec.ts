import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorSnackbarComponent } from './error-snackbar.component';
import { ErrorMessageService } from '../../services/error-message.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ErrorSnackbarComponent', () => {
  let component: ErrorSnackbarComponent;
  let fixture: ComponentFixture<ErrorSnackbarComponent>;
  let mockErrorService: { currentError: ReturnType<typeof signal<string | null>> };
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    mockErrorService = {
      currentError: signal<string | null>(null)
    };

    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ErrorSnackbarComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ErrorMessageService, useValue: mockErrorService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(ErrorSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should not show snackbar when error is null', () => {
    mockErrorService.currentError.set(null);
    createComponent();

    expect(mockSnackBar.open).not.toHaveBeenCalled();
  });


  it('should have no visible template (display: none)', () => {
    createComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    const computedStyle = window.getComputedStyle(compiled);
    expect(computedStyle.display).toBe('none');
  });
});
