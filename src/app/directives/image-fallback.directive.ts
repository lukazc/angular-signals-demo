import { Directive, ElementRef, HostListener, input, Renderer2 } from '@angular/core';

/**
 * Image Fallback Directive
 * 
 * Automatically replaces failed image loads with a fallback image.
 * Useful for handling missing beer images from the API.
 * 
 * Features:
 * - Listens for image load errors
 * - Swaps to fallback image on error
 * - Prevents infinite error loops
 * - Configurable fallback path
 * 
 * @example
 * <img [src]="beer.image_url" appImageFallback />
 * 
 * @example
 * <img [src]="beer.image_url" [appImageFallback]="'./custom-fallback.png'" />
 */
@Directive({
    selector: 'img[appImageFallback]',
    standalone: true
})
export class ImageFallbackDirective {
    /** Fallback image path (default: beer placeholder in public folder) */
    appImageFallback = input<string, string>('./fallback_beer.png', {
        transform: (value: string) => value || './fallback_beer.png'
    });
    
    /** Track if fallback has been applied to prevent infinite error loops */
    private hasFallbackApplied = false;
    
    constructor(
        private el: ElementRef<HTMLImageElement>,
        private renderer: Renderer2
    ) {}
    
    /**
     * Handle image load error event
     * Replaces failed image with fallback using Renderer2 for proper Angular integration
     */
    @HostListener('error')
    onError(): void {
        // Prevent infinite loop if fallback image also fails
        if (this.hasFallbackApplied) {
            console.warn('Fallback image failed to load:', this.appImageFallback());
            return;
        }
        
        const img = this.el.nativeElement;
        // Use Renderer2 to set the src property - integrates with Angular's rendering system
        this.renderer.setProperty(img, 'src', this.appImageFallback());
        this.hasFallbackApplied = true;
    }
}
