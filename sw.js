const VERSION = '2.5';
const CACHE = 'liste-v' + VERSION;

const SHELL = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase & Open Food Facts: niemals cachen, Daten muessen frisch sein
  if (url.hostname.endsWith('supabase.co')) return;
  if (url.hostname.endsWith('openfoodfacts.org')) return;

  // version.json: niemals cachen, sonst findet der Update-Check nie ein Update
  if (url.pathname.endsWith('version.json')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }

  // App-Shell: erst Netz, bei Ausfall der Cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && e.request.method === 'GET') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
