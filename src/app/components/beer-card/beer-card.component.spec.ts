import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeerCardComponent } from './beer-card.component';
import { Beer } from '../../models/beer.model';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('BeerCardComponent', () => {
  let component: BeerCardComponent;
  let fixture: ComponentFixture<BeerCardComponent>;

  const mockBeer: Beer = {
    id: 1,
    name: 'Punk IPA',
    tagline: 'Post Modern Classic',
    description: 'A bold IPA',
    image_url: 'https://images.punkapi.com/v2/1.png',
    abv: 5.6,
    ibu: 60,
    target_fg: 1010,
    target_og: 1056,
    ebc: 20,
    srm: 10,
    ph: 4.4,
    attenuation_level: 82,
    volume: { value: 20, unit: 'litres' },
    boil_volume: { value: 25, unit: 'litres' },
    method: {
      mash_temp: [{ temp: { value: 65, unit: 'celsius' }, duration: 75 }],
      fermentation: { temp: { value: 19, unit: 'celsius' } },
      twist: null
    },
    ingredients: {
      malt: [{ name: 'Maris Otter', amount: { value: 3.3, unit: 'kilograms' } }],
      hops: [{ name: 'Cascade', amount: { value: 15, unit: 'grams' }, add: 'start', attribute: 'bitter' }],
      yeast: 'Wyeast 1056 - American Ale™'
    },
    food_pairing: ['Spicy carne asada'],
    brewers_tips: 'Dry hop for extra aroma',
    contributed_by: 'Sam Mason <samjbmason>',
    first_brewed: '04/2007'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeerCardComponent, NoopAnimationsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(BeerCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('beer', mockBeer);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display beer name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const name = compiled.querySelector('.beer-card__name');
    expect(name?.textContent).toContain('Punk IPA');
  });

  it('should display beer tagline', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tagline = compiled.querySelector('.beer-card__tagline');
    expect(tagline?.textContent).toContain('Post Modern Classic');
  });

  it('should display ABV', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const abv = compiled.querySelector('.beer-card__abv');
    expect(abv?.textContent).toContain('5.6% ABV');
  });

  it('should display IBU when available', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ibu = compiled.querySelector('.beer-card__ibu');
    expect(ibu?.textContent).toContain('60 IBU');
  });

  it('should display image when image_url is provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const image = compiled.querySelector('.beer-card__image') as HTMLImageElement;
    expect(image).toBeTruthy();
    expect(image.alt).toBe('Punk IPA');
  });

  it('should display placeholder when image_url is null', () => {
    const beerWithoutImage = { ...mockBeer, image_url: null };
    fixture.componentRef.setInput('beer', beerWithoutImage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const placeholder = compiled.querySelector('.beer-card__image-placeholder');
    expect(placeholder).toBeTruthy();
  });

  it('should show outlined heart when not favorite', () => {
    fixture.componentRef.setInput('isFavorite', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.beer-card__favorite-btn mat-icon');
    expect(icon?.textContent?.trim()).toBe('favorite_border');
  });

  it('should show filled heart when is favorite', () => {
    fixture.componentRef.setInput('isFavorite', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.beer-card__favorite-btn mat-icon');
    expect(icon?.textContent?.trim()).toBe('favorite');
  });

  it('should emit detailsClicked when View Details button is clicked', () => {
    let emittedBeer: Beer | undefined;
    component.detailsClicked.subscribe((beer: Beer) => {
      emittedBeer = beer;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.beer-card__details-btn') as HTMLButtonElement;
    button.click();

    expect(emittedBeer).toEqual(mockBeer);
  });

  it('should emit favoriteToggled when favorite button is clicked', () => {
    let emittedBeer: Beer | undefined;
    component.favoriteToggled.subscribe((beer: Beer) => {
      emittedBeer = beer;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.beer-card__favorite-btn') as HTMLButtonElement;
    button.click();

    expect(emittedBeer).toEqual(mockBeer);
  });

  it('should have proper ARIA labels', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const favoriteBtn = compiled.querySelector('.beer-card__favorite-btn') as HTMLButtonElement;
    const detailsBtn = compiled.querySelector('.beer-card__details-btn') as HTMLButtonElement;

    expect(favoriteBtn.getAttribute('aria-label')).toBeTruthy();
    expect(detailsBtn.getAttribute('aria-label')).toContain('View details');
  });

  it('should apply favorite class when isFavorite is true', () => {
    fixture.componentRef.setInput('isFavorite', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.beer-card');
    expect(card?.classList.contains('beer-card--favorite')).toBe(true);
  });
});
