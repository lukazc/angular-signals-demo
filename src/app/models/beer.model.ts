/**
 * Beer Model Definitions
 * 
 * Type definitions for the Punk API beer data and application state.
 * Based on API response structure from https://api.adscanner.tv/punkapi/v2/
 */

/**
 * Volume or measurement with value and unit
 */
export interface Measurement {
  value: number;
  unit: string;
}

/**
 * Temperature measurement for brewing process
 */
export interface Temperature {
  value: number;
  unit: 'celsius' | 'fahrenheit';
}

/**
 * Mash temperature step in brewing method
 */
export interface MashTemp {
  temp: Temperature;
  duration?: number | null;
}

/**
 * Fermentation details in brewing method
 */
export interface Fermentation {
  temp: Temperature;
}

/**
 * Brewing method details
 */
export interface Method {
  mash_temp?: MashTemp[];
  fermentation?: Fermentation;
  twist?: string | null;
}

/**
 * Malt ingredient
 */
export interface Malt {
  name: string;
  amount: Measurement;
}

/**
 * Hops ingredient
 */
export interface Hops {
  name: string;
  amount: Measurement;
  add: string;
  attribute: string;
}

/**
 * Beer ingredients
 */
export interface Ingredients {
  malt?: Malt[];
  hops?: Hops[];
  yeast?: string;
}

/**
 * Complete Beer object from Punk API
 * 
 * All optional fields marked with `?` as API can return null/undefined
 */
export interface Beer {
  // Core required fields
  id: number;
  name: string;
  tagline: string;
  description: string;
  image_url: string | null;
  
  // Metrics (optional as some beers may not have all data)
  abv?: number | null;
  ibu?: number | null;
  ebc?: number | null;
  srm?: number | null;
  ph?: number | null;
  attenuation_level?: number | null;
  
  // Brewing information
  first_brewed?: string;
  volume?: Measurement;
  boil_volume?: Measurement;
  
  // Nested complex types
  method?: Method;
  ingredients?: Ingredients;
  food_pairing?: string[];
  brewers_tips?: string;
  contributed_by?: string;
  
  // Target measurements
  target_fg?: number | null;
  target_og?: number | null;
}

/**
 * Sort options for beers
 */
export type BeerSortOption = 'name' | 'abv';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Filter mode - determines data source
 */
export type FilterMode = 'all' | 'favorites';

/**
 * Beer search/filter parameters for API requests
 * 
 * Note: sort_by and sort_order are shimmed for future API support
 * Currently NOT sent to API as it doesn't support sorting
 */
export interface BeerSearchParams {
  // API-supported parameters (sent to server)
  beer_name?: string;        // Partial match, use underscore for spaces
  abv_gt?: number;           // Minimum ABV (greater than)
  abv_lt?: number;           // Maximum ABV (less than)
  page?: number;             // Page number for pagination
  per_page?: number;         // Results per page (default: 25)
  
  // SHIMMED parameters for future API support (NOT sent to API yet)
  // TODO: Enable when API supports sort parameters
  sort_by?: BeerSortOption;  // Sort field ('name' | 'abv')
  sort_order?: SortDirection; // Sort direction ('asc' | 'desc')
}

/**
 * Sort configuration for client-side sorting
 */
export interface SortConfig {
  by: BeerSortOption;
  direction: SortDirection;
}

/**
 * ABV range filter
 */
export interface AbvRange {
  min: number | null;
  max: number | null;
}

/**
 * API Error response structure
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

/**
 * Rate limit information from API headers
 */
export interface RateLimitInfo {
  limit: number;      // x-ratelimit-limit header
  remaining: number;  // x-ratelimit-remaining header
}
