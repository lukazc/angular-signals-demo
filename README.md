# 🍺 Beer Catalog - Angular Signals Demo

A modern Angular 20 application showcasing craft beers from the Punk API. Built with signal-based state management, zoneless change detection, and a dual data source architecture (API + sessionStorage).

## 🚀 Live Demo

[View Live Application](https://lukazc.github.io/angular-signals-demo/)

## ✨ Key Features

### Modern Angular Architecture
- **Zoneless Change Detection**: Built with Angular 20's experimental zoneless mode
- **Signal-Based State**: Reactive state management using Angular signals and computed values
- **Dual Data Sources**: Seamlessly switches between API calls and sessionStorage for favorites
- **Controlled Components**: All filters follow controlled component pattern (single source of truth)

### User Experience
- **Dark and Light theme**: Triggered by system preference detection
- **Responsive Design**: Mobile-first layout with adaptive grid
- **Material Design**: Custom Material theming
- **Smart Empty States**: Contextual messages based on active filters and data source
- **Advanced Filtering**: Search by name, filter by ABV range, show favorites only
- **Debounced Input**: Search (400ms) and ABV slider (300ms) debouncing

### Developer Experience
- **Comprehensive Testing**: 375+ test specs with 100% pass rate
- **Error Handling**: Global HTTP interceptor, snackbar notifications, and API retry logic (exponential backoff)
- **Type Safety**: Full TypeScript with strict mode
- **Auto-Generated Docs**: TypeDoc documentation included in deployments

## 📋 Prerequisites

**Node.js**: `^20.19.0 || ^22.12.0 || ^24.0.0`

Check your version:
```bash
node --version
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/lukazc/angular-signals-demo.git
cd angular-signals-demo

# Install dependencies
npm install

# Start development server
npm start
```

Open `http://localhost:4200/` in your browser.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
ng test --code-coverage

# Run tests once (CI mode)
ng test --watch=false --browsers=ChromeHeadless
```

**Test Coverage**: 375+ specs across all features (API, stores, components, interceptors)

## 🏗️ Building

```bash
# Development build
npm run build

# Production build
npm run build:prod
```

Build artifacts are output to the `dist/` directory.

## 📚 Documentation

TypeDoc documentation is auto-generated and deployed with the app:

```bash
# Generate docs
npm run docs

# Serve docs locally
npm run docs:serve
```

Access documentation at `/docs` in the running application or [view online](https://lukazc.github.io/angular-signals-demo/docs/).

## 🏗️ Project Structure

```
src/app/
├── components/              # UI components
│   ├── beer-card/          # Beer display card
│   ├── beer-list/          # Grid list with pagination
│   ├── beer-detail-modal/  # Material dialog with full details
│   └── filters/            # Filter components (search, ABV, sort, favorites)
├── pages/                  # Page-level components
│   └── beer-list-page/     # Main catalog page
├── services/               # Business logic
│   ├── beer-api.service.ts # Punk API integration with retry logic
│   ├── favorites.service.ts # sessionStorage management
│   └── loading.service.ts  # Global loading state
├── stores/                 # State management
│   └── beer.store.ts       # Dual-source signal store
├── interceptors/           # HTTP interceptors
│   ├── loading.interceptor.ts
│   └── error.interceptor.ts
└── models/                 # TypeScript interfaces
    └── beer.model.ts       # Beer, filters, sort types
```

## 🎯 Architectural Highlights

### Controlled Component Pattern
All filter components are controlled (receive values via `input()`, emit changes via `output()`):
- State lives in `BeerStore` (single source of truth)
- URL query params can be easily added without refactoring
- Predictable data flow: User → Component → Store → API/sessionStorage

### Error Resilience
- **Exponential Backoff**: 3 retry attempts with increasing delays (1s, 2s, 4s)
- **Global Handling**: Error interceptor shows snackbar after all retries fail
- **Graceful Degradation**: Empty states with retry buttons on failures

## 🔧 Technologies

- **Angular 20** - Framework with zoneless change detection
- **Angular Material** - UI components with custom M3 theme
- **RxJS** - Reactive programming with debouncing and retry logic
- **Punk API** - Craft beer data source (via adscanner proxy)
- **TypeScript** - Type-safe development
- **Jasmine/Karma** - Testing framework

## 🚢 Deployment

The app is automatically deployed to GitHub Pages via GitHub Actions:
- **Branch**: `main`
- **Base href**: `/angular-signals-demo/`
- **Hash routing**: Enabled for GitHub Pages compatibility

## 📝 Data Source

Beer data provided by [Punk API](https://punkapi.com/) via proxy at `https://api.adscanner.tv/punkapi/v2/`

## 🙋 Support

Questions or issues? [Open an issue](https://github.com/lukazc/angular-signals-demo/issues) on GitHub.

---

**Built with Angular 20 • Signals • Zoneless • Material Design**
