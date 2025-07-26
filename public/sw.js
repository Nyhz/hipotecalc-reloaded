const CACHE_NAME = "hipotecalc-performance-v1"
const STATIC_CACHE = "hipotecalc-static-v1"
const DYNAMIC_CACHE = "hipotecalc-dynamic-v1"

// Resources to cache for performance (NO PWA functionality)
const urlsToCache = [
  "/",
  "/calculadora-hipotecaria",
  "/favicon.svg",
  "/og-image.svg",
]

// Performance-focused caching patterns
const performanceCachePatterns = [
  /\/_astro\/.*\.(js|css)$/, // Astro bundles
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/, // Images
  /\/fonts\//, // Fonts
]

// Install event - Cache critical resources for performance
self.addEventListener("install", (event) => {
  console.log("SW: Installing for performance optimization...")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("SW: Caching static resources for faster loading")
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log("SW: Performance optimization ready")
        // Don't skip waiting to avoid bfcache issues
        return Promise.resolve()
      })
  )
})

// Activate event - Clean old performance caches
self.addEventListener("activate", (event) => {
  console.log("SW: Activating performance optimizations...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old performance caches
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log(
                "SW: Cleaning old cache for better performance:",
                cacheName
              )
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log("SW: Performance optimizations active")
        // Don't claim clients immediately to avoid bfcache issues
        return Promise.resolve()
      })
  )
})

// Performance-focused fetch strategy (NO offline-first PWA behavior)
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests for performance
  if (url.origin !== location.origin) {
    return
  }

  // Performance-first strategy: Always try network, fallback to cache
  if (request.destination === "document") {
    // HTML pages: Network-first for fresh content, cache for performance
    event.respondWith(networkFirstPerformance(request))
  } else if (
    performanceCachePatterns.some((pattern) => pattern.test(url.pathname))
  ) {
    // Static assets: Cache-first for instant loading
    event.respondWith(cacheFirstPerformance(request))
  } else {
    // Default: Network-first with performance cache
    event.respondWith(networkFirstPerformance(request))
  }
})

// Network-first for performance (NOT offline-first)
async function networkFirstPerformance(request) {
  try {
    // Always try network first for fresh content
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Cache successful responses for performance
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Only use cache if network fails (for performance, not offline)
    console.log("SW: Network failed, using cached version for performance")
    const cachedResponse = await caches.match(request)
    return (
      cachedResponse ||
      new Response("Network error - content not cached", {
        status: 503,
        statusText: "Service Unavailable",
      })
    )
  }
}

// Cache-first for static assets (performance optimization)
async function cacheFirstPerformance(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    // Return cached version immediately for performance
    return cachedResponse
  }

  try {
    // If not cached, fetch and cache for future performance
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log("SW: Asset not available and not cached:", request.url)
    return new Response("Asset not available", { status: 404 })
  }
}

// Handle messages (for performance updates only)
self.addEventListener("message", (event) => {
  console.log("SW: Performance message received:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "GET_PERFORMANCE_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

console.log("SW: Performance Service Worker loaded - Version", CACHE_NAME)
