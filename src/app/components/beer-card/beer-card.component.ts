import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Beer } from '../../models/beer.model';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

/**
 * Beer Card Component
 * 
 * Displays a single beer card with image, name, tagline, ABV, and favorite toggle.
 * Emits events for viewing details and toggling favorite status.
 * 
 * Features:
 * - Responsive card layout
 * - Automatic image fallback for missing/failed beer images
 * - Hover effects and transitions
 * - Accessibility with keyboard navigation
 * - Favorite status indicator (filled/outlined heart)
 * 
 * @example
 * <app-beer-card
 *   [beer]="beer"
 *   [isFavorite]="store.isFavorite(beer.id)"
 *   (detailsClicked)="openDetails($event)"
 *   (favoriteToggled)="store.toggleFavorite($event)"
 * />
 */
@Component({
    selector: 'app-beer-card',
    imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        ImageFallbackDirective
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './beer-card.component.html',
    styleUrl: './beer-card.component.scss',
})
export class BeerCardComponent {
    /** Beer data to display */
    beer = input.required<Beer>();

    /** Whether this beer is in favorites */
    isFavorite = input<boolean>(false);

    /** Emitted when user clicks "View Details" button */
    detailsClicked = output<Beer>();

    /** Emitted when user toggles favorite status */
    favoriteToggled = output<Beer>();

    /**
     * Handle details button click
     */
    onDetailsClick(): void {
        this.detailsClicked.emit(this.beer());
    }

    /**
     * Handle favorite button click
     * Prevents event bubbling to avoid triggering card click
     */
    onFavoriteClick(event: Event): void {
        event.stopPropagation();
        this.favoriteToggled.emit(this.beer());
    }
}
