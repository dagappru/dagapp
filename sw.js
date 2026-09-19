// 1. Подключаем Workbox локально (используем ваш файл из репозитория)
importScripts('./workbox-6829fd8d.js');

if (workbox) {
  console.log('Workbox успешно загружен!');

  // Устанавливаем префикс кэша, чтобы он не конфликтовал с другими сайтами на github.io
  workbox.core.setCacheNameDetails({
    prefix: 'dagapp',
    suffix: 'v1',
    precache: 'install-time',
    runtime: 'run-time'
  });

  // 2. Стратегия для стилей, скриптов и манифеста (Кэшируем и обновляем в фоне)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' || 
                     request.destination === 'style' || 
                     request.destination === 'manifest',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'dagapp-assets',
    })
  );

  // 3. Стратегия для картинок и иконок
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'dagapp-images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // Кэшируем на 30 дней
        }),
      ],
    })
  );

  // 4. Оффлайн-навигация для index.html (работает в подпапке /dagapp/)
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'dagapp-html',
      networkTimeoutSeconds: 3, // Если сеть тупит больше 3 секунд — отдаем кэш
    })
  );

} else {
  console.error('Не удалось загрузить Workbox 😢');
}

// Автоматическая активация нового воркера без ожидания закрытия вкладок
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
