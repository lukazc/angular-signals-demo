import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingBarComponent } from './components/loading-bar/loading-bar.component';
import { ErrorSnackbarComponent } from './components/error-snackbar/error-snackbar.component';

/**
 * App Component
 * 
 * Root component of the application.
 * Provides the router outlet and global UI elements.
 * 
 * Features:
 * - Router outlet for page navigation
 * - Global loading indicator (top progress bar)
 * - Global error notifications (snackbar)
 * - Minimal layout - delegates to page components
 * 
 * Architecture:
 * - Zoneless change detection
 * - Signal-based state management
 * - OnPush change detection strategy
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LoadingBarComponent,
    ErrorSnackbarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
