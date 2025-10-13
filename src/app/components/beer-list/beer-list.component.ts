import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BeerStore } from '../../stores/beer.store';
import { BeerCardComponent } from '../beer-card/beer-card.component';
import { BeerDetailModalComponent } from '../beer-detail-modal/beer-detail-modal.component';
import { Beer } from '../../models/beer.model';

/**
 * Beer List Component
 * 
 * Main component for displaying the beer catalog.
 * Shows grid of beer cards with loading, error, and empty states.
 * Handles pagination and favorite toggling.
 * 
 * Features:
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
    
    /** Router for URL-based pagination */
    private readonly router = inject(Router);
    
    /** Activated route for reading current route info */
    private readonly route = inject(ActivatedRoute);


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
     */
    onClearFilters(): void {
        this.store.resetFilters();
    }

    /**
     * Handle previous page button click
     * Navigates to previous page via URL change
     */
    onPreviousPage(): void {
        const currentPage = this.store.currentPage();
        if (currentPage > 1) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { page: currentPage - 1 },
                queryParamsHandling: 'merge'
            });
        }
    }

    /**
     * Handle next page button click
     * Navigates to next page via URL change
     */
    onNextPage(): void {
        const nextPage = this.store.currentPage() + 1;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: nextPage },
            queryParamsHandling: 'merge'
        });
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
