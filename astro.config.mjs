// @ts-check
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"
import compress from "astro-compress"
import sitemap from "@astrojs/sitemap"
import vercel from "@astrojs/vercel"

import icon from "astro-icon"

import react from "@astrojs/react"

// https://astro.build/config
export default defineConfig({
  site: "https://hipotecalc.com", // Replace with your actual domain
  output: "static",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-echarts": ["echarts", "echarts-for-react"],
            "vendor-icons": ["@iconify/react"],
          },
        },
      },
    },
  },

  integrations: [
    icon(),
    react(),
    sitemap(),
    compress({
      CSS: true,
      HTML: true,
      Image: false,
      JavaScript: true,
      SVG: true,
    }),
  ],
})
