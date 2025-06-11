const CACHE_NAME = 'financepro-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
'https://zquias.github.io/2/',
'https://zquias.github.io/2/index.html',
  // CDN resources que são essenciais
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Instalar o Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Arquivos em cache');
        return self.skipWaiting();
      })
  );
});

// Ativar o Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativo');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Estratégia: Cache First para recursos estáticos
  if (event.request.destination === 'style' || 
      event.request.destination === 'script' || 
      event.request.destination === 'font' ||
      event.request.url.includes('cdnjs.cloudflare.com') ||
      event.request.url.includes('googleapis.com')) {
    
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            // Verificar se é uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
        })
    );
    return;
  }

  // Estratégia: Network First para o app principal
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a requisição foi bem-sucedida, cache a resposta
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tente buscar no cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Se não houver cache, retorne uma página offline simples para navegação
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// Listener para mensagens do app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sincronização em background (para futuras funcionalidades)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Sincronização em background');
    // Aqui você pode implementar sincronização de dados offline
  }
});

// Notificações push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push recebido');
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: './manifest-icon-192.png',
    badge: './manifest-icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('FinancePro', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notificação clicada');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('./')
  );
});
