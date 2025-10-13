import { Routes } from '@angular/router';
import { BeerListPageComponent } from './pages/beer-list-page/beer-list-page.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

/**
 * Application Routes
 * 
 * Route Configuration:
 * - '' (empty) → Redirects to '/beers'
 * - 'beers' → Main beer catalog page
 * - '**' (wildcard) → 404 Not Found page
 * 
 * Features:
 * - Hash location strategy (for GitHub Pages deployment)
 * - Lazy loading ready for future feature modules
 * - Preloading strategy can be added later
 */
export const routes: Routes = [
    {
        path: '',
        redirectTo: '/beers',
        pathMatch: 'full'
    },
    {
        path: 'beers',
        component: BeerListPageComponent,
        title: 'Beer Catalog'
    },
    {
        path: '**',
        component: NotFoundComponent,
        title: 'Page Not Found'
    }
];
