import { Component, inject, ChangeDetectionStrategy, DestroyRef, effect } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BeerStore } from '../../stores/beer.store';
import { BeerCardComponent } from '../beer-card/beer-card.component';
import { BeerDetailModalComponent } from '../beer-detail-modal/beer-detail-modal.component';
import { FilterContainerComponent } from '../filters/filter-container/filter-container.component';
import { Beer, SortConfig } from '../../models/beer.model';

/**
 * Beer List Component
 * 
 * Main component for displaying the beer catalog.
 * Shows grid of beer cards with loading, error, and empty states.
 * Handles pagination and favorite toggling.
 * 
 * **URL Integration:**
 * - Reads query params on init and populates store
 * - Updates URL when filters/pagination change
 * - Supports browser back/forward navigation
 * - Query params: page, search, abv_min, abv_max, sort, favorites
 * 
 * **Example URLs:**
 * - `/beers` - Default view
 * - `/beers?page=2` - Pagination
 * - `/beers?search=IPA&abv_min=5&abv_max=15` - Filtered view
 * - `/beers?sort=abv-desc&favorites=true` - Sorted favorites
 * 
 * Features:
 * - Filter controls (search, ABV, favorites, sort)
 * - Responsive grid layout (1-4 columns based on screen size)
 * - Loading state with spinner
 * - Error state with retry button
 * - Empty states with contextual messages
 * - Pagination controls (only in 'all' mode)
 * - Opens beer details in modal
 * - Favorite toggle integration
 * 
 * @example
 * <app-beer-list />
 */
@Component({
    selector: 'app-beer-list',
    imports: [
        BeerCardComponent,
        FilterContainerComponent,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './beer-list.component.html',
    styleUrl: './beer-list.component.scss',
})
export class BeerListComponent {
    /** Beer store for accessing beer data and state */
    readonly store = inject(BeerStore);

    /** Material Dialog for showing beer details */
    private readonly dialog = inject(MatDialog);
    
    /** Router for URL navigation */
    private readonly router = inject(Router);
    
    /** Activated route for reading query params */
    private readonly route = inject(ActivatedRoute);
    
    /** DestroyRef for cleanup */
    private readonly destroyRef = inject(DestroyRef);
    
    /** Flag to prevent update loop (URL → Store → URL) */
    private isUpdatingFromUrl = false;

    constructor() {
        // Initialize store from URL query params on load
        this.route.queryParams
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(params => {
                this.isUpdatingFromUrl = true;
                this.initializeStoreFromUrl(params);
                this.isUpdatingFromUrl = false;
            });
        
        // Update URL when store state changes (except during URL initialization)
        effect(() => {
            if (!this.isUpdatingFromUrl) {
                this.updateUrlFromStore();
            }
        });
    }
    
    /**
     * Initialize store from URL query parameters
     */
    private initializeStoreFromUrl(params: any): void {
        // Page
        const page = params['page'] ? parseInt(params['page'], 10) : 1;
        this.store.setInitialPage(page);
        
        // Search
        const search = params['search'] || '';
        this.store.searchTerm.set(search);
        
        // ABV range
        const abvMin = params['abv_min'] ? parseFloat(params['abv_min']) : null;
        const abvMax = params['abv_max'] ? parseFloat(params['abv_max']) : null;
        this.store.abvRange.set({ min: abvMin, max: abvMax });
        
        // Sort
        const sortParam = params['sort'] as string;
        if (sortParam === 'recommended') {
            this.store.sortConfig.set({ by: 'recommended', direction: 'asc' });
        } else if (sortParam) {
            const [by, direction] = sortParam.split('-') as [('name' | 'abv'), ('asc' | 'desc')];
            if ((by === 'name' || by === 'abv') && (direction === 'asc' || direction === 'desc')) {
                this.store.sortConfig.set({ by, direction });
            }
        } else {
            // Default to recommended when no sort param
            this.store.sortConfig.set({ by: 'recommended', direction: 'asc' });
        }
        
        this.store.loadBeers();
    }
    
    /**
     * Update URL query parameters from store state
     */
    private updateUrlFromStore(): void {
        const queryParams: any = {};
        
        // Page (only if > 1)
        const page = this.store.currentPage();
        if (page > 1) {
            queryParams.page = page;
        }
        
        // Search (only if not empty)
        const search = this.store.searchTerm();
        if (search) {
            queryParams.search = search;
        }
        
        // ABV range (only if not null)
        const abvRange = this.store.abvRange();
        if (abvRange.min !== null) {
            queryParams.abv_min = abvRange.min;
        }
        if (abvRange.max !== null) {
            queryParams.abv_max = abvRange.max;
        }
        
        // Sort (only if not default 'recommended')
        const sortConfig = this.store.sortConfig();
        if (sortConfig.by !== 'recommended') {
            queryParams.sort = `${sortConfig.by}-${sortConfig.direction}`;
        }
        
        // Navigate with new query params (don't reload component)
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
            replaceUrl: true // Replace URL in history (don't add new entry for every filter change)
        });
    }


    /**
     * Handle details button click - open modal with beer details
     */
    onDetailsClick(beer: Beer): void {
        this.dialog.open(BeerDetailModalComponent, {
            data: { beer },
            maxWidth: '800px',
            width: '90vw',
            maxHeight: '90vh',
            panelClass: 'beer-detail-dialog'
        });
    }

    /**
     * Handle favorite toggle
     */
    onFavoriteToggle(beer: Beer): void {
        this.store.toggleFavorite(beer);
    }

    /**
     * Handle retry button click
     */
    onRetry(): void {
        this.store.loadBeers();
    }

    /**
     * Handle clear filters button click
     * Resets store and URL to defaults
     */
    onClearFilters(): void {
        this.store.resetFilters();
        // URL will be updated automatically via effect
    }

    /**
     * Handle previous page button click
     * Updates store, which triggers URL update via effect
     */
    onPreviousPage(): void {
        const currentPage = this.store.currentPage();
        if (currentPage > 1) {
            this.store.currentPage.set(currentPage - 1);
            this.store.loadBeers();
        }
    }

    /**
     * Handle next page button click
     * Updates store, which triggers URL update via effect
     */
    onNextPage(): void {
        const nextPage = this.store.currentPage() + 1;
        this.store.currentPage.set(nextPage);
        this.store.loadBeers();
    }

    /**
     * Get appropriate icon for empty state based on current filter mode
     */
    getEmptyIcon(): string {
        if (this.store.filterMode() === 'favorites') {
            return 'favorite_border';
        }
        if (this.store.searchTerm() || this.store.abvRange().min !== null || this.store.abvRange().max !== null) {
            return 'search_off';
        }
        return 'local_drink';
    }

    /**
     * Get appropriate title for empty state
     */
    getEmptyTitle(): string {
        if (this.store.filterMode() === 'favorites') {
            const favCount = this.store.sourceBeers().length;
            if (favCount === 0) {
                return 'No Favorites Yet';
            }
            return 'No Matching Favorites';
        }
        if (this.store.searchTerm() || this.store.abvRange().min !== null || this.store.abvRange().max !== null) {
            return 'No Results Found';
        }
        return 'No Beers Available';
    }
}
