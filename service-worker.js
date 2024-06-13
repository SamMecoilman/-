const CACHE_NAME = 'video-app-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './image.png',
  './manifest.json',
  './apple-touch-icon.png',
  './icon-192x192.png',
  './icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('Failed to cache resources:', error);
          });
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .catch(error => {
            console.error('Failed to fetch resource:', error);
          });
      })
  );
});
