const CACHE_NAME='girisim-sehri-v179';
const CORE=[
  './',
  './index.html',
  './styles.css?v=179',
  './bootstrap.js?v=179',
  './app.js?v=178',
  './v167.js?v=178',
  './v169.js?v=178',
  './loan-management.js?v=178',
  './realtime-finance.js?v=178',
  './state-integrity.js?v=178',
  './company-list-fix.js?v=178',
  './demo-balance-grant.js?v=178',
  './investment-visibility.js?v=179',
  './manifest.webmanifest',
  './content-1.html?v=178',
  './content-2.html?v=178',
  './content-3.html?v=178',
  './content-4.html?v=178',
  './content-5.html?v=178',
  './content-6.html?v=178',
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
