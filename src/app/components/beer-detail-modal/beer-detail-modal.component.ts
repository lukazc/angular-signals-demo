import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { NgOptimizedImage } from '@angular/common';
import { Beer } from '../../models/beer.model';

/**
 * Beer Detail Modal Component
 * 
 * Displays comprehensive beer information in a modal dialog.
 * Shows image, description, brewing details, food pairings, and brewer's tips.
 * 
 * Features:
 * - Full beer details with all available information
 * - Responsive modal layout (full screen on mobile)
 * - Scrollable content for long descriptions
 * - Keyboard accessible (ESC to close)
 * - Smooth animations
 * 
 * @example
 * const dialogRef = this.dialog.open(BeerDetailModalComponent, {
 *   data: { beer },
 *   maxWidth: '800px',
 *   width: '90vw'
 * });
 */
@Component({
    selector: 'app-beer-detail-modal',
    imports: [
        NgOptimizedImage,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './beer-detail-modal.component.html',
    styleUrl: './beer-detail-modal.component.scss',
})
export class BeerDetailModalComponent {
    /** Injected dialog data containing the beer to display */
    readonly data = inject<{ beer: Beer }>(MAT_DIALOG_DATA);

    /** Dialog reference for programmatic control */
    readonly dialogRef = inject(MatDialogRef<BeerDetailModalComponent>);

    /** The beer to display details for */
    readonly beer: Beer = this.data.beer;
}
