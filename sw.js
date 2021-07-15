const productionUrl = 'groceries.valterbarros.com';
var cacheName = 'shell-content6';
var filesToCache = [
  'index.html',
  'index.js',
  'index.0f132b6c.css',
  'new-buy.86d78b28.css',
  'new-buy.js',
  'new-buy.css',
  '/images/icons-192.png',
  '/images/icons-512.png',
  '/',
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', async function(event) {
  event.respondWith(
    caches.open(cacheName).then(async (cache) => {
      const response = await cache.match(event.request)
      // Cache hit - return response
      if (response && location.origin.includes(productionUrl)) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('activate');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cName) {
          if (cacheName.indexOf(cName) === -1) {
            return caches.delete(cName);
          }
        })
      );
    })
  );
});

self.addEventListener('message', function(event) {
  console.log(event.data);
  event.source.postMessage('new message again 2')
});
