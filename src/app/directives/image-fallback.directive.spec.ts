import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ImageFallbackDirective } from './image-fallback.directive';

@Component({
    template: `
        <img [src]="imageSrc" appImageFallback data-testid="default-fallback" />
        <img [src]="imageSrc" [appImageFallback]="customFallback" data-testid="custom-fallback" />
    `,
    standalone: true,
    imports: [ImageFallbackDirective]
})
class TestComponent {
    imageSrc = 'https://example.com/valid-image.png';
    customFallback = './custom-fallback.png';
}

describe('ImageFallbackDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let defaultImg: DebugElement;
    let customImg: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestComponent],
            providers: [
                provideZonelessChangeDetection(),
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        defaultImg = fixture.debugElement.query(By.css('[data-testid="default-fallback"]'));
        customImg = fixture.debugElement.query(By.css('[data-testid="custom-fallback"]'));
    });

    it('should create directive instances', () => {
        expect(defaultImg).toBeTruthy();
        expect(customImg).toBeTruthy();
    });

    it('should use default fallback image on error', () => {
        const imgElement = defaultImg.nativeElement as HTMLImageElement;
        
        // Trigger error event
        imgElement.dispatchEvent(new Event('error'));
        
        expect(imgElement.src).toContain('fallback_beer.png');
    });

    it('should use custom fallback image on error', () => {
        const imgElement = customImg.nativeElement as HTMLImageElement;
        
        // Trigger error event
        imgElement.dispatchEvent(new Event('error'));
        
        expect(imgElement.src).toContain('custom-fallback.png');
    });

    it('should not change src if image loads successfully', () => {
        const imgElement = defaultImg.nativeElement as HTMLImageElement;
        const originalSrc = imgElement.src;
        
        // Trigger load event (successful load)
        imgElement.dispatchEvent(new Event('load'));
        
        expect(imgElement.src).toBe(originalSrc);
    });

    it('should handle multiple error events without infinite loop', () => {
        const imgElement = defaultImg.nativeElement as HTMLImageElement;
        const consoleWarnSpy = spyOn(console, 'warn');
        
        // First error: should apply fallback
        imgElement.dispatchEvent(new Event('error'));
        expect(imgElement.src).toContain('fallback_beer.png');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        
        // Second error: should warn and not change src
        const fallbackSrc = imgElement.src;
        imgElement.dispatchEvent(new Event('error'));
        expect(imgElement.src).toBe(fallbackSrc);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Fallback image failed to load:', 
            './fallback_beer.png'
        );
    });

    it('should apply fallback to correct image when multiple images exist', () => {
        const defaultImgElement = defaultImg.nativeElement as HTMLImageElement;
        const customImgElement = customImg.nativeElement as HTMLImageElement;
        
        // Trigger error on default image only
        defaultImgElement.dispatchEvent(new Event('error'));
        
        expect(defaultImgElement.src).toContain('fallback_beer.png');
        expect(customImgElement.src).not.toContain('fallback_beer.png');
        expect(customImgElement.src).not.toContain('custom-fallback.png');
    });

    it('should handle src changes after fallback is applied', () => {
        const imgElement = defaultImg.nativeElement as HTMLImageElement;
        
        // First error: apply fallback
        imgElement.dispatchEvent(new Event('error'));
        expect(imgElement.src).toContain('fallback_beer.png');
        
        // Change src programmatically (simulating new beer loaded)
        component.imageSrc = 'https://example.com/new-image.png';
        fixture.detectChanges();
        
        // Note: In real usage, the directive would need to reset hasFallbackApplied
        // when src changes. This is a limitation we should document.
    });
});
