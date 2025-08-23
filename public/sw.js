// Service Worker for Personal Blog PWA
// Version 1.0.0

const CACHE_NAME = 'personal-blog-v1';
const CACHE_VERSION = '1.0.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic-${CACHE_VERSION}`;
const API_CACHE_NAME = `${CACHE_NAME}-api-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/_next/static/css/',
  '/_next/static/js/'
];

// API routes to cache
const API_ROUTES = [
  '/api/health',
  '/api/portfolio',
  '/api/services',
  '/api/categories'
];

// Routes that should always be fetched from network
const NETWORK_ONLY_ROUTES = [
  '/api/auth/',
  '/api/admin/',
  '/api/monitoring/',
  '/api/csrf'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => !url.includes('_next')));
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.includes(CACHE_NAME) && 
                !cacheName.includes(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (unless API)
  if (url.origin !== self.location.origin && !isApiRequest(request)) {
    return;
  }
  
  // Handle different types of requests
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Handle API requests
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Network-only routes (auth, admin, etc.)
  if (NETWORK_ONLY_ROUTES.some(route => url.pathname.startsWith(route))) {
    return handleNetworkOnly(request);
  }
  
  // Cacheable API routes
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    return handleNetworkFirst(request, API_CACHE_NAME);
  }
  
  // Default to network-only for other APIs
  return handleNetworkOnly(request);
}

// Handle static assets (CSS, JS, images)
async function handleStaticAsset(request) {
  // Use cache-first strategy for static assets
  return handleCacheFirst(request, STATIC_CACHE_NAME);
}

// Handle page requests (HTML pages)
async function handlePageRequest(request) {
  // Use network-first strategy for pages
  return handleNetworkFirst(request, DYNAMIC_CACHE_NAME);
}

// Handle other dynamic requests
async function handleDynamicRequest(request) {
  // Use stale-while-revalidate for dynamic content
  return handleStaleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
}

// Cache-first strategy
async function handleCacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first error:', error);
    return getOfflineResponse(request);
  }
}

// Network-first strategy
async function handleNetworkFirst(request, cacheName) {
  try {
    console.log('[SW] Network first:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineResponse(request);
  }
}

// Stale-while-revalidate strategy
async function handleStaleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch new version in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cache
    return cachedResponse;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('[SW] Serving from cache, updating in background:', request.url);
    return cachedResponse;
  }
  
  // Wait for network if no cache
  console.log('[SW] No cache, waiting for network:', request.url);
  return fetchPromise;
}

// Network-only strategy
async function handleNetworkOnly(request) {
  try {
    console.log('[SW] Network only:', request.url);
    return await fetch(request);
  } catch (error) {
    console.error('[SW] Network-only error:', error);
    return getOfflineResponse(request);
  }
}

// Get offline response
function getOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Return offline page for HTML requests
  if (request.headers.get('accept')?.includes('text/html')) {
    return caches.match('/offline') || new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  // Return error for API requests
  if (isApiRequest(request)) {
    return new Response(
      JSON.stringify({ 
        error: 'Network unavailable', 
        offline: true,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Return generic offline response
  return new Response('Offline', { status: 503 });
}

// Helper functions
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/_next/') ||
         url.pathname.startsWith('/icons/') ||
         url.pathname.startsWith('/images/') ||
         url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isPageRequest(request) {
  const url = new URL(request.url);
  return request.headers.get('accept')?.includes('text/html') &&
         !url.pathname.startsWith('/api/') &&
         !isStaticAsset(request);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when connection is restored
  console.log('[SW] Performing background sync...');
  
  try {
    // Sync any pending offline actions
    // This could include form submissions, analytics, etc.
    
    // Notify clients that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notifications (if enabled)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'notification',
    data: data.data,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Handle action clicks
  if (event.action) {
    console.log('[SW] Notification action:', event.action);
    // Handle specific actions
  } else {
    // Open the app
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        } else {
          return self.clients.openWindow('/');
        }
      })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_VERSION,
      cacheName: CACHE_NAME
    });
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(STATIC_CACHE_NAME),
        caches.delete(DYNAMIC_CACHE_NAME),
        caches.delete(API_CACHE_NAME)
      ]).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('[SW] Service worker script loaded');