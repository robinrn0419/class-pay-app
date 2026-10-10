// 課堂薪水：離線快取。更新 index.html 後，把下面的版本號加一，手機第二次打開就會換成新版。
var VERSION = 'class-pay-v12';
var CORE = ['./', 'index.html', 'icon.png', 'manifest.webmanifest'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSION).then(function (cache) {
      return cache.match(e.request, { ignoreSearch: e.request.mode === 'navigate' }).then(function (hit) {
        // 有快取就先用快取，同時在背景抓新版；沒網路時抓取失敗也不影響使用
        var fresh = fetch(e.request).then(function (res) {
          if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
          return res;
        }).catch(function () { return hit || (e.request.mode === 'navigate' ? cache.match('index.html') : undefined); });
        return hit || fresh;
      });
    })
  );
});
