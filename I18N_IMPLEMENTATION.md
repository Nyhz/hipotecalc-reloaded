# Internationalization (i18n) Implementation

## Overview

This project has been successfully configured with a custom internationalization system supporting Spanish (default) and English languages.

## Features Implemented

### ✅ Language Support
- **Spanish (es)**: Default language, served from root URLs
- **English (en)**: Secondary language, served from `/en/` prefixed URLs

### ✅ URL Structure
- **Spanish URLs** (no prefix):
  - `/` - Home page
  - `/calculadora-hipotecaria` - Mortgage calculator
  - `/calculadora-alquiler` - Rental calculator

- **English URLs** (with `/en/` prefix):
  - `/en/` - Home page
  - `/en/mortgage-calculator` - Mortgage calculator
  - `/en/rental-calculator` - Rental calculator

### ✅ Language Switcher
- Minimalist button in the top navigation bar
- Shows "EN" when on Spanish pages, "ES" when on English pages
- Automatically redirects to the equivalent page in the other language
- Maintains the same page structure and functionality

### ✅ SEO Optimization
- Proper `lang` attribute on HTML elements
- Correct Open Graph locale tags
- Translated meta titles, descriptions, and keywords
- Language-specific structured data

## File Structure

```
src/
├── messages/
│   ├── es.json          # Spanish translations
│   └── en.json          # English translations
├── utils/
│   └── i18n.ts          # Custom i18n utility functions
├── pages/
│   ├── index.astro      # Spanish home page
│   ├── calculadora-hipotecaria.astro
│   ├── calculadora-alquiler.astro
│   └── en/
│       ├── index.astro  # English home page
│       ├── mortgage-calculator.astro
│       └── rental-calculator.astro
├── components/
│   ├── LanguageSwitcher.tsx
│   └── Navbar.tsx       # Updated with language switcher
└── constants/
    └── tools.ts         # Updated with language-aware navigation
```

## Key Components

### 1. Translation Files (`src/messages/`)
- **es.json**: Contains all Spanish text content
- **en.json**: Contains all English text content
- Organized by sections: nav, home, mortgage, rental, common, seo

### 2. i18n Utility (`src/utils/i18n.ts`)
- `t(key, lang)`: Translation function
- `getCurrentLang(pathname)`: Detect current language from URL
- `getAlternatePath(pathname)`: Get equivalent URL in other language
- `getAlternateLang(currentLang)`: Get opposite language

### 3. Language Switcher (`src/components/LanguageSwitcher.tsx`)
- React component that detects current language
- Provides toggle functionality
- Redirects to equivalent page in other language

### 4. Updated Navigation (`src/components/Navbar.tsx`)
- Language-aware navigation links
- Integrates language switcher
- Updates navigation based on current language

## Usage Examples

### In Astro Pages
```astro
---
import { t } from '../utils/i18n';
---

<Layout 
  title={t('seo.home.title', 'en')}
  description={t('seo.home.description', 'en')}
>
  <h1>{t('home.hero.title', 'en')}</h1>
</Layout>
```

### In React Components
```tsx
import { getCurrentLang, getAlternatePath } from '../utils/i18n';

const currentLang = getCurrentLang(window.location.pathname);
const alternatePath = getAlternatePath(window.location.pathname);
```

## Translation Keys Structure

```json
{
  "nav": {
    "brand": "Hipotecalc",
    "mortgageCalculator": "Calculadora Hipotecaria",
    "rentalCalculator": "Calculadora de Alquiler"
  },
  "home": {
    "hero": {
      "title": "Calculadora Hipotecaria",
      "description": "Herramientas profesionales..."
    }
  },
  "seo": {
    "home": {
      "title": "Calculadora Hipotecaria España...",
      "description": "Calculadora hipotecaria profesional...",
      "keywords": "calculadora hipoteca españa..."
    }
  }
}
```

## Benefits

1. **SEO Friendly**: Proper language detection and meta tags
2. **User Experience**: Seamless language switching
3. **Maintainable**: Centralized translation management
4. **Performance**: Static generation for all language variants
5. **Accessibility**: Proper lang attributes and ARIA labels

## Future Enhancements

- Add more languages (Catalan, French, etc.)
- Implement language detection based on browser preferences
- Add language-specific date and number formatting
- Implement translation memory for consistency

## Testing

All pages have been tested and verified to work correctly:
- ✅ Spanish home page (`/`)
- ✅ English home page (`/en/`)
- ✅ Spanish mortgage calculator (`/calculadora-hipotecaria`)
- ✅ English mortgage calculator (`/en/mortgage-calculator`)
- ✅ Spanish rental calculator (`/calculadora-alquiler`)
- ✅ English rental calculator (`/en/rental-calculator`)
- ✅ Language switcher functionality
- ✅ Navigation links in both languages
- ✅ SEO meta tags in both languages
- ✅ Complete content translation (Hero, Tools, Footer, Contact buttons)
- ✅ Dynamic language detection and switching
- ✅ Proper HTML lang attributes and Open Graph locales
- ✅ Mortgage calculator form labels (Property details, Taxes and costs, Financing and conditions)
- ✅ Translation system for React components (useTranslations hook)
- ✅ Mortgage calculator form fields (TAE, TIN, Differential, Loan term, etc.)
- ✅ Mortgage calculator results section (Monthly payment, Historical scenarios, Mortgage information)
- ✅ Sensitivity table component (Analysis title, step inputs, table headers)
- ✅ Variable interest scenarios table
- ✅ Mortgage summary charts (property cost breakdown, mortgage cost breakdown)
- ✅ ITP Modal (partial - title and property information section)
- ✅ Rental Calculator (partial - form fields and basic structure)
- ✅ Dropdown options (Comunidad Autónoma, property types)
