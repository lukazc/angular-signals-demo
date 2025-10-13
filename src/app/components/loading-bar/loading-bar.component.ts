import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '../../services/loading.service';

/**
 * Loading Bar Component
 * 
 * Global loading indicator displayed at the top of the page.
 * Shows a progress bar when any HTTP request is in progress.
 * 
 * Features:
 * - Automatic: Managed by loading interceptor
 * - Non-blocking: Doesn't interfere with page content
 * - Smooth animations
 * - Fixed position at top of viewport
 * 
 * Usage:
 * Add to app component template at the top level.
 * 
 * @example
 * <app-loading-bar />
 */
@Component({
    selector: 'app-loading-bar',
    imports: [MatProgressBarModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (loading()) {
            <mat-progress-bar 
                mode="indeterminate" 
                class="loading-bar"
            />
        }
    `,
    styles: [`
        :host {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
        }

        .loading-bar {
            height: 4px;
        }

        ::ng-deep .loading-bar .mat-mdc-progress-bar-fill::after {
            background-color: #667eea;
        }
    `]
})
export class LoadingBarComponent {
    private readonly loadingService = inject(LoadingService);
    
    /** Loading state from loading service */
    readonly loading = this.loadingService.loading;
}
