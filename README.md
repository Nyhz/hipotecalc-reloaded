# Calculadora Hipotecaria España

A professional mortgage calculator for Spain with ITP calculation, taxes, and Euribor analysis built with Astro.

## 🚀 Features

- Mortgage calculator with Spanish parameters
- ITP (Property Transfer Tax) calculator
- Rental calculator
- Euribor rate tracking and charts
- Responsive design optimized for mobile and desktop
- SEO optimized with structured data
- Performance optimized with service worker
- PWA ready

## 🛠️ Tech Stack

- **Framework**: Astro 5
- **UI**: React 19 + Tailwind CSS 4
- **Charts**: ECharts
- **Icons**: Iconify
- **Deployment**: Vercel
- **Analytics**: Google Analytics 4

## 📦 Installation

```bash
npm install
```

## 🏃‍♂️ Development

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🚀 Deployment on Vercel

This project is optimized for Vercel deployment:

1. **Push to GitHub**: Make sure your code is pushed to a GitHub repository

2. **Connect to Vercel**:

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's an Astro project

3. **Environment Variables** (if needed):

   - No environment variables required for basic deployment
   - Google Analytics is configured via the GA_MEASUREMENT_ID in the code

4. **Custom Domain** (optional):
   - In Vercel dashboard, go to your project settings
   - Add your custom domain
   - Update the `site` field in `astro.config.mjs` to match your domain

## ⚡ Performance Features

- **Static Site Generation**: Pre-rendered pages for optimal performance
- **Code Splitting**: Automatic chunking for faster loading
- **Image Optimization**: Optimized images and assets
- **Compression**: Gzip/Brotli compression enabled
- **Caching**: Optimized cache headers for static assets
- **Service Worker**: Performance-focused SW for asset caching

## � PWA Features

- Offline functionality
- App-like experience on mobile devices
- Installable on devices
- Optimized manifest.json

## 🔧 Configuration

The app is pre-configured with:

- **Vercel adapter**: For seamless deployment
- **Sitemap generation**: Automatic XML sitemap
- **Compression**: CSS, HTML, and JS minification
- **Analytics**: Google Analytics 4 integration
- **Security headers**: CSRF, XSS protection

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.png
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
