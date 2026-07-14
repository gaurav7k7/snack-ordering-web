const CACHE_NAME = 'snackco-shell-v2';
const SHELL_ASSETS = ['/', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Navigations (the SPA shell HTML) are network-first — the cached copy is only
// an offline fallback, never served ahead of a fresh fetch. Otherwise, a visitor
// whose browser cached an older build's index.html would keep requesting that
// build's content-hashed JS/CSS filenames after a new deploy removes them,
// producing 404s and a blank page. Actual static assets (hashed by Vite, so a
// given filename's content never changes) stay cache-first for speed.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.url.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', responseClone));
          return response;
        })
        .catch(() => caches.match('/')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => cached)),
  );
});

// Push-notification-ready scaffolding — no backend web-push integration wired up yet.
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = { title: 'SnackCo', body: 'You have a new update.' };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/'));
});
