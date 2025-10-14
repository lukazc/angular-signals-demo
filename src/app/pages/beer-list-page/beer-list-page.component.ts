import { Component, inject, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BeerListComponent } from '../../components/beer-list/beer-list.component';
import { BeerStore } from '../../stores/beer.store';

/**
 * Beer List Page Component
 * 
 * Main page component that displays the beer catalog.
 * Composes filter components and beer list component.
 * 
 * Features:
 * - Page layout with header
 * - Filter section (to be added when Phase 3 is complete)
 * - Beer list grid
 * - Responsive container layout
 * - Managed by BeerStore for state
 * - URL-driven pagination sync (?page=2)
 * 
 * Query Parameters:
 * - page: Current page number (default: 1)
 * 
 * Architecture:
 * - URL is the single source of truth for pagination state
 * - Pagination controls navigate to new URL
 * - URL changes trigger store updates and API calls
 * 
 * Flow:
 * 1. User clicks pagination → Router navigates to new page
 * 2. queryParams observable emits
 * 3. Component updates store.currentPage
 * 4. Component calls store.loadBeers()
 * 5. Store fetches data from API
 * 
 * @example
 * // In route configuration:
 * { path: 'beers', component: BeerListPageComponent }
 * 
 * // URL examples:
 * // /beers         → page 1 (default)
 * // /beers?page=3  → page 3
 */
@Component({
    selector: 'app-beer-list-page',
    imports: [
        NgOptimizedImage,
        BeerListComponent
        // FilterContainerComponent - TODO: Add when Phase 3 is complete
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './beer-list-page.component.html',
    styleUrl: './beer-list-page.component.scss',
})
export class BeerListPageComponent implements OnInit {
    /** Beer store for accessing state */
    readonly store = inject(BeerStore);
    
    /** Activated route for reading query params */
    private readonly route = inject(ActivatedRoute);
    
    /** Router for updating query params */
    private readonly router = inject(Router);
    
    /** DestroyRef for managing subscriptions */
    private readonly destroyRef = inject(DestroyRef);
    
    /**
     * Navigate to next page
     * Exposed for child components (pagination controls)
     */
    goToNextPage(): void {
        const nextPage = this.store.currentPage() + 1;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: nextPage },
            queryParamsHandling: 'merge'
        });
    }
    
    /**
     * Navigate to previous page
     * Exposed for child components (pagination controls)
     */
    goToPreviousPage(): void {
        const currentPage = this.store.currentPage();
        if (currentPage > 1) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { page: currentPage - 1 },
                queryParamsHandling: 'merge'
            });
        }
    }
    
    ngOnInit(): void {
        // Listen for query parameter changes (URL → Store → API)
        // This is the single source of truth for pagination
        this.route.queryParams
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(params => {
                const pageParam = params['page'];
                const newPage = pageParam ? parseInt(pageParam, 10) : 1;
                
                // Validate page number
                if (newPage > 0 && !isNaN(newPage)) {
                    this.store.setInitialPage(newPage);
                    this.store.loadBeers();
                }
            });
    }
}
