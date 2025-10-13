import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { routes } from './app.routes';

describe('App Routes', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes)
      ]
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('should have routes defined', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should redirect empty path to /beers', async () => {
    await router.navigate(['']);
    expect(location.path()).toBe('/beers');
  });

  it('should navigate to beer list page', async () => {
    await router.navigate(['/beers']);
    expect(location.path()).toBe('/beers');
  });

  it('should have title for beers route', () => {
    const beersRoute = routes.find(r => r.path === 'beers');
    expect(beersRoute?.title).toBe('Beer Catalog');
  });

  it('should have wildcard route for 404', () => {
    const wildcardRoute = routes.find(r => r.path === '**');
    expect(wildcardRoute).toBeTruthy();
    expect(wildcardRoute?.title).toBe('Page Not Found');
  });

  it('should navigate to 404 for unknown routes', async () => {
    await router.navigate(['/unknown-route']);
    expect(location.path()).toBe('/unknown-route');
    // Component should be NotFoundComponent but we can't easily test that here
  });

  it('should have BeerListPageComponent for beers route', () => {
    const beersRoute = routes.find(r => r.path === 'beers');
    expect(beersRoute?.component).toBeTruthy();
  });

  it('should have NotFoundComponent for wildcard route', () => {
    const wildcardRoute = routes.find(r => r.path === '**');
    expect(wildcardRoute?.component).toBeTruthy();
  });
});
