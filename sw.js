const CACHE_NAME='girisim-sehri-v180';
const CORE=[
  './',
  './index.html',
  './styles.css?v=180',
  './bootstrap.js?v=180',
  './app.js?v=180',
  './v167.js?v=180',
  './v169.js?v=180',
  './loan-management.js?v=180',
  './realtime-finance.js?v=180',
  './state-integrity.js?v=180',
  './company-list-fix.js?v=180',
  './demo-balance-grant.js?v=180',
  './investment-visibility.js?v=180',
  './manifest.webmanifest',
  './content-1.html?v=180',
  './content-2.html?v=180',
  './content-3.html?v=180',
  './content-4.html?v=180',
  './content-5.html?v=180',
  './content-6.html?v=180',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{if(res&&res.status===200){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res}).catch(()=>caches.match(req)));
});
