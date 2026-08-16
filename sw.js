const CACHE_NAME='empire-of-trade-v186';
const CORE=[
  './',
  './index.html',
  './styles.css?v=186',
  './bootstrap.js?v=186',
  './app.js?v=186',
  './v167.js?v=186',
  './v169.js?v=186',
  './loan-management.js?v=186',
  './realtime-finance.js?v=186',
  './state-integrity.js?v=186',
  './company-list-fix.js?v=186',
  './demo-balance-grant.js?v=186',
  './investment-visibility.js?v=186',
  './manifest.webmanifest?v=186',
  './content-1.html?v=186',
  './content-2.html?v=186',
  './content-3.html?v=186',
  './content-4.html?v=186',
  './content-5.html?v=186',
  './content-6.html?v=186',
  './icon-192.png?v=186',
  './icon-512.png?v=186',
  './apple-touch-icon.png?v=186'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));
          return res;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(req,{cache:'no-store'})
      .then(res=>{
        if(res&&res.status===200){
          const copy=res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(req,copy));
        }
        return res;
      })
      .catch(()=>caches.match(req))
  );
});
