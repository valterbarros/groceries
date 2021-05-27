var cacheName = 'shell-content';
var filesToCache = [
  '/images/icons-192.png',
  '/images/icons-512.png',
  '/'
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
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
})

self.addEventListener('message', function(event) {
  console.log(event.data);
  event.source.postMessage('new message again 2')
})