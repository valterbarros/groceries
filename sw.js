var cacheName = 'shell-content2';
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

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(async function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('message', function(event) {
  console.log(event.data);
  event.source.postMessage('new message again 2')
});
