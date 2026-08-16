const CACHE_NAME='empire-of-trade-v190';
const CORE=[
  './',
  './index.html',
  './styles.css?v=190',
  './bootstrap.js?v=190',
  './app.js?v=190',
  './v167.js?v=190',
  './v169.js?v=190',
  './loan-management.js?v=190',
  './realtime-finance.js?v=190',
  './state-integrity.js?v=190',
  './company-list-fix.js?v=190',
  './demo-balance-grant.js?v=190',
  './investment-visibility.js?v=190',
  './manifest.webmanifest?v=190',
  './content-1.html?v=190',
  './content-2.html?v=190',
  './content-3.html?v=190',
  './content-4.html?v=190',
  './content-5.html?v=190',
  './content-6.html?v=190',
  './icon-192.png?v=190',
  './icon-512.png?v=190',
  './apple-touch-icon.png?v=190'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.endsWith('/version.json')){
    event.respondWith(fetch(req,{cache:'no-store'}));
    return;
  }
  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{if(res&&res.status===200){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res}).catch(()=>caches.match(req)));
});
