import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeerDetailModalComponent } from './beer-detail-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Beer } from '../../models/beer.model';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('BeerDetailModalComponent', () => {
  let component: BeerDetailModalComponent;
  let fixture: ComponentFixture<BeerDetailModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<BeerDetailModalComponent>>;

  const mockBeer: Beer = {
    id: 1,
    name: 'Punk IPA',
    tagline: 'Post Modern Classic',
    description: 'Our flagship beer that kick started the craft beer revolution. This is James and Martin\'s original take on an American IPA.',
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
      twist: 'Add honey at end of boil'
    },
    ingredients: {
      malt: [
        { name: 'Maris Otter', amount: { value: 3.3, unit: 'kilograms' } },
        { name: 'Caramalt', amount: { value: 0.2, unit: 'kilograms' } }
      ],
      hops: [
        { name: 'Cascade', amount: { value: 15, unit: 'grams' }, add: 'start', attribute: 'bitter' },
        { name: 'Centennial', amount: { value: 10, unit: 'grams' }, add: 'end', attribute: 'flavour' }
      ],
      yeast: 'Wyeast 1056 - American Ale™'
    },
    food_pairing: [
      'Spicy carne asada with a pico de gallo sauce',
      'Shredded chicken tacos with a mango chilli lime salsa',
      'Cheesecake with a passion fruit swirl'
    ],
    brewers_tips: 'Dry hop for extra aroma. Use the beer to condition the beard.',
    contributed_by: 'Sam Mason <samjbmason>',
    first_brewed: '04/2007'
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj<MatDialogRef<BeerDetailModalComponent>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [BeerDetailModalComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { beer: mockBeer } },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BeerDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject beer data', () => {
    expect(component.data).toEqual({ beer: mockBeer });
    expect(component.beer).toEqual(mockBeer);
  });

  it('should display beer name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.beer-detail__title');
    expect(title?.textContent).toContain('Punk IPA');
  });

  it('should display beer tagline', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tagline = compiled.querySelector('.beer-detail__tagline');
    expect(tagline?.textContent).toContain('Post Modern Classic');
  });

  it('should display description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const description = compiled.querySelector('.beer-detail__description');
    expect(description?.textContent).toContain('Our flagship beer');
  });

  it('should display all stats when available', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const stats = compiled.querySelectorAll('.beer-detail__stat');
    
    expect(stats.length).toBeGreaterThan(0);
    
    const statsText = Array.from(stats).map(s => s.textContent);
    expect(statsText.some(text => text?.includes('5.6%'))).toBe(true); // ABV
    expect(statsText.some(text => text?.includes('60'))).toBe(true); // IBU
  });

  it('should display food pairings', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const pairings = compiled.querySelectorAll('mat-chip');
    expect(pairings.length).toBe(3);
    expect(pairings[0].textContent?.trim()).toContain('Spicy carne asada');
  });

  it('should display malt ingredients', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ingredientLists = compiled.querySelectorAll('.beer-detail__ingredient-list');
    const maltList = ingredientLists[0]; // First list is malt
    const malts = maltList.querySelectorAll('li');
    expect(malts.length).toBe(2);
    expect(malts[0].textContent).toContain('Maris Otter');
    expect(malts[0].textContent).toContain('3.3 kilograms');
  });

  it('should display hop ingredients', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ingredientLists = compiled.querySelectorAll('.beer-detail__ingredient-list');
    const hopList = ingredientLists[1]; // Second list is hops
    const hops = hopList.querySelectorAll('li');
    expect(hops.length).toBe(2);
    expect(hops[0].textContent).toContain('Cascade');
    expect(hops[0].textContent).toContain('15 grams');
  });

  it('should display yeast', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const yeast = compiled.querySelector('.beer-detail__yeast');
    
    expect(yeast?.textContent).toContain('Wyeast 1056');
  });

  it('should display brewers tips', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tips = compiled.querySelector('.beer-detail__tips');
    expect(tips?.textContent).toContain('Dry hop for extra aroma');
  });



  it('should close dialog when close button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const closeButton = compiled.querySelector('.beer-detail__close-btn') as HTMLButtonElement;
    
    closeButton.click();
    
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should display image when image_url is provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const image = compiled.querySelector('.beer-detail__image') as HTMLImageElement;
    
    expect(image).toBeTruthy();
    expect(image.alt).toBe('Punk IPA');
  });

  it('should display placeholder when image_url is null', async () => {
    const beerWithoutImage = { ...mockBeer, image_url: null };
    
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [BeerDetailModalComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { beer: beerWithoutImage } },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();
    
    const newFixture = TestBed.createComponent(BeerDetailModalComponent);
    newFixture.detectChanges();
    
    const compiled = newFixture.nativeElement as HTMLElement;
    const placeholder = compiled.querySelector('.beer-detail__image-placeholder');
    
    expect(placeholder).toBeTruthy();
  });

  it('should not display stats that are null', async () => {
    const beerWithoutIbu = { ...mockBeer, ibu: null };
    
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [BeerDetailModalComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { beer: beerWithoutIbu } },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();
    
    const newFixture = TestBed.createComponent(BeerDetailModalComponent);
    newFixture.detectChanges();
    
    const compiled = newFixture.nativeElement as HTMLElement;
    const stats = Array.from(compiled.querySelectorAll('.beer-detail__stat'));
    const ibuStat = stats.find(s => s.textContent?.includes('IBU'));
    
    expect(ibuStat).toBeFalsy();
  });

  it('should display first brewed date', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const firstBrewed = compiled.querySelector('.beer-detail__first-brewed');
    
    expect(firstBrewed?.textContent).toContain('04/2007');
  });
});
