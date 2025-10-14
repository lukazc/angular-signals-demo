import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ErrorMessageService } from '../../services/error-message.service';

/**
 * Error Snackbar Component
 * 
 * Global error notification component that displays error messages from ErrorMessageService.
 * Shows a Material Design snackbar at the bottom of the screen.
 * 
 * Features:
 * - Automatic: Reacts to error service messages
 * - Auto-dismiss: Closes after timeout (default 5 seconds)
 * - Manual dismiss: User can close with X button
 * - Non-blocking: Doesn't interrupt user flow
 * 
 * Usage:
 * Add to app component template. Component will automatically
 * show snackbar when ErrorMessageService.showError() is called.
 * 
 * @example
 * <app-error-snackbar />
 */
@Component({
    selector: 'app-error-snackbar',
    imports: [
        MatSnackBarModule,
        MatButtonModule,
        MatIconModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ``,
    styles: [`
        :host {
            display: none;
        }
    `]
})
export class ErrorSnackbarComponent {
    private readonly snackBar = inject(MatSnackBar);
    private readonly errorService = inject(ErrorMessageService);

    constructor() {
        // React to error messages and show snackbar
        effect(() => {
            const error = this.errorService.currentError();
            if (error) {
                this.snackBar.open(error, 'Close', {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                });
            }
        });
    }
}
