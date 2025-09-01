const CACHE_NAME = 'trip-management-v1';
const STATIC_CACHE_NAME = 'trip-static-v1';
const DYNAMIC_CACHE_NAME = 'trip-dynamic-v1';

// キャッシュするリソース
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // 基本的なアセット
  '/assets/index.css',
  '/assets/index.js'
];

// 地図タイルや外部APIはキャッシュしない
const EXCLUDE_FROM_CACHE = [
  'openstreetmap.org',
  'openrouteservice.org',
  'overpass-api.de'
];

// インストール時の処理
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => {
        console.log('Service Worker: Cache failed', err);
      })
  );
});

// アクティベート時の処理
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// フェッチ時の処理
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 外部API（地図タイルなど）はキャッシュしない
  if (EXCLUDE_FROM_CACHE.some(domain => url.hostname.includes(domain))) {
    return fetch(request);
  }
  
  // HTML リクエストの場合
  if (request.destination === 'document') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then(fetchResponse => {
              return caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => {
                  cache.put(request, fetchResponse.clone());
                  return fetchResponse;
                });
            });
        })
        .catch(() => {
          // オフライン時のフォールバック
          return caches.match('/');
        })
    );
    return;
  }
  
  // その他のリソース
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then(fetchResponse => {
            // 有効なレスポンスのみキャッシュ
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseClone);
                });
            }
            return fetchResponse;
          })
          .catch(() => {
            // オフライン時の基本的なフォールバック
            if (request.destination === 'image') {
              return new Response('', { status: 200 });
            }
          });
      })
  );
});

// プッシュ通知（将来の機能拡張用）
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.url
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 通知クリック時の処理
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});