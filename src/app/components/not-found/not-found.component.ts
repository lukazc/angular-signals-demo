import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Not Found Component
 * 
 * 404 error page displayed when user navigates to an invalid route.
 * 
 * Features:
 * - Clear 404 message
 * - Link to return to home page
 * - Responsive design
 * - Friendly error illustration
 * 
 * @example
 * // In route configuration:
 * { path: '**', component: NotFoundComponent }
 */
@Component({
    selector: 'app-not-found',
    imports: [
        RouterLink,
        MatButtonModule,
        MatIconModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {}
