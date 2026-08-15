const CACHE_NAME='empire-of-trade-v185';
const CORE=[
  './',
  './index.html',
  './styles.css?v=185',
  './bootstrap.js?v=185',
  './app.js?v=185',
  './v167.js?v=185',
  './v169.js?v=185',
  './loan-management.js?v=185',
  './realtime-finance.js?v=185',
  './state-integrity.js?v=185',
  './company-list-fix.js?v=185',
  './demo-balance-grant.js?v=185',
  './investment-visibility.js?v=185',
  './manifest.webmanifest?v=185',
  './content-1.html?v=185',
  './content-2.html?v=185',
  './content-3.html?v=185',
  './content-4.html?v=185',
  './content-5.html?v=185',
  './content-6.html?v=185',
  './icon-192.png?v=185',
  './icon-512.png?v=185',
  './apple-touch-icon.png?v=185'
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
