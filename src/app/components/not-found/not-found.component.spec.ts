import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotFoundComponent } from './not-found.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 404 error code', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const errorCode = compiled.querySelector('.not-found__code');
    expect(errorCode?.textContent).toContain('404');
  });

  it('should display error title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.not-found__title');
    expect(title?.textContent).toContain('Page Not Found');
  });

  it('should display error message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const message = compiled.querySelector('.not-found__message');
    expect(message?.textContent).toBeTruthy();
  });

  it('should display error icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.not-found__icon');
    expect(icon).toBeTruthy();
    expect(icon?.textContent?.trim()).toBe('error_outline');
  });

  it('should have back to home button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.not-found__button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Back to Home');
  });

  it('should link back to home button to /beers', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[routerLink="/beers"]');
    expect(link).toBeTruthy();
  });

  it('should have home icon in button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.not-found__button mat-icon');
    expect(icon?.textContent?.trim()).toBe('home');
  });
});
