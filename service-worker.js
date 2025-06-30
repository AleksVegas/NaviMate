const CACHE_NAME = 'vessels-meeting-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',        // офлайн-страница
  '/css/style.css',
  '/js/script.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Установка: кэшируем файлы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // активировать сразу
  );
});

// Активация: удаляем старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // брать контроль
  );
});

// Обработка fetch-запросов
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // Навигация (загрузка страницы)
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Обновляем кеш
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request)
          .then(cachedResp => cachedResp || caches.match('/offline.html'))
        )
    );
  } else {
    // Другие запросы (ресурсы)
    event.respondWith(
      caches.match(event.request).then(cachedResp => cachedResp || fetch(event.request))
    );
  }
});
