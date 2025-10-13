import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
 * 
 * @example
 * // In route configuration:
 * { path: 'beers', component: BeerListPageComponent }
 */
@Component({
    selector: 'app-beer-list-page',
    imports: [
        BeerListComponent
        // FilterContainerComponent - TODO: Add when Phase 3 is complete
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './beer-list-page.component.html',
    styleUrl: './beer-list-page.component.scss',
})
export class BeerListPageComponent {
    /** Beer store for accessing state */
    readonly store = inject(BeerStore);
}
