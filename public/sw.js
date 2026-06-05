const CACHE_VERSION = 'v3'
const CACHE_NAME = `food-map-${CACHE_VERSION}`

// Dedicated cache for county-level GeoJSON from DataV CDN
const COUNTY_GEOJSON_CACHE_VERSION = 'v1'
const COUNTY_GEOJSON_CACHE = `food-map-county-geojson-${COUNTY_GEOJSON_CACHE_VERSION}`
const MAX_COUNTY_CACHE_ENTRIES = 30

const APP_SHELL = [
  '/',
  '/index.html',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json',
]

const MAX_CACHE_ENTRIES = 50

// Install: pre-cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

// Activate: delete old caches and notify clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== COUNTY_GEOJSON_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()).then(() =>
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }))
      })
    )
  )
})

/** Evict oldest entries if cache exceeds MAX_CACHE_ENTRIES */
async function enforceCacheLimit(cacheName) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > MAX_CACHE_ENTRIES) {
    const toEvict = keys.length - MAX_CACHE_ENTRIES
    for (let i = 0; i < toEvict; i++) {
      await cache.delete(keys[i])
    }
  }
}

/** Network-first strategy with cache fallback */
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    // Cache API only supports GET requests
    if (response && response.status === 200 && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
      await enforceCacheLimit(CACHE_NAME)
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    throw new Error('Network and cache both failed')
  }
}

/** Cache-first strategy */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.status === 200 && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
      await enforceCacheLimit(CACHE_NAME)
    }
    return response
  } catch {
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  }
}

/**
 * Cache-first with LRU eviction for county GeoJSON data.
 * On cache hit, re-inserts the entry to mark it as most-recently-used
 * (Cache API preserves insertion order, so delete + put moves it to the end).
 * On cache miss, fetches from network, caches, and evicts oldest if over limit.
 * Returns an offline error response if both cache and network fail.
 */
async function countyGeoJsonCacheFirst(request) {
  const cache = await caches.open(COUNTY_GEOJSON_CACHE)
  const cached = await cache.match(request)
  if (cached) {
    // Re-insert to mark as most recently used (LRU touch)
    try {
      await cache.put(request, cached.clone())
    } catch {
      // LRU touch failed; return cached anyway
    }
    return cached
  }

  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      await cache.put(request, response.clone())
      // Evict oldest entries if over limit (FIFO on remaining keys = LRU eviction)
      const keys = await cache.keys()
      if (keys.length > MAX_COUNTY_CACHE_ENTRIES) {
        const toEvict = keys.length - MAX_COUNTY_CACHE_ENTRIES
        for (let i = 0; i < toEvict; i++) {
          await cache.delete(keys[i])
        }
      }
    }
    return response
  } catch {
    // Offline and cache miss — return a meaningful error
    return new Response(
      JSON.stringify({ error: 'offline', message: 'County map data unavailable offline. Please connect to the internet and try again.' }),
      { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    )
  }
}

/** Return a basic offline HTML response */
function offlineFallback() {
  return new Response(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your network connection and try again.</p></body></html>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

// Fetch: route-based strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Navigation requests: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request).catch(() =>
        caches.match('/index.html').then(cached => cached || offlineFallback())
      )
    )
    return
  }

  // Supabase API responses: network-first with cache fallback
  if (url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request).catch(() =>
      new Response(JSON.stringify({ error: 'offline', message: 'Network unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    ))
    return
  }

  // DataV county GeoJSON (bound/*_full.json): dedicated LRU cache
  if (url.hostname.includes('datav') && url.pathname.includes('areas_v3/bound/') && url.pathname.endsWith('_full.json')) {
    event.respondWith(countyGeoJsonCacheFirst(request))
    return
  }

  // DataV GeoJSON and provincePaths.json: cache-first (static data)
  if (url.pathname.includes('geojson') || url.pathname.includes('provincePaths.json') || url.hostname.includes('datav')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Default: cache-first for static assets
  event.respondWith(cacheFirst(request))
})
