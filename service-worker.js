const CACHE_NAME = 'yks-assistant-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css' // Eğer ayrı style.css varsa, ama inline
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Bildirim kontrolü başlat
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ===== BİLDİRİM SİSTEMİ =====
// Her 2 saatte bir bildirim kontrolü yap
setInterval(() => {
  checkAndSendNotifications();
}, 7200000); // 2 saat

// Sayfa açıldığında bildirim kontrolü yap
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_NOTIFICATIONS') {
    checkAndSendNotifications();
  }
});

// Bildirim kontrolü ve gönderme fonksiyonu
function checkAndSendNotifications() {
  try {
    // localStorage'dan verileri oku
    const targetsData = localStorage.getItem('yksTargets');
    const loginDatesData = localStorage.getItem('yksLoginDates');
    
    const targets = targetsData ? JSON.parse(targetsData) : [];
    const loginDates = loginDatesData ? JSON.parse(loginDatesData) : [];
    
    processUserDataAndNotify({ 
      dailyGoals: targets,
      loginDates: loginDates
    });
  } catch (error) {
    console.log('Bildirim kontrolü hatası:', error);
  }
}

// Kullanıcı verisi işle ve bildirim gönder
function processUserDataAndNotify(userData) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Her gün 18:00'de bildirim gönder
  if (currentHour === 18 && currentMinute < 5) {
    // Tamamlanmamış hedefler var mı kontrol et
    const dailyGoals = userData.dailyGoals || [];
    const incompleteTasks = dailyGoals.filter(goal => !goal.completed).length;
    
    if (incompleteTasks > 0) {
      self.registration.showNotification('YKS Asistanı - Günlük Hedefler', {
        body: incompleteTasks + ' tane tamamlanmamış hedefiniz var. Hedefleri tamamlamayı unutmayın!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231e40af" width="192" height="192"/><text x="50%" y="50%" font-size="80" fill="white" text-anchor="middle" dy=".3em">YKS</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="64" fill="%231e40af"/><text x="50%" y="50%" font-size="60" fill="white" text-anchor="middle" dy=".35em">!</text></svg>',
        tag: 'daily-goals',
        requireInteraction: true
      });
    }
  }
  
  // 2 gün üst üste girmezse uyarı gönder
  if (userData.loginDates && userData.loginDates.length >= 2) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const hasLoginToday = userData.loginDates.includes(today);
    const hasLoginYesterday = userData.loginDates.includes(yesterday);
    
    // Eğer bugün ve dün girmemişse (2 gün üst üste)
    if (!hasLoginToday && !hasLoginYesterday) {
      self.registration.showNotification('YKS Asistanı - Geri Dön!', {
        body: '2 gündür giriş yapmadınız. Hedefinize dönemek için hemen uygulamayı aç!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23ef476f" width="192" height="192"/><text x="50%" y="50%" font-size="100" fill="white" text-anchor="middle" dy=".25em">⚠</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="64" fill="%23ef476f"/><text x="50%" y="50%" font-size="80" fill="white" text-anchor="middle" dy=".35em">!</text></svg>',
        tag: 'missed-days',
        requireInteraction: true
      });
    }
  }
}

// Bildirim tıklanma olayı
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});