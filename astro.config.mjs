// @ts-check
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"
import compress from "astro-compress"
import sitemap from "@astrojs/sitemap"
import vercel from "@astrojs/vercel"


import icon from "astro-icon"

import react from "@astrojs/react"
import keystatic from "@keystatic/astro"

// El panel de Keystatic (/keystatic) solo existe en desarrollo: el sitio de
// producción es 100% estático y los artículos se publican desde los .md del
// repo. Así evitamos necesitar SSR y la incompatibilidad peer con Astro 7.
const isDev = process.env.NODE_ENV !== "production"

// https://astro.build/config
export default defineConfig({
  // www + sin barra final: debe coincidir EXACTAMENTE con cómo sirve Vercel
  // (hipotecalc.com redirige a www; /pagina/ redirige a /pagina), para que
  // canonical, sitemap y hreflang no apunten a URLs que redirigen.
  site: "https://www.hipotecalc.com",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  output: "static",
  adapter: vercel({
    webAnalytics: {
      enabled: false,
    },
  }),
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: "terser",
      sourcemap: false,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          // Rolldown (Vite en Astro 7) solo acepta manualChunks como función
          manualChunks(id) {
            if (!id.includes("node_modules")) return
            if (id.includes("echarts")) return "vendor-echarts"
            if (id.includes("@iconify")) return "vendor-icons"
            if (id.includes("react-dom") || id.includes("/react/")) return "vendor-react"
          },
        },
      },
    },
  },

  integrations: [
    icon(),
    react(),
    sitemap(),
    ...(isDev ? [keystatic()] : []),

    compress({
      // csso descarta los bloques `@media (width >= ...)` (sintaxis de rango
      // de Tailwind 4): la web perdía TODAS las variantes responsive en
      // producción. Vite ya minifica el CSS, este paso era redundante.
      CSS: false,
      // html-minifier-terser colapsa espacios dentro del HTML de las islas
      // React y provoca errores de hidratación (#418); Astro ya minifica el
      // HTML de forma segura con compressHTML.
      HTML: false,
      Image: false,
      JavaScript: true,
      SVG: true,
    }),
  ],
})
